# HW04 — AI-DRIVEN AUTOMATION TESTING · BÁO CÁO CHÍNH

| | |
|---|---|
| **Môn** | Kiểm thử phần mềm |
| **Sinh viên** | Ninh Văn Khải |
| **MSSV** | **23127060** |
| **SUT** | EShop (`eshop-sut/`) — Express 5 + SQLite + React/Vite |
| **Feature phụ trách** | FR-03 Quên/Đặt lại mật khẩu · FR-08 Thanh toán · FR-15 Quản lý sản phẩm |
| **Framework** | Playwright Test 1.62.1 (JavaScript, ESM) |
| **Trình duyệt** | Chromium · Firefox · WebKit |
| **AI tool sử dụng** | Claude Code (CLI) — model `claude-opus-5` · Notion AI (phân tích đề, thiết kế SKILL.md) |

---

## 1. Tóm tắt kết quả

| Chỉ tiêu | Yêu cầu | Đạt được |
|---|---|---|
| Test case tự động / feature | ≥ 12 | **FR-03: 31 · FR-08: 26 · FR-15: 26** |
| Tổng test case | ≥ 36 | **83** |
| Lần chạy multi-browser | 9 (3 feature × 3 browser) | **9/9 · 249 test · 249 passed · 0 failed · 0 flaky** |
| Assertion pattern khác nhau | ≥ 3 | **5** (A1–A5, §4) |
| Data-driven | không hardcode inline | **77 record** trong 6 file JSON/CSV, 0 mảng dữ liệu inline |
| Bug phát hiện | ≥ 3 / feature | **27 bug** (FR-03: 8 · FR-08: 9 · FR-15: 10) — trong đó **9 Critical** |
| Commit chạm `*.spec.js` | ≥ 8 | **9 commit** — xem `evidence/git-commit-log-files.txt` |
| Banner chống gian lận | mọi report | **9/9 report** có `Run by: 23127060` + ISO timestamp, verify script pass |

**Số liệu chi tiết:** `report/03-RUN-SUMMARY.md` (sinh tự động từ `results.json`, không nhập tay số nào).

---

## 2. Phạm vi & môi trường

### 2.1 Cổng dịch vụ (đã xác minh bằng `curl`)

| Thành phần | URL | Ghi chú |
|---|---|---|
| Backend | `http://localhost:3000` | **cố định** — FE hardcode URL này trong source |
| Frontend-web | `http://localhost:5173` | Vite tự cấp |
| Frontend-admin | `http://localhost:5174` | Vite tự cấp; thiếu `node_modules` khi bắt đầu → đã `npm install` |

Test đọc URL từ ENV (`automation/tests/utils/env.js`) nên đổi port không cần sửa code.

### 2.2 Ràng buộc quan trọng của SUT ảnh hưởng tới thiết kế test

1. **CSDL bị `DROP` và seed lại mỗi lần khởi động backend** (`database.js:14-20`)
   ⇒ test **không được** phụ thuộc dữ liệu do test khác tạo. Mỗi test tự đăng ký user riêng bằng email
   `ts-<timestamp>-<seq>-<rand>@eshop.test`.
2. **Giỏ hàng nằm trong React Context in-memory** (`CartContext.jsx:7`), không `localStorage`
   ⇒ không seed được qua API; test luồng UI phải thêm sản phẩm bằng chính giao diện, trong cùng một phiên trang,
   và điều hướng bằng **link SPA** thay vì `page.goto` (goto = reload = mất giỏ).
3. **SUT dùng `alert()` thay cho toast** ở cả FR-03 và FR-15 ⇒ phải assert qua `page.on('dialog')`.
4. **Không có `data-testid`, `<label>` không có `htmlFor`** ⇒ `getByLabel()` vô dụng; selector dựa vào
   `getByRole` / `getByPlaceholder` / `getByText`, đọc trực tiếp từ JSX (mọi selector đều có comment dẫn số dòng).

---

## 3. Kiến trúc bộ test

