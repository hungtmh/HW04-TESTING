# HW04 — Automation Testing | Báo cáo chính

| | |
|---|---|
| **Sinh viên** | 23127195 |
| **Bài tập** | HW04-AI — Automation Testing |
| **SUT** | EShop (`eshop-sut`) — frontend-web + backend API |
| **Repository** | https://github.com/hungtmh/HW04-TESTING |
| **Công cụ** | Playwright 1.62.1 (Test Runner + HTML Reporter), Node.js 22.20.0 |
| **Trình duyệt** | Chromium 3xx / Firefox / WebKit (3 engine độc lập) |
| **Ngày thực hiện** | 2026-08-15 |

---

## 1. Chọn feature

Ba feature được giữ nguyên từ HW02, mỗi Pool một feature:

| Pool | Mã | Tên feature | Trạng thái HW04 |
|---|---|---|---|
| A | **FR-01** | Đăng ký tài khoản | ✅ Hoàn thành (tài liệu này) |
| B | **FR-09** | Mã giảm giá | ⏳ Chưa triển khai |
| C | **FR-14** | Quản lý danh mục (CRUD) | ⏳ Chưa triển khai |

> Báo cáo này mô tả **FR-01**. Hai feature còn lại sẽ được bổ sung theo cùng
> cấu trúc (spec riêng, data file riêng, 3 báo cáo HTML riêng).

---

## 2. Môi trường và cách chạy lại

```bash
# 1. Cài dependencies của bộ test
npm install
npx playwright install chromium firefox webkit

# 2. Cài và seed SUT (chỉ cần 1 lần)
npm --prefix eshop-sut/backend install
npm --prefix eshop-sut/frontend-web install
npm run sut:seed

# 3. Chạy FR-01 trên cả 3 browser, mỗi browser sinh 1 HTML report riêng
node scripts/run-multibrowser.mjs tests/fr01-register.spec.js

# 4. Kiểm chứng report có hiển thị "Run by: 23127195" + ISO timestamp
node scripts/verify-report-banner.mjs
```

`playwright.config.js` khai báo `webServer` cho cả backend (`:3000`) và
frontend-web (`:5173`) với `reuseExistingServer: true`, nên bộ test **tự khởi
động SUT** nếu chưa chạy — không cần thao tác thủ công.

### Ghi chú về BrowserStack

Yêu cầu "chạy trên ít nhất 3 trình duyệt" được đáp ứng bằng **3 engine thật**
mà Playwright điều khiển cục bộ: Chromium, Firefox (Gecko) và WebKit. Đây là ba
engine khác nhau về bản chất, không phải ba vỏ bọc của cùng một engine.

Tài khoản BrowserStack đã được cung cấp, nhưng để trỏ bộ test lên BrowserStack
cần `BROWSERSTACK_USERNAME` và `BROWSERSTACK_ACCESS_KEY` (lấy ở mục *Access Key*
trong trang Profile) — hai giá trị này chưa có nên phần chạy trên hạ tầng
BrowserStack chưa được cấu hình. Bộ test hiện tại đã tách sẵn `WEB_BASE_URL` /
`API_BASE_URL` qua biến môi trường nên việc chuyển sang grid từ xa chỉ là thay
`projects` trong config, không phải sửa spec.

---

## 3. Kiến trúc bộ test

```
tests/
├── data/
│   ├── fr01-password-rules.csv      ← ma trận quy tắc mật khẩu (10 case)
│   └── fr01-register-cases.json     ← happy path, required field, email, XSS/SQLi, boundary
├── pages/
│   └── RegisterPage.js              ← Page Object cho /register
├── utils/
│   ├── csv.js                       ← đọc CSV/JSON từ tests/data/
│   └── env.js                       ← hằng số + sinh email duy nhất
└── fr01-register.spec.js            ← 27 test case
scripts/
├── run-multibrowser.mjs             ← chạy lần lượt 3 engine, mỗi engine 1 report
└── verify-report-banner.mjs         ← chứng minh report hiển thị "Run by: 23127195"
```

**Data-driven:** toàn bộ dữ liệu test nằm trong `tests/data/*.csv` và
`tests/data/*.json`. Trong `fr01-register.spec.js` không có bất kỳ mảng/đối
tượng dữ liệu test nào được hardcode — spec chỉ đọc `readCsv()` / `readJson()`
rồi sinh test bằng vòng lặp.

