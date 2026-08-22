# AI Log — HW04 Automation Testing (EShop)

> File append-only. Mỗi lượt hội thoại với AI = 1 entry. Dùng để sinh `AI_Audit_Report.md` (§9 đề bài) và `AI_Critique.md` (§10).

- **Sinh viên:** Ninh Văn Khải — MSSV 23127060
- **Feature:** FR-03 (Quên/Đặt lại mật khẩu), FR-08 (Thanh toán), FR-15 (Quản lý sản phẩm)
- **AI tools khai báo:** Claude Code (CLI) — sinh/refactor script Playwright, viết tài liệu; Notion AI — phân tích đề & thiết kế SKILL.md
- **Khai báo bắt buộc:** *"I use AI tools for the following tasks"* (chi tiết từng entry bên dưới)
- **Timezone:** Asia/Ho_Chi_Minh (+07:00)

| Verdict | Ý nghĩa |
|---|---|
| Accepted | Dùng nguyên output của AI |
| Accepted-with-fix | Dùng sau khi người review sửa |
| Rejected | Bỏ output, tự làm lại |

---

## LOG-001 — Phân tích đề HW04 & thiết kế SKILL.md cho 23127060

- **AI tool:** Notion AI
- **Thời điểm:** 2026-08-22T15:40:12+07:00
- **Phase:** P-init — chuẩn bị quy trình
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**

> Tôi là Ninh Văn Khải, MSSV: 23127060, tôi cần bạn giúp tôi phân tích đề bài, thiết kế ra SKILL.md để guildline AI agent làm việc, chia task từng bước, hỗ trợ tui trong quá trình test và viết báo cáo. phần nào MCP làm được thì cho Claude Agent (tôi có claude cli) làm luôn, còn phần nào cần human verified thì để tui. Đây là nhóm tính năng tôi sẽ làm: Pool A: FR-03 Quên mật khẩu & Đặt lại mật khẩu; Pool B: FR-08 Thanh toán; Pool C: FR-15 Quản lý sản phẩm; Pool D (Mobile): Giỏ hàng và Thanh toán (FR-20). […kèm đề bài HW04, cây thư mục repo, và source backend server.js / database.js / package.json…] vì tôi cần trace lại các prompt và viết vào để tạo AI_Audit_Report nên nhớ nhắc Agent làm việc này mỗi khi tôi hỏi nó (thêm chức năng này vào Skill.md). Một file AI_log.md sẽ có các mục như vậy ứng với từng đoạn chat. Vì tôi làm với nhóm tôi, nên có lẽ tôi sẽ viết 1 file Skill.md mới, và kêu AI không cần quan tâm đến các folder của 23127195 hay 23127259, chỉ quan tâm đến 23127060 thôi.

**AI output (tóm tắt):**
- Đọc `backend/server.js` + `database.js` để xác minh API/seed data thật, lập danh sách bug-candidate cho FR-03/FR-08/FR-15.
- Sinh `SKILL.md` (skill cho Claude CLI): luật scope chỉ `23127060/`, quy trình 9 phase, chuẩn data-driven, ≥3 assertion pattern, banner `Run by: 23127060`, quy tắc 8 commit spec, phân vai Agent vs Human, chức năng ghi AI Log bắt buộc mỗi lượt.
- Sinh file `AI_Log.md` khởi tạo kèm template entry.

**File tạo/sửa:**
- `23127060/agent-skill/SKILL.md` (mới)
- `23127060/ai/AI_Log.md` (mới)

**Lệnh đã chạy & kết quả thật:**
```
(chưa chạy test ở bước này — chỉ đọc source SUT)
```

**Human review (Khải):**
- Sai/thiếu: <điền sau khi đọc SKILL.md>
- Đã sửa: <…>

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>`

---

<!-- ================= COPY TEMPLATE DƯỚI ĐÂY CHO MỖI LƯỢT MỚI =================

## LOG-0XX — <tiêu đề ngắn việc đã làm>

- **AI tool:** Claude Code (CLI), model <ghi model thật>
- **Thời điểm:** <YYYY-MM-DDTHH:mm:ss+07:00>
- **Phase:** <P0 recon | P1 test case | P2 data | P3 spec | P4 review | P5 multi-browser | P6 bug | P7 docs | P8 đóng gói>
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> <dán nguyên văn, không tóm tắt>

**AI output (tóm tắt):**
- <ý chính>

**File tạo/sửa:**
- `<path>` (mới/sửa, số test)

**Lệnh đã chạy & kết quả thật:**
```
npx playwright test --project=chromium --grep @frXX
→ <passed/failed thật, không bịa>
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · bug `BUG-0X` · report `<report dir>`