```
23127060/automation/
├── playwright.config.js         banner "Run by: 23127060", 3 project browser, 0 retry
├── scripts/
│   ├── run-multibrowser.mjs     9 run, mỗi run 1 thư mục report
│   ├── banner-reporter.mjs      đóng dấu banner vào index.html
│   ├── verify-report-banner.mjs fail cứng nếu thiếu banner
│   ├── summarize-results.mjs    results.json → 03-RUN-SUMMARY.md
│   └── capture-bug-evidence.mjs chụp ảnh bug bằng Playwright thật
└── tests/
    ├── data/       6 file (3 JSON + 3 CSV) — 77 record
    ├── pages/      5 Page Object
    ├── utils/      env · csv · data · api · fixtures
    ├── fr03-forgot-reset.spec.js   31 test
    ├── fr08-checkout.spec.js       26 test
    └── fr15-product-crud.spec.js   26 test
```

### 3.1 Page Object

| File | Bọc màn hình | Điểm đáng lưu ý |
|---|---|---|
| `ForgotPasswordPage.js` | `/forgot-password` (2 bước cùng route) | Đọc OTP bằng regex trên text; `captureNextDialog()` |
| `LoginPage.js` | `/login` (tiền đề) | Nút submit tên **`Sign In`**, ô mật khẩu là `type="text"` |
| `CartPage.js` | Home + `/cart` | Thêm giỏ từ Home, **không** qua ProductDetail (nút ở đó nuốt click đầu tiên) |
| `CheckoutPage.js` | `/checkout` | Ô tổng tiền = `getByRole('spinbutton')` |
| `AdminProductPage.js` | admin SPA | Sidebar là `<li>`; `loginUi()` trả message alert hoặc `null` |

### 3.2 Data-driven

| Feature | File JSON (case phức) | File CSV (bảng boundary) |
|---|---|---|
| FR-03 | `fr03-reset-cases.json` (14) | `fr03-token-variants.csv` (14) |
| FR-08 | `fr08-checkout-cases.json` (13) | `fr08-order-totals.csv` (11) |
| FR-15 | `fr15-product-cases.json` (12) | `fr15-product-fields.csv` (13) |

CSV dùng sentinel để biểu diễn giá trị không mã hoá trực tiếp được:
`__VALID__` · `__EMPTY__` · `__SPACES__` · `__MISSING__` · `__UNIQUE__`.
Mỗi record mang 2 cột truy vết: `bug` (mã bug dự kiến) và `source` (số dòng file SUT làm căn cứ expected).

---

## 4. Năm assertion pattern được sử dụng

| Mã | Pattern | Ví dụ thật trong code | Dùng ở |
|---|---|---|---|
| **A1** | UI state / text | `await expect(checkoutPage.successHeading).toBeVisible()` | cả 3 feature |
| **A2** | Navigation / URL | `await expect(page).toHaveURL(/\/login$/)` | FR-03, FR-08 |
| **A3** | API / back-end state | `expect(orders[0].total_amount).toBe(1)` sau khi thao tác trên UI | cả 3 feature |
| **A4** | Số học / boundary | `expect(finalAmount).toBe(subtotal * 10)`; boundary 499999/500000/500001 | FR-03, FR-08, FR-15 |
| **A5** | Dialog (`alert`) | `expect(await dialogPromise).toContain('Cập nhật thành công!')` | FR-03, FR-08, FR-15 |

**A5 là pattern phát sinh từ thực tế SUT:** EShop báo kết quả bằng `window.alert()` chứ không render toast vào DOM,
nên không có phần tử nào để `expect(...).toBeVisible()`. Bỏ qua pattern này thì mọi test luồng FR-03 đều
"pass" một cách vô nghĩa vì không kiểm tra được thông báo.

**Sức mạnh của việc kết hợp A1 + A3** thể hiện rõ nhất ở `FR15-TC05`: chỉ nhìn UI thì thấy 6 sản phẩm bị đổi tên,
chỉ nhìn API thì thấy 1 bản ghi đổi tên. Ghép hai assertion lại mới **chứng minh được lỗi nằm ở frontend**,
không phải backend — điều mà một assertion đơn lẻ không thể kết luận.

---

## 5. Kết quả 9 lần chạy multi-browser