### Các assertion pattern đã dùng (yêu cầu ≥ 3, thực tế 6)

| Mã | Pattern | Ví dụ |
|---|---|---|
| **P1** | Navigation / URL | `await expect(page).toHaveURL(/\/login$/)` |
| **P2** | Web-first element & text | `await expect(errorBox).toBeVisible()` / `.toContainText(...)` |
| **P3** | DOM property (HTML5 Constraint API) | `expect(validity).toMatchObject({ valueMissing: true })` |
| **P4** | Back-end API + shape của body | `expect(res.ok()).toBeTruthy()` + `expect(body).toMatchObject(...)` |
| **P5** | Element count | `await expect(errorBox).toHaveCount(0)` |
| **P6** | Runtime side-effect | `expect(await page.evaluate(f => window[f], flag)).toBeUndefined()` |

---

## 4. Danh sách test case FR-01 (27 case)

| Nhóm | Mã | Nội dung | Loại | Kết quả |
|---|---|---|---|---|
| 1 — Mật khẩu (CSV) | TC-01 | Mật khẩu hợp lệ theo luật đang hiện hành (`Password 123`) | Positive | ✅ Pass |
| | **TC-02** | **Mật khẩu đúng đặc tả (`Password123!`)** | Positive | ❌ **Fail → BUG-01** |
| | TC-03 | Mật khẩu < 8 ký tự | Negative | ✅ Pass |
| | TC-04 | Thiếu chữ hoa | Negative | ✅ Pass |
| | TC-05 | Thiếu chữ thường | Negative | ✅ Pass |
| | TC-06 | Thiếu chữ số | Negative | ✅ Pass |
| | TC-07 | Chỉ gồm chữ số | Negative | ✅ Pass |
| | TC-08 | Đúng 8 ký tự — biên dưới hợp lệ | Edge | ✅ Pass |
| | TC-09 | 7 ký tự — ngay dưới biên | Edge | ✅ Pass |
| | TC-10 | `Password123` (mạnh nhưng không có khoảng trắng) | Edge | ✅ Pass* |
| 2 — Happy path | TC-11 | Tên tiếng Việt có dấu | Positive | ✅ Pass |
| | TC-12 | Email dạng plus-tag | Positive | ✅ Pass |
| | TC-13 | Tên có nhiều khoảng trắng giữa các từ | Positive | ✅ Pass |
| 3 — Trường bắt buộc | TC-14 | Bỏ trống Họ Tên | Negative | ✅ Pass |
| | TC-15 | Bỏ trống Email | Negative | ✅ Pass |
| | TC-16 | Bỏ trống Mật khẩu | Negative | ✅ Pass |
| | TC-17 | Bỏ trống toàn bộ form | Negative | ✅ Pass |
| 4 — Định dạng email | **TC-18** | Email `abc` (không có `@`, không domain) | Negative | ❌ **Fail → BUG-02** |
| | **TC-19** | Email `abc@` (thiếu domain) | Negative | ❌ **Fail → BUG-02** |
| | **TC-20** | Email `@domain.com` (thiếu local part) | Negative | ❌ **Fail → BUG-02** |
| | **TC-21** | Email `a b@domain.com` (có khoảng trắng) | Negative | ❌ **Fail → BUG-02** |
| 5 — Trùng lặp | **TC-22** | Email đã tồn tại | Negative | ❌ **Fail → BUG-03** |
| 6 — Bảo mật | TC-23 | XSS payload trong Họ Tên | Edge | ✅ Pass |
| | TC-24 | SQL injection payload trong Họ Tên | Edge | ✅ Pass |
| 7 — Biên | TC-25 | Họ Tên dài 255 ký tự | Edge | ✅ Pass |
| 8 — Lưu trữ | **TC-26** | Mật khẩu không được lưu/trả về plaintext | Negative | ❌ **Fail → BUG-04** |
| 9 — Nhất quán UI | **TC-27** | Hint trên UI phải khớp luật thực thi | Negative | ❌ **Fail → BUG-01** |

\* TC-10 "pass" theo nghĩa hệ thống từ chối đúng như test kỳ vọng, nhưng bản thân
việc từ chối `Password123` **là biểu hiện của BUG-01** — regex bắt buộc khoảng
trắng. Test này được ghi làm bằng chứng phụ cho BUG-01 chứ không phải xác nhận
hành vi đúng.

