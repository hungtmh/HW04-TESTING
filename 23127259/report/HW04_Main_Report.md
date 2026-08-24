# HW04 - Automation Testing | Báo cáo chính

| | |
|---|---|
| **Sinh viên** | Nguyễn Tấn Thắng - 23127259 |
| **Bài tập** | HW04-AI - Automation Testing |
| **SUT** | EShop: frontend-web `:5173`, frontend-admin `:5174`, backend API `:3000` |
| **Repository** | https://github.com/hungtmh/HW04-TESTING |
| **Nhánh** | `codex/23127259-hw04-completion` |
| **Pull Request** | [#36 - MERGED](https://github.com/hungtmh/HW04-TESTING/pull/36), author/merger `thangak18` |
| **Công cụ** | Playwright Test + HTML/JSON Reporter, Node.js |
| **Trình duyệt** | Chromium / Firefox / WebKit - 3 engine độc lập |
| **Video demo** | NOT RECORDED YET |
| **Video Agent Skill** | NOT RECORDED YET |
| **Ngày** | 2026-08-24 |

---

## 1. Chọn feature

| Pool | Mã | Tên feature | Giao diện/API | Test case |
|---|---|---|---|---:|
| A | FR-02 | Login & Account Lockout | Web `/login` + API `/api/login` | 16 |
| B | FR-07 | Shopping Cart | Web `/`, `/cart`, `/checkout` | 17 |
| C | FR-16 | Product Import CSV | Admin `:5174` + API import | 12 |

The three features are the required one-per-pool selection from Pools A, B, and C. The final suite contains 45 unique cases: FR-02 has 16, FR-07 has 17, and FR-16 has 12.

## 2. Tổng kết thực thi và traceability

| Feature | Primary SRS coverage | Test evidence |
|---|---|---|
| FR-02 | Valid/invalid login, HTML5 email, increment by one, threshold three, 30-second lock, reset, secure password handling, FR-21/22 form rules | `tests/fr02-login.spec.js` TC01-TC16 |
| FR-07 | Empty state, navigation, product/quantity/subtotal/total, removal, checkout, duplicate add, confirmation, +/- controls | `tests/fr07-cart.spec.js` TC01-TC17 |
| FR-16 | Valid import, preview, template, extension, row validation, admin authorization, rollback, positive price, RFC 4180 | `tests/fr16-import-csv.spec.js` TC01-TC12 |

| Feature | Test case | Pass/browser | `@bug` fail/browser | Browser | Tổng lượt |
|---|---:|---:|---:|---:|---:|
| FR-02 | 16 | 6 | 10 | 3 | 48 |
| FR-07 | 17 | 11 | 6 | 3 | 51 |
| FR-16 | 12 | 7 | 5 | 3 | 36 |
| **Tổng** | **45** | **72 lượt pass** | **63 lượt fail** | **9 run** | **135** |

Ba engine cho kết quả trùng khớp. 63 lượt fail đến từ 21 test `@bug`; runner quét JSON và xác nhận `unexpectedFailures = 0` trong cả chín report.

## 3. Chi tiết từng feature

### 3.1 FR-02 - Login & Account Lockout

| Nhóm | Test | Nội dung | Kết quả/browser |
|---|---|---|---|
| Credential DDT | TC01-TC06 | valid, wrong password, email không tồn tại, empty, malformed | 5 pass, 1 fail |
| Counter/lock | TC07-TC10 | +1, ngưỡng 3, 30 giây, reset | 1 pass, 3 fail |
| Form/UI | TC11-TC15 | H1, email/password type, ngôn ngữ, vị trí error | 5 fail |
| Security | TC16 | response không được lộ password | 1 fail |

FR-02 dùng CSV cho ma trận credential và API admin để đọc `login_attempts`/`locked_until`. Nhờ vậy test bắt được lỗi counter +2 và 180 giây mà chỉ quan sát UI không đủ chứng minh.

### 3.2 FR-07 - Shopping Cart

| Nhóm | Test | Nội dung | Kết quả/browser |
|---|---|---|---|
| Empty/navigation | TC01-TC02 | message, link quay về home | 2 pass |
| Product CSV | TC03-TC06 | tên, quantity, subtotal của 4 sản phẩm | 4 pass |
| Cart flow | TC07-TC11 | exact total, remove, checkout guest/user | 5 pass |
| SRS defects | TC12-TC17 | merge row, confirm, label, +/-, illustration, copy | 6 fail |

Cart của SUT chỉ lưu trong React Context. Sau khi add, test phải click link header (client-side routing); `page.goto('/cart')` sẽ reload và xóa state, tạo failure sai nguyên nhân.

### 3.3 FR-16 - Product Import CSV

| Nhóm | Test | Nội dung | Kết quả/browser |
|---|---|---|---|
| Happy/UI | TC01-TC05 | valid import, preview, template, enable button, row error | 5 pass |
| Authorization | TC06-TC07 | customer token / missing token | 1 pass, 1 fail |
| API validation | TC08-TC10 | empty, rollback, positive price | 1 pass, 2 fail |
| CSV contract | TC11-TC12 | RFC 4180, accept=.csv | 2 fail |

POM FR-16 login bằng placeholder thật, click tab Sản phẩm và scope locator trong import panel; nhờ đó bảy case xanh không còn timeout do selector.

## 4. Kiến trúc bộ test

### Page Object Model

`LoginPage`, `CartPage`, and `AdminImportPage` own locators and user flows. A significant correction was made to `CartPage`: after arranging products, the suite clicks the React Router cart link instead of calling `page.goto('/cart')`. A full reload destroys the in-memory `CartContext` and previously produced false failures.

The admin POM was also corrected to use the actual login placeholders and `Login` button, then open the Products tab before locating the import panel. All import locators are scoped to that panel so the preview table is not confused with the product table.

### Data-Driven Testing

Credentials, product rows, messages, boundaries, API payloads, and expected labels live in `tests/data/*.csv` or `*.json`. The specs iterate CSV rows and reference JSON payloads; no test-only fixture is imported without use. FR-16 uploads three physical CSV fixtures, including an RFC 4180 quoted-comma case.

### Assertion Patterns

The suite uses more than three patterns: URL/navigation, visibility/text, count, HTML attribute and validity, API status/body, exact money calculation, modal event, and backend state through the admin API.

## 5. Human review - AI đã sai/thiếu ở đâu

### R-01 - CSV được import nhưng không drive test

**AI sinh:** `const csvCases = readCsv(...)` rồi tiếp tục hardcode credential trong spec. **Sửa:** vòng lặp sinh TC01-TC06 từ CSV; JSON chứa message/boundary/payload.

### R-02 - Reload làm mất cart state và tạo 12 failure giả

**AI sinh:** add sản phẩm rồi `page.goto('/cart')`. **Thực tế:** full reload khởi tạo lại `CartProvider`. **Sửa:** click `header a[href="/cart"]` để giữ SPA state.

### R-03 - Selector admin đoán theo form chuẩn

AI giả định `input[type=email]` và button “Đăng Nhập”. DOM thật dùng placeholder `Email` và button `Login`. POM được sửa sau khi probe DOM.

### R-04 - Quên mở tab Sản phẩm

Import panel không có ở Dashboard mặc định. Flow đúng phải login, chờ sidebar, click Sản phẩm, chờ heading Import.

### R-05 - Selector table không scope

`table.bg-white tbody tr` match cả product list và preview, làm TC01 nhận 8 row thay vì 3. **Sửa:** neo từ heading Import và chỉ tìm table trong panel.

### R-06 - Assertion tổng tiền quá yếu

Kiểm tra chuỗi có `₫` không chứng minh phép tính. **Sửa:** parse số tiền và so sánh exact subtotal/total từ CSV.

### R-07 - Test lockout bỏ qua response quyết định

Bản cũ không assert response lần hai/ba nên lỗi khóa sớm lại pass. **Sửa:** assert chuỗi `[401,401,401]` và đọc state server.

### R-08 - Red test do thiếu browser bị ghi nhầm thành bug

Firefox/WebKit ban đầu fail vì executable không tồn tại. Đây là infrastructure error. **Sửa:** cài engine, rerun 9 report và phân loại `unexpectedFailures`.

### R-09 - Runner luôn exit 0

Bản cũ che cả harness failure. Runner mới chỉ chấp nhận failure có tag/title `@bug`; non-bug/infrastructure failure làm exit code khác 0.

### R-10 - Số bug/report được khai bằng tay

Bản cũ khai 19/19 pass/fail nhưng JSON thực tế khác. Bản cuối lấy số liệu từ summary JSON: 72 pass, 63 bug failure, 0 unexpected.

## 6. Multi-Browser Results

Each feature ran independently on Chromium, Firefox, and WebKit. Every report contains `Run by: 23127259` and an ISO timestamp; nine screenshots in `evidence/report-screenshots/` verify visible attribution.

| Feature | Chromium | Firefox | WebKit | Unexpected failures |
|---|---|---|---|---:|
| FR-02 | 6 Pass / 10 `@bug` Fail | 6 / 10 | 6 / 10 | 0 |
| FR-07 | 11 Pass / 6 `@bug` Fail | 11 / 6 | 11 / 6 | 0 |
| FR-16 | 7 Pass / 5 `@bug` Fail | 7 / 5 | 7 / 5 | 0 |

The matrix totals 135 executions: 72 passed and 63 intentional failures corresponding to 21 failing cases across three browsers. Results are consistent across engines.

## 7. Bug phát hiện được

Twenty root defects were confirmed. The 21 `@bug` cases map to 20 Issues because FR-02 TC05 and TC12 verify two consequences of the same wrong email input contract. Details, steps, expected/actual, fix and evidence are in `bug-report/BUG_REPORT.md`; the README provides the Issue index.

## 8. Đối chiếu yêu cầu và cách chạy

```bash
npm run test:multibrowser:all
node scripts/verify-report-banner.mjs
```

`scripts/run-multibrowser.mjs` classifies red `@bug` cases separately from unexpected failures and returns non-zero only for infrastructure or non-bug failures. This prevents known product defects from stopping the matrix while still detecting a broken suite.

| Yêu cầu | Trạng thái |
|---|---|
| 3 feature A/B/C | Đạt: FR-02/FR-07/FR-16 |
| >= 12 case/feature | Đạt: 16/17/12 |
| CSV/JSON DDT | Đạt, data thực sự drive test |
| >= 3 assertion pattern | Đạt: 8 pattern |
| 3 browser/feature | Đạt: 9 report |
| Student ID + ISO trong report | Đạt: 9/9, có screenshot |
| Human review | Đạt: R-01 -> R-10 |
| Bug report/Issue/evidence | Đạt: #16-#35, author `thangak18`, kèm 20 evidence image |
| Video >= 5 phút | Chưa: sinh viên phải tự quay |

## 9. Video và Agent Skill

- **Main demo:** `NOT RECORDED YET`; kịch bản trong `video-script/VIDEO_1_DEMO_SCRIPT.md`.
- **Agent Skill demo:** `NOT RECORDED YET`; kịch bản trong `video-script/VIDEO_2_AGENT_SKILL_SCRIPT.md`.
- **Skill:** `agent-skill/SKILL.md`; bản giải trình trong `agent-skill/AGENT_SKILL.md`. Không có test case nào còn chưa tự động hóa; hai video là phần duy nhất còn cần danh tính/giọng nói sinh viên.