| # | Report dir | Feature | Browser | Total | Passed | Failed | Flaky | Duration (s) |
|---|---|---|---|---|---|---|---|---|
| 1 | `fr03-reset-chromium` | FR-03 | chromium | 31 | 31 | 0 | 0 | 7.4 |
| 2 | `fr03-reset-firefox` | FR-03 | firefox | 31 | 31 | 0 | 0 | 11.9 |
| 3 | `fr03-reset-webkit` | FR-03 | webkit | 31 | 31 | 0 | 0 | 14.3 |
| 4 | `fr08-checkout-chromium` | FR-08 | chromium | 26 | 26 | 0 | 0 | 6.6 |
| 5 | `fr08-checkout-firefox` | FR-08 | firefox | 26 | 26 | 0 | 0 | 11.1 |
| 6 | `fr08-checkout-webkit` | FR-08 | webkit | 26 | 26 | 0 | 0 | 13.4 |
| 7 | `fr15-product-chromium` | FR-15 | chromium | 26 | 26 | 0 | 0 | 5.6 |
| 8 | `fr15-product-firefox` | FR-15 | firefox | 26 | 26 | 0 | 0 | 10.7 |
| 9 | `fr15-product-webkit` | FR-15 | webkit | 26 | 26 | 0 | 0 | 10.3 |
| | **TỔNG** | | | **249** | **249** | **0** | **0** | **91.5** |

> **Đọc đúng con số "249 passed":** phần lớn test được viết để **khẳng định hành vi sai hiện tại** của SUT
> (ví dụ: *"backend chấp nhận tổng tiền âm"* — pass nghĩa là backend **thật sự** chấp nhận).
> Test pass ⇒ **bug vẫn còn**. Khi SUT được vá, chính các test gắn mã `BUG-xx-xx` sẽ **fail** —
> đó là tín hiệu cần cập nhật kỳ vọng, không phải test hỏng. Cách viết này biến bộ test thành
> **bản đặc tả sống của các lỗi đã biết**, thay vì chỉ là danh sách pass/fail.

### 5.1 Banner chống gian lận

Cả 9 `index.html` đều chứa `Run by: 23127060 — <ISO timestamp>` ở thẻ `<title>` **và** ở một khối banner
hiển thị ngay đầu report. `node scripts/verify-report-banner.mjs` ⇒ `9/9 report hợp lệ`, exit code 0.

**Ghi chú kỹ thuật:** option `title` của html reporter **không còn tác dụng** ở Playwright 1.62 —
đã kiểm chứng bằng cách giải nén blob base64 trong `index.html`: `report.json` có `title: null`.
Vì vậy phải viết reporter tuỳ biến `banner-reporter.mjs` chạy sau html reporter để đóng dấu banner.
Mọi giá trị trên banner (số passed/failed/duration) lấy từ chính lần chạy đó, không nhập tay.

---

## 6. Bug phát hiện

| Feature | Critical | High | Medium | Tổng |
|---|---|---|---|---|
| FR-03 | 3 | 4 | 1 | 8 |
| FR-08 | 4 | 3 | 3 | 10* |
| FR-15 | 3 | 3 | 5 | 11* |
| **Tổng** | **9** | **10** | **8** | **27** |

<sub>*BUG-15-11 (XSS) là lỗi cross-feature; bảng đếm theo feature nơi phát hiện.</sub>

### 6.1 Năm bug nghiêm trọng nhất