### Kết quả thực thi

| Browser | Tổng | Pass | Fail | Report |
|---|---|---|---|---|
| Chromium | 27 | 19 | 8 | `playwright-report/fr01-register-chromium/` |
| Firefox | 27 | 19 | 8 | `playwright-report/fr01-register-firefox/` |
| WebKit | 27 | 19 | 8 | `playwright-report/fr01-register-webkit/` |
| **Tổng** | **81** | **57** | **24** | 3 browser run |

Kết quả **giống hệt nhau trên cả 3 engine** — 24 lượt fail chính là 8 test gắn
nhãn `@bug` nhân với 3 browser. Không có test nào flaky sau khi sửa (mục 6, R-05).

### Test case chưa tự động hoá được

| Nội dung | Lý do |
|---|---|
| Xác minh email kích hoạt tài khoản | SUT không có luồng gửi/xác minh email; không có mail server để hứng thư |
| Kiểm tra CAPTCHA / rate limiting khi đăng ký hàng loạt | SUT không triển khai cơ chế này, không có gì để kiểm chứng |
| Kiểm tra độ mạnh mật khẩu hiển thị theo thời gian thực | Giao diện không có strength meter |

---

## 5. Bug phát hiện được

Chi tiết đầy đủ (steps to reproduce, expected/actual, ảnh chụp) nằm trong
[`../bug-report/BUG_REPORT.md`](../bug-report/BUG_REPORT.md).

| ID | Mức độ | Tóm tắt | Test phát hiện |
|---|---|---|---|
| **BUG-01** | High | Regex mật khẩu **bắt buộc khoảng trắng** và **cấm ký tự đặc biệt**, ngược hoàn toàn với hint hiển thị trên UI và với `api_specification.md` | TC-02, TC-27 (TC-10 bổ trợ) |
| **BUG-02** | High | Không validate định dạng email ở cả frontend lẫn backend; `abc`, `abc@`, `@domain.com` đều tạo được tài khoản | TC-18 → TC-21 |
| **BUG-03** | Critical | Email trùng tạo được nhiều tài khoản — cột `users.email` không có ràng buộc `UNIQUE` và `POST /api/register` không kiểm tra tồn tại | TC-22 |
| **BUG-04** | Critical | Mật khẩu lưu **plaintext** trong SQLite và bị **trả về nguyên văn** trong response của `POST /api/login` | TC-26 |
| **BUG-05** | High | *(ngoài phạm vi FR-01, phát hiện tình cờ)* `GET /api/admin/users` chỉ kiểm tra token hợp lệ, **không kiểm tra `role`** — người dùng thường đọc được toàn bộ danh sách tài khoản (đã kiểm chứng: token `role='user'` đọc được 52 dòng). Thuộc phạm vi FR-12. | Phát hiện khi xây helper `countAccountsByEmail()` |
| **BUG-06** | Low | *(lỗi tài liệu)* `setup_guide.md` ghi mật khẩu admin là `admin123`, trong khi seed thực tế là `Admin123!` — kết hợp với lỗi khoá tài khoản của FR-02, chỉ 2 lần thử theo tài liệu là admin bị khoá 180 giây | Phát hiện khi truy nguyên R-08 |

---

## 6. Human review — AI đã sai/thiếu ở đâu

Đây là phần trọng tâm: bản nháp do AI sinh ra **không** dùng được ngay. Dưới đây
là các lỗi thực tế đã phát hiện khi review, cùng nguyên nhân.

### R-01 — Selector `getByLabel()` trả về 0 phần tử

**AI sinh ra:** `page.getByLabel('Họ Tên').fill(...)`

**Thực tế:** `Register.jsx` render `<label>` **không có `htmlFor`** và `<input>`
**không có `id`/`name`**, nên liên kết accessible-name không tồn tại. Kiểm chứng
bằng đoạn probe: `getByLabel("Họ Tên") -> count=0` cho cả 3 trường.

**Đã sửa thành:** neo vào `<div>` bọc trường (chứa text label) rồi lấy `<input>`
bên trong — xem `RegisterPage._fieldByLabel()`.