============================================================================ -->

---

## LOG-002 — Phase 0: Recon SUT, dựng khung thư mục & xác minh API bằng curl

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T20:24:00+07:00
- **Phase:** P0 — Recon
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- Đọc `.claude/skills/eshop-automation-23127060/SKILL.md` (bản giống hệt `23127060/agent-skill/SKILL.md`), nắm luật scope + 9 phase.
- Kiểm tra môi trường: backend `:3000` sống, frontend-web `:5173` sống, frontend-admin **thiếu `node_modules`** → chạy `npm install` (node_modules đã nằm trong `.gitignore`, không đụng source SUT).
- Đọc source thật: `backend/server.js` (572 dòng), `backend/database.js`, `frontend-web/src/pages/{ForgotPassword,Cart,Checkout,Login,Home,ProductDetail}.jsx`, `context/{Cart,Auth}Context.jsx`, `frontend-admin/src/App.jsx` (922 dòng).
- Xác minh **bằng curl thật** 9 hành vi lỗi, đáng chú ý: `apply-coupon` percent tính nghịch dấu (`SAVE10` trên 1.000.000 ₫ → `final_amount = 10.000.000 ₫`), price tampering `total_amount=1` → 200, IDOR `GET /api/orders/1` không cần token, product CRUD không cần token.
- Phát hiện 3 điểm CLAUDE.md/cheat-sheet ghi **chưa khớp source**: nút login web là `Sign In` (không phải `Đăng nhập`), ô mật khẩu login là `type="text"`, nút "Thêm vào giỏ hàng" ở ProductDetail bỏ qua click đầu tiên.
- Dựng đủ cây thư mục §3, di chuyển `AI_Log/AI_Log.md` → `ai/AI_Log.md` cho đúng chuẩn.

**File tạo/sửa:**
- `23127060/report/00-SUT-RECON.md` (mới — bảng route ↔ selector ↔ API ↔ rủi ro, có số dòng dẫn nguồn)
- `23127060/automation/playwright.config.js` (mới — banner `Run by: 23127060` + ISO timestamp)
- `23127060/automation/package.json` (mới)
- `23127060/automation/tests/utils/{env,csv,data,api}.js` (mới)
- `23127060/ai/AI_Log.md` (di chuyển từ `23127060/AI_Log/`)

**Lệnh đã chạy & kết quả thật:**
```
curl -s http://localhost:3000/api/products            ⇒ 200, 5 sản phẩm seed
curl -s -o /dev/null -w "%{http_code}" :5173/          ⇒ 200
node -v                                                ⇒ v22.20.0
npx playwright --version                               ⇒ Version 1.62.1
POST /api/forgot-password {"email":"test@eshop.com"}   ⇒ 200 {"resetToken":"5860"}
POST /api/forgot-password {"email":"nobody-xyz@..."}   ⇒ 404 {"error":"User not found"}
POST /api/products (KHÔNG token, price:-5)             ⇒ 200 {"id":6}
DELETE /api/products/99999                             ⇒ 200 {"message":"Product deleted"}
GET  /api/products/2                                   ⇒ 200 price:"28000000"  (string)
GET  /api/products/9999                                ⇒ 200 {}
POST /api/checkout {"total_amount":1}                  ⇒ 200 {"orderId":1}
POST /api/apply-coupon {"code":"SAVE10","total_amount":1000000}
                                                       ⇒ 200 {"discount_amount":-9000000,"final_amount":10000000}
GET  /api/orders/1 (KHÔNG token)                       ⇒ 200 {…user_id:2…}
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · report `00-SUT-RECON.md`

---

## LOG-003 — Phase 1: Thiết kế 54 test case cho FR-03 / FR-08 / FR-15

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T20:38:00+07:00
- **Phase:** P1 — Test case design
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- Sinh `report/01-TEST-CASES.md`: **54 test case** (FR-03: 16, FR-08: 18, FR-15: 20) — vượt mốc 12 TC/feature.
- Mỗi TC có: ID · loại (P/N/E/S) · tiền đề · bước · dữ liệu · expected **dẫn số dòng source** · assertion pattern · cờ automate được.
- Khai báo 5 assertion pattern A1–A5 (thêm A5 = dialog vì SUT dùng `alert()` thay toast).
- Liệt kê 12 case **không automate được** kèm lý do kỹ thuật cụ thể (không có email service, không có cột stock, không có order_items, token không có expiry…).
- Phát hiện thêm 2 bug chưa có trong danh sách candidate của SKILL: **coupon percent nghịch dấu** (`server.js:432`) và **boundary `min_order_amount` dùng `>` thay vì `>=`** (`server.js:421`).

**File tạo/sửa:**
- `23127060/report/01-TEST-CASES.md` (mới, 54 TC)

**Lệnh đã chạy & kết quả thật:**
```
(Phase thiết kế — chưa chạy test. Expected của mọi TC được đối chiếu trực tiếp với
 source đã đọc ở Phase 0 và với kết quả curl đã ghi trong LOG-002.)
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · report `01-TEST-CASES.md`