| ID | Mô tả một câu | Vì sao nghiêm trọng |
|---|---|---|
| **BUG-08-07** | Mã `SAVE10` (giảm 10%) làm tổng tiền **tăng gấp 10** — 30.000.000 ₫ thành 300.000.000 ₫ | Công thức `total * (1 - discount_value)` lẫn "tỉ lệ giảm" với "hệ số còn lại" và quên chia 100. Khách hàng bị tính sai tiền ngay trên màn hình mà UI vẫn báo "Áp dụng thành công! Giảm 10%" |
| **BUG-08-01** | Ô "Tổng tiền thanh toán" sửa được; đặt `1` là mua hàng 30 triệu với giá 1 đồng | Backend tin tuyệt đối `total_amount` do client gửi. Thiệt hại tài chính trực tiếp |
| **BUG-08-04** | `GET /api/orders/:id` **không có** middleware xác thực | id đơn là số tự tăng ⇒ duyệt `1..N` lấy được toàn bộ đơn hàng + địa chỉ giao hàng của mọi khách |
| **BUG-15-02** | `POST/PUT/DELETE /api/products` **không cần đăng nhập** | Bất kỳ ai cũng xoá sạch được catalogue bằng một vòng lặp. Các route khác *có* middleware ⇒ đây là thiếu sót bị bỏ quên |
| **BUG-15-01** | Sửa 1 sản phẩm làm **cả bảng** đổi sang cùng một tên | Admin nhìn thấy dữ liệu hoàn toàn sai; rủi ro bấm **Xóa** nhầm vì mọi dòng trông giống hệt nhau |

Chi tiết đầy đủ 27 bug: `bug-report/BUG_REPORT.md`. Ảnh minh chứng: `evidence/bugs/` (11 ảnh PNG thật do
`capture-bug-evidence.mjs` chụp bằng Playwright, kèm `capture-log.txt` chứa log response nguyên văn).

### 6.2 Hai bug được phát hiện thêm so với danh sách dự kiến ban đầu

Kế hoạch ban đầu (SKILL.md §2) liệt kê sẵn các "bug candidate". Trong Phase 0, việc đọc kỹ `server.js`
đã phát hiện thêm **2 bug không có trong danh sách đó**:

- **BUG-08-07** (coupon nghịch dấu) — chỉ lộ ra khi tính tay công thức ở `server.js:432`.
- **BUG-08-08** (off-by-one `>` vs `>=` ở `min_order_amount`) — chỉ lộ ra khi thiết kế bảng boundary 3 mốc
  499.999 / 500.000 / 500.001. Nếu chỉ test "đơn đủ lớn" và "đơn quá nhỏ" thì mốc giữa hoàn toàn bị bỏ sót.

Đây là bằng chứng cho thấy **kỹ thuật thiết kế test case (phân tích giá trị biên) vẫn là thứ tìm ra bug**,
chứ không phải bản thân việc dùng AI.

---

## 7. Quy trình làm việc với AI

| Phase | Nội dung | Sản phẩm |
|---|---|---|
| P0 | Recon SUT, xác minh 9 hành vi lỗi bằng `curl` | `report/00-SUT-RECON.md` |
| P1 | Thiết kế 54 test case (bảng chuẩn, dẫn nguồn expected) | `report/01-TEST-CASES.md` |
| P2 | Sinh 6 file dữ liệu, 77 record | `automation/tests/data/` |
| P3 | 5 Page Object + 3 spec, chạy tới khi ổn định `--repeat-each=2` | `automation/tests/` |
| P4 | Tự phê bình, tìm GAP-00..07, vá lại | `report/02-AI-GAP-ANALYSIS.md` |
| P5 | 9 run multi-browser + verify banner + bảng số liệu | `report/03-RUN-SUMMARY.md` |
| P6 | 27 bug + script chụp ảnh minh chứng | `bug-report/`, `evidence/bugs/` |
| P7 | Tài liệu | `report/`, `ai/`, `README.md` |
| P8 | Bổ sung 3 test, vá GAP-08/09, đóng gói | `evidence/git-commit-log*.txt` |

Mỗi phase = 1 commit riêng + 1 entry trong `ai/AI_Log.md`.
Toàn bộ hội thoại với AI được ghi lại trong `ai/AI_Log.md` (10 entry) và tổng hợp thành `ai/AI_Audit_Report.md`.

### 7.1 Bốn lỗi AI đáng chú ý nhất (chi tiết ở `report/02-AI-GAP-ANALYSIS.md`)

1. **AI tự tin về API mà nó nắm sai.** AI viết trong Page Object rằng *"Playwright không expose role cho
   `input[type=password]`"* — sai, và tệ hơn là nó **viết cả comment giải thích** cho giả định chưa kiểm chứng đó.
   9/30 test FR-03 fail với `strict mode violation`. Chỉ có chạy thật mới lộ ra.