**Vì sao AI sai:** mô hình mặc định giả định form được viết đúng chuẩn
accessibility. Prompt ban đầu chỉ mô tả feature bằng lời, **không đính kèm DOM
thật**, nên AI suy diễn theo "form React điển hình" thay vì theo mã nguồn cụ thể.

### R-02 — Assert vào message validation của trình duyệt

**AI sinh ra:** `expect(input).toHaveAttribute('validationMessage', 'Please fill out this field')`

**Thực tế:** chuỗi này khác nhau giữa Chromium / Firefox / WebKit và đổi theo
ngôn ngữ hệ điều hành → test chỉ xanh trên đúng một máy.

**Đã sửa thành:** assert vào **Constraint Validation API**
(`el.validity.valueMissing`) — thuộc tính chuẩn hoá, giống nhau trên mọi engine.

**Vì sao AI sai:** giới hạn của mô hình khi suy luận về khác biệt cross-browser;
nó tối ưu cho "test chạy được ngay" trên một môi trường chứ không cho tính bền
vững đa nền tảng.

### R-03 — Assertion "chạy trước" khiến 4 test PASS GIẢ ⚠️ (nghiêm trọng nhất)

**AI sinh ra:** để chứng minh "tài khoản không được tạo", assert
`await expect(page).toHaveURL(/\/register$/)` ngay sau khi bấm nút.

**Thực tế:** ngay sau `click()`, SPA **chưa** resolve xong `POST /api/register`,
nên URL vẫn là `/register` **bất kể server quyết định gì**. Assertion khớp tức
thì và chuyển xanh. Hệ quả: 4 test TC-18 → TC-21 báo **PASS** trên một SUT thực
tế đang chấp nhận email rác — tức bộ test đã **che giấu BUG-02**.

**Đã sửa thành:** hỏi thẳng backend còn bao nhiêu dòng `users` mang email đó
(`countAccountsByEmail()` qua `GET /api/admin/users`). Sau khi sửa, cả 4 test
chuyển sang **FAIL** đúng như bản chất của lỗi.

**Vì sao AI sai:** đây là lỗi *logic thời gian*, không phải lỗi cú pháp — code
chạy được, test xanh, không có tín hiệu nào báo sai. AI không mô phỏng được thứ
tự sự kiện bất đồng bộ của ứng dụng cụ thể này. **Bài học: một test xanh không
chứng minh phần mềm đúng; nó có thể chỉ chứng minh assertion được đặt sai chỗ.**

### R-04 — `waitForTimeout()` cứng

**AI sinh ra:** `await page.waitForTimeout(2000)` sau mỗi thao tác điều hướng.

**Thực tế:** vừa chậm vừa flaky — 2000 ms thừa trên máy nhanh và thiếu khi
Vite đang bundling dependencies lần đầu.

**Đã sửa thành:** dùng web-first assertion (`await expect(heading).toBeVisible()`)
để chờ đúng điều kiện thay vì chờ theo đồng hồ.

### R-05 — Race giữa lời gọi API và request của SPA (chỉ lộ trên WebKit)

Trong nhóm test bảo mật, spec gọi `POST /api/login` ngay sau `register()` mà
không chờ request của trang hoàn tất. TC-23 vô tình che được lỗi vì có thêm một
`page.evaluate()` xen giữa tạo độ trễ; TC-24 không có bước đó nên **fail chỉ
trên WebKit** (engine chậm hơn) ở lần chạy đa trình duyệt đầu tiên.

**Đã sửa thành:** chờ `await expect(page).toHaveURL(/\/login$/)` trước khi gọi
API. Sau khi sửa, kết quả 3 engine đồng nhất 19/8.

**Điểm đáng chú ý:** đây là lỗi của **bộ test**, không phải của SUT — và nó chỉ
lộ ra nhờ yêu cầu chạy đa trình duyệt. Nếu chỉ chạy Chromium thì flake này vẫn
nằm im trong bộ test.

### R-06 — Dữ liệu test hardcode trong spec

Bản nháp nhét thẳng mảng object vào file spec. Đề bài **cấm** điều này. Đã tách
toàn bộ sang `tests/data/fr01-password-rules.csv` và
`tests/data/fr01-register-cases.json`, viết thêm `utils/csv.js` để đọc.

### R-07 — AI mô tả lại hành vi đang có thay vì hành vi đặc tả