---

## LOG-004 — Phase 2: Sinh 6 file dữ liệu JSON/CSV (77 record) map 1-1 với bảng test case

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T20:52:00+07:00
- **Phase:** P2 — Test data
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- Sinh đủ 6 file theo §3 SKILL: mỗi feature 1 JSON (case phức, có nhánh `flow: ui|api`) + 1 CSV (bảng boundary).
- Tổng **77 record dữ liệu**, phủ đúng 54 TC của Phase 1 (một số TC tách thành nhiều biến thể a/b/c).
- Dùng sentinel `__VALID__ / __EMPTY__ / __MISSING__ / __SPACES__ / __UNIQUE__` để biểu diễn giá trị mà CSV không mã hoá trực tiếp được (chuỗi rỗng, khoảng trắng, trường không gửi, giá trị sinh runtime).
- Mỗi record mang sẵn 2 cột truy vết: `bug` (mã bug dự kiến) và `source` (số dòng file SUT làm căn cứ expected).
- Viết `utils/csv.js` (parser tự làm, hỗ trợ ô bọc ngoặc kép) để không thêm dependency ngoài.

**File tạo/sửa:**
- `automation/tests/data/fr03-reset-cases.json` (mới, 14 record)
- `automation/tests/data/fr03-token-variants.csv` (mới, 14 record)
- `automation/tests/data/fr08-checkout-cases.json` (mới, 13 record)
- `automation/tests/data/fr08-order-totals.csv` (mới, 11 record)
- `automation/tests/data/fr15-product-cases.json` (mới, 12 record)
- `automation/tests/data/fr15-product-fields.csv` (mới, 13 record)

**Lệnh đã chạy & kết quả thật:**
```
node -e "<nap 6 file qua utils/data.js>"
⇒ fr03-reset-cases.json      14 rows
  fr03-token-variants.csv    14 rows
  fr08-checkout-cases.json   13 rows
  fr08-order-totals.csv      11 rows
  fr15-product-cases.json    12 rows
  fr15-product-fields.csv    13 rows
  (parse sạch, ô chứa dấu nháy đơn "' OR '1'='1" giữ nguyên đúng)
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>`

---

## LOG-005 — Phase 3 (FR-03): Page Object + spec 30 test, chạy thật trên chromium

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T21:10:00+07:00
- **Phase:** P3 — FR-03 spec generation
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- `ForgotPasswordPage.js`: bọc 2 bước của `/forgot-password`, đọc OTP bằng regex trên text, helper `captureNextDialog()` vì SUT báo kết quả bằng `alert()`.
- `LoginPage.js`: page object tiền đề; ghi chú rõ trang login của SUT dùng nút **`Sign In`** và ô mật khẩu là `type="text"`.
- `fr03-forgot-reset.spec.js`: **30 test**, 100% data-driven từ JSON + CSV, 0 dòng dữ liệu hardcode inline, 0 `waitForTimeout`.
- **AI TỰ SAI VÀ TỰ SỬA (ghi lại làm bằng chứng cho AI_Critique):** giả định "Playwright không coi `input[type=password]` là role textbox" là **SAI**. Run thật báo `strict mode violation: getByRole('textbox') resolved to 2 elements` → 9 test fail. Đã sửa thành `.first()` kèm comment giải thích nguyên nhân.
- Chống flaky có chủ đích: biến thể token `9999` trong CSV có xác suất 1/9000 trùng token thật → thêm vòng xin lại token cho tới khi khác.

