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