Khi được đưa mã nguồn, AI có xu hướng viết test **khớp với code hiện tại**: nó
đề xuất case "mật khẩu `Password123!` → kỳ vọng bị từ chối" vì đọc regex thấy
vậy. Test kiểu đó **luôn xanh và không bao giờ tìm ra lỗi** — nó biến bug thành
đặc tả. Người review phải chủ động đối chiếu với `api_specification.md` và với
hint hiển thị trên UI để đặt kỳ vọng theo **cái đúng**, chấp nhận test đỏ.

Đây là lý do 8 test trong bộ này **cố ý fail**: mỗi test đỏ ánh xạ 1-1 tới một
bug đã được ghi nhận, thay vì được "nới" cho xanh.

### R-08 — Năm test đỏ vì SAI LÝ DO ⚠️

Sau khi sửa R-03, bộ test cho kết quả 19 pass / 8 fail — con số **trùng khớp** với
kỳ vọng. Nếu dừng ở đó thì báo cáo đã kết luận sai hoàn toàn.

Khi đọc kỹ thông báo lỗi của từng test, 5/8 test fail với message:

```
Error: admin login must succeed to inspect user rows
```

tức chúng đỏ vì **helper hỏng**, không phải vì BUG-02/BUG-03. Truy nguyên: helper
`countAccountsByEmail()` đăng nhập admin bằng mật khẩu `admin123` lấy từ
`setup_guide.md`, trong khi seed thực tế ghi `Admin123!` (BUG-06). Do FR-02 cộng
`login_attempts + 2` với ngưỡng khoá là 3, **chỉ 2 lần thử sai đã khoá tài khoản
admin 180 giây** — và trong lúc khoá, hệ thống kiểm tra khoá *trước* khi so mật
khẩu nên ngay cả mật khẩu đúng cũng bị từ chối. Helper đăng nhập lại ở mỗi lần
gọi nên vòng lặp khoá tự duy trì.

**Đã sửa:** lấy mật khẩu từ **seed script (nguồn chân lý)** thay vì từ tài liệu;
cache token admin một lần cho cả lần chạy; thêm status + body vào message của
assertion để lần sau lỗi tự nói ra nguyên nhân; reseed DB rồi chạy lại.

Sau khi sửa, message của từng test fail khớp đúng defect:

```
[TC-18] email "abc" must not create a user row — Expected: 0
[TC-22] a duplicate e-mail must not create a second account — Expected: 1
[TC-26] expect(received).not.toBe("Password 123")
[TC-02] toHaveURL /\/login$/ — Received "http://localhost:5173/register"
```

**Bài học:** con số pass/fail không đủ để kết luận. **Phải đọc *lý do* test đỏ**,
vì một test có thể đỏ đúng số lượng nhưng sai bản chất — và khi đó nó không chứng
minh được điều gì về SUT.

---

## 7. Tự đánh giá mức độ hoàn thành FR-01

| Tiêu chí đề bài | Yêu cầu | Đạt được |
|---|---|---|
| Số test case tự động hoá | ≥ 12 | **27** |
| Dữ liệu tách file riêng | `.csv` hoặc `.json` | **cả hai** |
| Assertion pattern | ≥ 3 | **6** |
| Số browser | ≥ 3 | **3** (Chromium/Firefox/WebKit) |
| Browser run | 3 cho feature này | **3** |
| HTML report có `Run by: {StudentID}` | bắt buộc | **có, kèm ISO timestamp**, đã chụp ảnh kiểm chứng |
| Review & phân tích lỗi của AI | bắt buộc | **8 phát hiện R-01 → R-08** |
| Bug report | nếu có | **6 bug** (4 thuộc FR-01, 2 phát hiện tình cờ) |

---

## 8. Việc còn lại

- [ ] FR-09 — Mã giảm giá: spec + data + 3 browser run
- [ ] FR-14 — Quản lý danh mục: spec + data + 3 browser run
- [ ] Tạo GitHub Issues cho BUG-01 → BUG-05, đính ảnh chụp
- [ ] Quay video demo ≥ 5 phút (tiếng Việt, có `whoami` + `hostname`)
- [ ] Đóng gói Agent Skill + video demo skill
- [ ] Đủ ≥ 8 commit chạm file `.spec.js`