**File tạo/sửa:**
- `automation/tests/pages/ForgotPasswordPage.js` (mới)
- `automation/tests/pages/LoginPage.js` (mới)
- `automation/tests/fr03-forgot-reset.spec.js` (mới, 30 test)

**Lệnh đã chạy & kết quả thật:**
```
npx playwright test --project=chromium --grep @fr03
⇒ LẦN 1: 9 failed, 21 passed  (strict mode violation ở getByRole('textbox'))
⇒ LẦN 2 (sau khi sửa .first()): 30 passed (7.8s)

npx playwright test --project=chromium --grep @fr03 --repeat-each=2
⇒ 60 passed (14.9s)   ← ổn định 2 lần liên tiếp theo yêu cầu §5 Phase 3
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · bug `BUG-03-01..08`

---

## LOG-006 — Phase 3 (FR-08): CartPage + CheckoutPage + spec 25 test

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T21:26:00+07:00
- **Phase:** P3 — FR-08 spec generation
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- `CartPage.js` + `CheckoutPage.js`: ô tổng tiền sửa được định vị bằng `getByRole('spinbutton')`; thêm hàng vào giỏ từ **Home** chứ không qua ProductDetail (nút ở đó cố tình nuốt click đầu tiên → nguồn flaky).
- `fr08-checkout.spec.js`: **25 test**. TC01 đăng nhập bằng **UI thật**; các test còn lại bơm JWT qua `addInitScript` để chạy nhanh.
- Xử lý đúng đặc thù giỏ hàng in-memory: TC09 điều hướng bằng **link SPA** (không `page.goto`) để giữ React Context; TC17 chủ động `reload()` để chứng minh giỏ bị mất.
- Bảng boundary coupon từ CSV tra `coupon_id` động qua `GET /api/coupons` thay vì hardcode id.
- Xác nhận bằng test thật: `SAVE10` trên giỏ 30.000.000 ₫ cho **Thành tiền 300.000.000 ₫** trong khi UI vẫn hiện "Áp dụng thành công! Giảm 10%".

**File tạo/sửa:**
- `automation/tests/pages/CartPage.js` (mới)
- `automation/tests/pages/CheckoutPage.js` (mới)
- `automation/tests/fr08-checkout.spec.js` (mới, 25 test)

**Lệnh đã chạy & kết quả thật:**
```
npx playwright test --project=chromium --grep @fr08
⇒ 25 passed (9.2s)

npx playwright test --project=chromium --grep @fr08 --repeat-each=2
⇒ 50 passed (13.6s)   ← ổn định 2 lần liên tiếp
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · bug `BUG-08-01..09`

---

## LOG-007 — Phase 3 (FR-15): AdminProductPage + spec 25 test

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T21:44:00+07:00
- **Phase:** P3 — FR-15 spec generation
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- Khởi động `frontend-admin` (`npx vite --port 5174 --strictPort`) — xác nhận `Local: http://localhost:5174/`, `curl` trả 200.
- `AdminProductPage.js`: sidebar là `<li>` nên dùng `getByText('Sản phẩm', { exact: true })`; định vị dòng bảng bằng `getByRole('row').filter({ hasText })`; `loginUi()` trả về message alert (hoặc `null`) để test phân quyền assert được cả 2 nhánh.
- `fr15-product-crud.spec.js`: **25 test**. TC01/TC02 dùng login UI thật; các test khác bơm `adminToken`.
- **Bắt được bug "fake mass update" bằng assertion kép:** UI có N dòng cùng tên mới, trong khi `GET /api/products` chỉ có 1 → chứng minh dứt khoát đây là lỗi FE chứ không phải backend.
- TC20 đếm số request `POST /api/products` rời trình duyệt (= 0) để chứng minh `required` của HTML5 là lớp chặn **duy nhất**.

**File tạo/sửa:**
- `automation/tests/pages/AdminProductPage.js` (mới)
- `automation/tests/fr15-product-crud.spec.js` (mới, 25 test)