2. **Đếm số lượng assertion thay vì chất lượng.** Khi rubric yêu cầu "≥3 assertion pattern", AI nhồi thêm những
   assertion không kiểm thử gì — ví dụ `expect(c.expect.minRows).toBe(SEED_PRODUCT_COUNT)` chỉ so hằng số với hằng số.
3. **Bỏ qua trạng thái môi trường và tính đồng thời.** AI mặc định máy đã cài đủ browser (thực tế firefox/webkit
   chưa tải, kết quả "52 passed" trông như thành công một phần nhưng thực chất 28 test không chạy nổi),
   và viết test như thể chỉ có một mình nó truy cập CSDL.
4. **Chỉ kiểm chứng trên trình duyệt nhanh nhất.** Hai lỗi chờ (GAP-08, GAP-09) pass sạch trên chromium
   **kể cả với `--repeat-each=2`**, chỉ lộ ra khi chạy WebKit ở Phase 8. Cả hai đến từ cùng một thói quen:
   lấy phép đọc DOM **không có cơ chế chờ** (`isVisible()`, `count()`) làm mốc thay vì web-first assertion.
   Bài học: "ổn định 2 lần liên tiếp trên 1 browser" không đồng nghĩa với ổn định.

---

## 8. Case không automate được (và lý do)

| Feature | Case | Lý do kỹ thuật |
|---|---|---|
| FR-03 | Kiểm tra email khôi phục thật sự tới hộp thư | SUT **không gửi email**, trả token thẳng trong response |
| FR-03 | Token hết hạn sau N phút | `server.js` không lưu thời điểm phát hành token ⇒ không có expiry để kiểm |
| FR-03 | Mở khoá tài khoản sau 180 giây | Phải chờ thật 3 phút ⇒ vi phạm quy tắc cấm wait dài; chỉ assert trạng thái *đang khoá* |
| FR-08 | Cổng thanh toán thật (VNPay/Momo) | SUT không tích hợp cổng nào |
| FR-08 | Trừ tồn kho, race condition mua món cuối | Bảng `products` **không có cột stock** ⇒ không có gì để assert |
| FR-15 | Upload ảnh sản phẩm | Form chỉ có ô nhập **URL ảnh**, không có upload file |
| FR-15 | Xoá sản phẩm đang nằm trong đơn đã đặt | Bảng `orders` **không lưu order_items** ⇒ không có quan hệ để kiểm tra dữ liệu mồ côi |
| FR-15 | Ảnh hiển thị đúng từ CDN | Phụ thuộc mạng ngoài (`placehold.co`) ⇒ test sẽ flaky |

---

## 9. Tự đánh giá

| Tiêu chí | Điểm tối đa | Tự chấm | Căn cứ |
|---|---|---|---|
| FR-03 automation | 25 | 🧑 *Khải điền* | 31 test, 3 browser, 8 bug, 100% pass |
| FR-08 automation | 25 | 🧑 *Khải điền* | 26 test, 3 browser, 9 bug (4 Critical), 100% pass |
| FR-15 automation | 25 | 🧑 *Khải điền* | 26 test, 3 browser, 10 bug, 100% pass |
| Báo cáo & AI Audit | 25 | 🧑 *Khải điền* | Main Report, Bug Report 27 bug, Gap Analysis 9 GAP, AI Log 12 entry, AI Critique 296 từ |

**🧑 Việc Khải còn phải làm:** xem checklist ở `README.md` §Bàn giao.

---

## 10. Phụ lục — FR-20 Mobile

Theo đề §5, HW04 **chỉ tính 3 feature web** (Pool A/B/C); Pool D (FR-20 Mobile) **không** dùng cho HW04
và **không** thay thế được FR-03/08/15. `frontend-mobile` là Expo/React Native nên Playwright không chạy trực tiếp;
nếu cần làm thêm thì phải qua `expo start --web` (react-native-web) hoặc test ở tầng API.
**Không có test FR-20 nào được viết trong bài này** — ghi rõ để tránh hiểu nhầm là thay thế feature web.