**Lệnh đã chạy & kết quả thật:**
```
curl -o /dev/null -w "%{http_code}" http://localhost:5174/   ⇒ 200

npx playwright test --project=chromium --grep @fr15 --workers=1
⇒ 25 passed (9.1s)

npx playwright test --project=chromium --grep @fr15 --repeat-each=2
⇒ 50 passed (11.6s)   ← ổn định 2 lần liên tiếp, chạy song song 2 worker
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · bug `BUG-15-01..11`

---

## LOG-008 — Phase 4: AI Gap Analysis — tự phê bình 7 điểm yếu và vá lại spec

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T22:05:00+07:00
- **Phase:** P4 — Review & fix
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- Quét anti-pattern tự động: 0 `waitForTimeout` thật, 0 selector class Tailwind, 0 `nth-child`/xpath, 0 data hardcode inline.
- Lập bảng **7 GAP** có bằng chứng, mỗi GAP nêu rõ nguyên nhân (prompt quality / model limitation / đặc thù feature) và đã sửa:
  - GAP-00 selector `getByRole('textbox')` khớp 2 phần tử (AI hiểu sai API Playwright)
  - GAP-01 assertion so hằng số với hằng số (nhồi cho đủ 3 pattern)
  - GAP-02 đếm dòng quá sớm → hở race khi chạy song song
  - GAP-03 phủ định kép khó đọc
  - GAP-04 mốc chờ không phụ thuộc dữ liệu → có thể đọc bảng rỗng
  - GAP-05 happy path không kiểm tra đúng sản phẩm nào vào giỏ
  - GAP-06 biến thể token 4 số có 1/9000 xác suất trùng token thật
  - GAP-07 firefox/webkit chưa tải → 28 test không chạy nổi mà vẫn báo "52 passed"
- **Phát hiện quan trọng cho AI_Critique:** AI không chỉ sai, mà còn *viết comment giải thích* cho giả định sai của mình (GAP-00) → người review dễ tin nhầm là đã kiểm chứng.

**File tạo/sửa:**
- `report/02-AI-GAP-ANALYSIS.md` (mới)
- `automation/tests/pages/AdminProductPage.js` (sửa — chờ dòng dữ liệu, thêm `visibleRowCount()`)
- `automation/tests/pages/CartPage.js` (sửa — thêm `rowByProductName()`)
- `automation/tests/fr15-product-crud.spec.js` (sửa — GAP-01/02/03)
- `automation/tests/fr08-checkout.spec.js` (sửa — GAP-05)

**Lệnh đã chạy & kết quả thật:**
```
npx playwright test --project=firefox        (LẦN 1, chưa cài browser)
⇒ 28 failed, 52 passed
  Error: browserType.launch: Executable doesn't exist at ...\firefox-1538\firefox.exe

npx playwright install firefox webkit        ⇒ exit 0

npx playwright test --project=chromium       ⇒ 80 passed (17.0s)
npx playwright test --project=firefox        ⇒ 80 passed (33.3s)
npx playwright test --project=webkit         ⇒ 80 passed (37.7s)
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · report `02-AI-GAP-ANALYSIS.md`

---

## LOG-009 — Phase 5: 9 run multi-browser + banner chống gian lận + bảng số liệu thật

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T22:35:00+07:00
- **Phase:** P5 — Multi-browser run
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- `run-multibrowser.mjs`: 3 feature × 3 browser = 9 run, mỗi run 1 thư mục report riêng qua `PW_REPORT_DIR`.
- `verify-report-banner.mjs`: FAIL CỨNG nếu index.html thiếu banner / ISO timestamp.
- `summarize-results.mjs`: đọc `results.json` thật → sinh `report/03-RUN-SUMMARY.md`, không con số nào nhập tay.
- **2 lỗi thật gặp phải và cách sửa:**
  1. `spawnSync('npx.cmd', …)` trên Windows trả `exit=null` sau 0.0s cho cả 9 run (Node không phân giải `.cmd` khi không có `shell:true`). Sửa: gọi thẳng `process.execPath` + `node_modules/@playwright/test/cli.js`.
  2. **Option `title` của html reporter KHÔNG còn tác dụng ở Playwright 1.62** — kiểm chứng bằng cách giải nén blob base64 trong index.html: `report.json` có `title: null`, `<title>` vẫn là "Playwright Test Report", `grep 23127060 index.html` ⇒ 0. Sửa: viết reporter tuỳ biến `banner-reporter.mjs` chạy sau html reporter, đóng dấu banner vào `<title>` + một `<div>` hiển thị ngay đầu report. Mọi số liệu trên banner lấy từ chính lần chạy đó.

**File tạo/sửa:**
- `automation/scripts/run-multibrowser.mjs` (mới)
- `automation/scripts/verify-report-banner.mjs` (mới)
- `automation/scripts/summarize-results.mjs` (mới)
- `automation/scripts/banner-reporter.mjs` (mới)
- `automation/playwright.config.js` (sửa — đăng ký banner-reporter)
- `report/03-RUN-SUMMARY.md` (sinh tự động)
- `automation/playwright-report/` — 9 thư mục report

**Lệnh đã chạy & kết quả thật:**
```
node scripts/run-multibrowser.mjs
⇒ fr03-reset  × chromium/firefox/webkit : 30 / 30 / 30 passed
  fr08-checkout × chromium/firefox/webkit : 25 / 25 / 25 passed
  fr15-product  × chromium/firefox/webkit : 25 / 25 / 25 passed
  ✅ 9/9 run PASS toàn bộ

node scripts/verify-report-banner.mjs
⇒ 9/9 report hợp lệ · exit 0
  ví dụ: fr03-reset-chromium banner OK · timestamp 2026-08-22T13:51:45.350Z

node scripts/summarize-results.mjs
⇒ TỔNG 240 test · 240 passed · 0 failed · 0 flaky · 0 skipped · 93.7s · pass rate 100.0%
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · report `03-RUN-SUMMARY.md`

---

## LOG-010 — Phase 6: BUG_REPORT 27 bug + script chụp ảnh minh chứng thật + lệnh gh issue

- **AI tool:** Claude Code (CLI), model claude-opus-5[1m]
- **Thời điểm:** 2026-08-22T23:02:00+07:00
- **Phase:** P6 — Bug report
- **Người dùng:** 23127060 — Ninh Văn Khải

**Prompt (nguyên văn):**
> Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase

**AI output (tóm tắt):**
- `capture-bug-evidence.mjs`: tái hiện 8 bug nặng nhất bằng Playwright thật → **11 ảnh PNG** + `capture-log.txt` chứa log response nguyên văn.
- **Lỗi thật gặp phải:** chụp màn hình *bên trong* dialog handler làm treo renderer (`page.screenshot: Timeout 30000ms`) vì `alert()` chặn tiến trình render. Sửa: chụp trước khi bấm, lấy nội dung alert ra làm log, chụp lại sau khi đóng alert.
- `BUG_REPORT.md`: **27 bug** (FR-03: 8 · FR-08: 9 · FR-15: 10), mỗi bug có Severity/Priority · Component (số dòng) · Test case · Precondition · Steps · Expected · Actual (log thật) · Nguyên nhân code · Đề xuất sửa.
- `gh-issue-commands.sh`: sinh 28 file body riêng bằng `awk` cắt từ BUG_REPORT.md và in ra 28 lệnh `gh issue create` — **không tự chạy**, để Khải kiểm rồi tự tạo Issue.

**File tạo/sửa:**
- `automation/scripts/capture-bug-evidence.mjs` (mới)
- `bug-report/BUG_REPORT.md` (mới, 27 bug)
- `bug-report/gh-issue-commands.sh` (mới) + `bug-report/issue-bodies/*.md` (28 file sinh tự động)
- `evidence/bugs/*.png` (11 ảnh thật) + `evidence/bugs/capture-log.txt`

**Lệnh đã chạy & kết quả thật:**
```
node scripts/capture-bug-evidence.mjs
⇒ 8/8 bug chụp thành công. Trích log:
  [BUG-03-08] POST /api/login (mật khẩu MỚI) ⇒ 403 {"error":"Tài khoản đã bị khóa..."}
  [BUG-08-01] Đơn hàng trong CSDL: {"id":118,"total_amount":1,...} (giỏ 30.000.000 ₫)
  [BUG-08-04] GET /api/orders/119 KHÔNG token ⇒ 200 {..."shipping_address":"Địa chỉ riêng tư..."}
  [BUG-08-07] apply-coupon SAVE10 ⇒ {"discount_amount":-270000000,"final_amount":300000000}
  [BUG-15-01] UI: 6 dòng mang tên mới · CSDL: 1 bản ghi ⇒ lỗi nằm ở FRONTEND
  [BUG-15-02] POST/PUT/DELETE /api/products KHÔNG token ⇒ 200 / 200 / 200
  [BUG-15-02] DELETE /api/products/99999999 ⇒ 200 {"message":"Product deleted"}

bash bug-report/gh-issue-commands.sh
⇒ in ra 28 lệnh gh issue create · sinh 28 file body (591 dòng)
```

**Human review (Khải):**
- Sai/thiếu:
- Đã sửa:

**Verdict:** <Accepted / Accepted-with-fix / Rejected>
**Liên kết:** commit `<hash>` · bug `BUG-03-01..BUG-15-11`
