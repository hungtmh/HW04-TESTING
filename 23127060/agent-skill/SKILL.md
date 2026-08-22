---
name: hw04-eshop-automation-23127060
description: >
  Skill điều phối toàn bộ HW04 – Automation Testing (môn Kiểm thử phần mềm, SUT = EShop)
  cho sinh viên Ninh Văn Khải – MSSV 23127060. Dùng khi cần: sinh/refactor script Playwright
  data-driven cho FR-03 (Forgot/Reset password), FR-08 (Checkout), FR-15 (Admin Product CRUD),
  chạy multi-browser + tạo HTML report có banner "Run by: 23127060", lập BUG_REPORT,
  viết HW04_Main_Report / AI_Audit_Report / AI_Critique / README, và ghi AI_Log.md sau MỖI
  lượt hội thoại. KHÔNG dùng cho thư mục của thành viên khác (23127195, 23127259).
owner: "23127060 – Ninh Văn Khải"
version: 1.0
---

# SKILL — HW04 Automation Testing (EShop) — 23127060

## 0. LUẬT BẤT BIẾN (đọc trước khi làm bất cứ việc gì)

1. **Scope thư mục.** Chỉ đọc/ghi trong `HW04-TESTING/23127060/**` và **đọc-chỉ** `HW04-TESTING/eshop-sut/**`.
   - TUYỆT ĐỐI không đọc, copy, tham chiếu, hay ghi vào `23127195/**` và `23127259/**` (chống trùng bài → rủi ro 0 điểm cả hai bên theo §17 đề bài).
   - Không sửa `HW04-TESTING/playwright.config.js`, `HW04-TESTING/tests/**`, `HW04-TESTING/playwright-report/**` ở root (đó là của bạn khác). Mình có config + tests riêng trong `23127060/automation/`.
   - Không sửa source SUT (`eshop-sut/**`) — chỉ đọc để hiểu selector/API. Nếu phát hiện bug thì báo cáo, **không fix**.
2. **AI Log là bắt buộc.** Kết thúc **mỗi** lượt trả lời có làm việc thật (sinh code, chạy test, viết báo cáo, phân tích), agent PHẢI append 1 entry vào
   `23127060/ai/AI_Log.md` theo template ở §9. Nếu chưa ghi log → coi như task CHƯA XONG.
   Cuối mỗi câu trả lời phải in dòng: `✅ AI_Log.md đã cập nhật: <ID entry>` hoặc `⚠️ Chưa ghi log — cần bổ sung`.
3. **AI-first nhưng từng bước.** Không được sinh cả suite bằng 1 prompt tổng. Mỗi feature phải đi qua chuỗi bước:
   phân tích FR → liệt kê test case → chốt test data → sinh Page Object → sinh spec → chạy → review/fix → log.
4. **Không bịa evidence.** Cấm sinh giả: nội dung HTML report, số liệu pass/fail, ảnh screenshot, log `whoami`, timestamp, link YouTube.
   Mọi con số trong báo cáo phải lấy từ `results.json` thật do Playwright tạo.
5. **Human gate.** Việc nào có dấu 🧑 ở §7 là do Khải làm/ký xác nhận. Agent chỉ được chuẩn bị và nhắc, không tự khai là đã xong.
6. **Ngôn ngữ.** Báo cáo, log, bug report: tiếng Việt. Code, tên file, commit message, test title: tiếng Anh.

---

## 1. Danh tính & tham số cố định

| Khóa | Giá trị |
|---|---|
| `STUDENT_ID` | `23127060` |
| `STUDENT_NAME` | `Ninh Văn Khải` |
| `RUN_BY_BANNER` | `Run by: 23127060` (kèm ISO timestamp) |
| Root làm việc | `HW04-TESTING/23127060/` |
| SUT | `HW04-TESTING/eshop-sut/` (repo `https://github.com/ttbhanh/eshop-sut`) |
| Framework | Playwright Test (JS) + Playwright HTML reporter |
| Browsers | `chromium`, `firefox`, `webkit` (≥ 9 lần chạy) |
| Timezone log | `Asia/Ho_Chi_Minh (+07:00)` |

### Feature đã chọn (không đổi)

| Mã | Pool | Tên | Tag test | Ghi chú |
|---|---|---|---|---|
| **FR-03** | A | Quên mật khẩu & Đặt lại mật khẩu (2 bước) | `@fr03` | Web frontend `/forgot-password` |
| **FR-08** | B | Thanh toán (Checkout) | `@fr08` | Web frontend `/checkout` |
| **FR-15** | C | Quản lý sản phẩm (CRUD) | `@fr15` | Frontend-admin |
| FR-20 | D | Mobile – Giỏ hàng & Thanh toán | `@fr20` | **Ngoài phạm vi tính điểm HW04** (đề §5: Pool D không dùng cho HW04). Xử lý theo §8 – phụ lục tự chọn. |

---

## 2. Kiến thức SUT đã xác minh từ source (dùng để viết assertion đúng)

> Đọc trực tiếp `eshop-sut/backend/server.js`, `backend/database.js`. Backend chạy port **3000**, base API `http://localhost:3000/api`.
> Port đã xác minh: backend **3000**. `run_servers.sh` chạy `npm run dev` cho cả web và admin **không chỉ định port** → Vite tự cấp: web = **5173**, admin = **5174** (Vite tăng dần khi 5173 đã bận). LƯU Ý: thứ tự khởi động quyết định port nào là 5173 → 🧑 Khải xác nhận URL thực tế khi chạy `run_servers.sh` (Vite in ra `Local: http://localhost:xxxx`) rồi ghi vào `automation/tests/utils/env.js`. Không để test trộn lẫn web/admin sai port.
>
> **Frontend gọi API bằng URL hardcode** `http://localhost:3000/api/...` (thấy trong `ForgotPassword.jsx`, `Checkout.jsx`) → backend PHẢI chạy đúng port 3000, không đổi được.

### Seed data (database.js — DB bị DROP & seed lại mỗi lần start backend)
- Users: `admin@eshop.com / Admin123!` (role `admin`), `test@eshop.com / Test1234!` (role `user`).
- Categories: 1 Điện thoại, 2 Laptop, 3 Phụ kiện.
- Products: 5 sản phẩm (id 1..5), giá INTEGER (VND), ví dụ id1 iPhone 15 Pro Max 30.000.000.
- Coupons: `SAVE10` (percent 10, min 300k), `BIGBUY` (fixed 50k, min 500k), `VIP100` (fixed 100k, max 2 lần), `EXPIRED` (hết hạn 2020).
- **Hệ quả quan trọng:** restart backend = mất toàn bộ dữ liệu test đã tạo. Test phải **tự tạo dữ liệu tiền đề** (register user riêng cho mỗi case, email random) và **không phụ thuộc thứ tự chạy**.

### API liên quan 3 feature
| FR | Endpoint | Auth | Ghi chú hành vi thật |
|---|---|---|---|
| FR-03 | `POST /api/forgot-password` | ❌ | Trả về `{message, resetToken}` — **token 4 chữ số** lộ ngay trong response body. Email không tồn tại → `404 {error:"User not found"}` |
| FR-03 | `POST /api/reset-password` | ❌ | Body `{email, resetToken, newPassword}`; sai → `400 {error:"Invalid token or email"}`. Không kiểm tra độ mạnh mật khẩu, không có hạn dùng token, không reset `login_attempts/locked_until` |
| FR-08 | `GET/POST /api/cart` | ✅ Bearer | Giỏ hàng lưu **in-memory** `userCarts` (mất khi restart, không dedupe, không trừ kho) |
| FR-08 | `POST /api/checkout` | ✅ Bearer | Body `{total_amount, shipping_address}` → tin **hoàn toàn** giá do client gửi; luôn `status=pending`; không xoá cart; không validate giỏ trống / địa chỉ trống |
| FR-08 | `GET /api/orders/:id` | ❌ **không có middleware** | Xem đơn của người khác (IDOR) |
| FR-15 | `POST/PUT/DELETE /api/products` | ❌ **không có `authenticateToken`** | Không cần login vẫn CRUD được; không validate `name` rỗng, `price` âm/chuỗi; DELETE id không tồn tại vẫn trả `{message:"Product deleted"}` |
| FR-15 | `GET /api/products/:id` | ❌ | Nếu `id` chẵn thì `price` bị trả về dạng **string** (bất nhất kiểu dữ liệu); id không tồn tại → `200 {}` thay vì 404 |

### Danh sách "bug candidate" phải kiểm chứng bằng test (KHÔNG copy vào report nếu chưa chạy ra fail thật)
**FR-03:** (a) resetToken lộ trong HTTP response; (b) token chỉ 4 số → brute-force; (c) token không có expiry; (d) không rate-limit `forgot-password`; (e) user enumeration qua 404; (f) reset không kiểm tra policy mật khẩu (đặt được `1`); (g) mật khẩu lưu plaintext; (h) reset thành công nhưng account vẫn còn `locked_until` → vẫn không login được; (i) gọi forgot-password nhiều lần → token cũ bị vô hiệu (kiểm chứng UX).
**FR-08:** (a) client-side price tampering (`total_amount = 1`); (b) checkout với giỏ trống vẫn tạo order; (c) `shipping_address` rỗng/khoảng trắng vẫn qua; (d) cart không bị clear sau checkout → double order; (e) `total_amount` âm / không phải số; (f) IDOR `GET /api/orders/:id`; (g) checkout không kiểm tra tồn kho.
**FR-15:** (a) thiếu access control ở product CRUD (user thường / không token vẫn tạo–sửa–xoá); (b) tạo sản phẩm `name` rỗng; (c) `price` âm hoặc chữ; (d) `price` cực lớn (overflow/hiển thị); (e) XSS trong `name`/`description` render ở list; (f) DELETE id không tồn tại báo success; (g) xoá sản phẩm đang nằm trong đơn/giỏ → dữ liệu mồ côi; (h) `category_id` không tồn tại vẫn insert.

### 2.1 Selector thật đã đọc từ JSX (dùng đúng, không đoán)

> SUT là React + Tailwind, **không có data-testid**, form không dùng `<label htmlFor>` (label đứng cạnh input, không liên kết) → `getByLabel()` **KHÔNG hoạt động**. Dùng `getByRole` + `getByText` + thứ tự input.

**FR-03 `/forgot-password` (`ForgotPassword.jsx`) — 2 bước trong cùng 1 route, đổi bằng `step` state:**
- B1: input email `type=text` (placeholder rỗng) → dùng `page.getByRole('textbox')` (chỉ có 1 ở step 1); nút `getByRole('button', { name: 'Lấy mã OTP' })`.
- B2 hiện sau khi submit: hộp xanh hiện `Mã OTP của bạn là: <token>` → lấy token bằng regex từ text. Input `Mã OTP (4 số)` và `Mật khẩu mới` (`type=password`); nút `getByRole('button', { name: 'Đặt lại mật khẩu' })`.
- **BẨY quan trọng (bug UI):** FE chặn mật khẩu mới bằng regex `flawedStrongPasswordRegex` **bắt buộc có KHOẢNG TRẮG** (`(?=.*\s)`) → mật khẩu "hợp lệ" phải chứa dấu space, ví dụ `New Pass 123`. Đây là bug logic đáng ghi (regex sai chuẩn). Kết quả (alert) dùng `page.on('dialog')` để bắt.
- FE dùng `alert()` cho cả thành công lẫn lỗi → assert qua dialog message, không phải toast DOM.

**FR-08 `/cart` → `/checkout` (`Cart.jsx`, `Checkout.jsx`, `CartContext.jsx`):**
- Cart + Checkout **lưu state trong React Context (in-memory)**, KHÔNG localStorage → reload trang là mất giỏ. Test phải thêm sản phẩm qua UI trong cùng phiên, không seed qua API cho luồng UI.
- Giỏ trống: text `Giỏ hàng của bạn đang trống`. Nút sang checkout: `getByRole('button', { name: 'Tiến hành thanh toán' })` (redirect `/login` nếu chưa đăng nhập — có alert).
- **BẨY price tampering (bug chính FR-08):** trang Checkout có **ô input `type=number` cho "Tổng tiền thanh toán (VND)" SỬA ĐƯỢC** (`editableTotal`). Đổi thành `1` rồi bấm `Xác Nhận Thanh Toán` → order tạo với total=1. Selector ô giá: `page.getByRole('spinbutton')` (input number duy nhất) hoặc locate theo label `Tổng tiền thanh toán`.
- Coupon: input `getByPlaceholder('Nhập mã giảm giá...')`, nút `getByRole('button', { name: 'Áp dụng' })`. Coupon gọi `POST /api/apply-coupon`.
- Thành công: heading `Thanh toán thành công!` (assert `getByRole('heading')` + `waitForResponse(/api\/checkout/)`).
- **Lưu ý:** `clearCart` được import trong Checkout nhưng **KHÔNG được gọi sau khi thanh toán** → bug: giỏ không bị xóa, có thể double-checkout. Đáng ghi bug.
- Checkout gửi `items: cart` nhưng backend `/api/checkout` **bỏ qua items**, chỉ lưu `total_amount` + `shipping_address` (mà FE **không gửi** `shipping_address`) → order lưu address = null/undefined. Đáng ghi.

**FR-15 Quản lý sản phẩm (`frontend-admin/src/App.jsx`) — SPA 1 file, đổi tab bằng `activeTab` state, base API `http://localhost:3000/api`:**
- **Đăng nhập admin bắt buộc trước:** form login dùng `getByPlaceholder('Email')`, `getByPlaceholder('Password')`, nút `getByRole('button', { name: 'Login' })`. Token lưu `localStorage['adminToken']`. FE chặn nếu `role !== 'admin'` (alert `Bạn không phải là admin!`). Đăng nhập `admin@eshop.com / Admin123!`.
  - **Mẹo tăng tốc:** có thể set sẵn token qua `page.addInitScript` (`localStorage.setItem('adminToken', <jwt>)`) để khỏi login UI mỗi test — nhưng ít nhất 1 test phải đi qua login thật.
- **Vào màn sản phẩm:** click sidebar `page.getByText('Sản phẩm', { exact: true })` (là `<li>`, không phải button).
- **Form thêm/sửa:** `getByPlaceholder('Tên sản phẩm')`, `getByPlaceholder('Giá tiền')` (type=number), `getByPlaceholder('URL Ảnh')`, `getByPlaceholder('Mô tả')` (textarea), `getByRole('combobox')` cho category. Nút submit `getByRole('button', { name: 'Lưu sản phẩm' })`. Heading đổi `Thêm sản phẩm mới` ↔ `Sửa sản phẩm`; chế độ sửa có thêm nút `Hủy sửa`.
- **Bảng SP:** cột Ảnh / Tên SP / Giá / Hành động; mỗi dòng có nút `Sửa` (vàng) và `Xóa` (đỏ). Locate dòng theo tên: `page.getByRole('row').filter({ hasText: '<tên SP>' })`.
- **Thông báo:** thêm mới → không alert, chỉ refetch; sửa → alert `Cập nhật thành công!`; lỗi → alert `Lỗi lưu sản phẩm: ...`. Bắt bằng `page.on('dialog')`.

### 2.2 Bug seeded FR-15 (đã xác minh trong `App.jsx` + `server.js`)
- **BUG lớn — "fake mass update" (App.jsx dòng 110-114):** khi **Sửa** 1 sản phẩm, FE gán `name` của SP đang sửa cho **TẤT CẢ** sản phẩm trong local state (`products.map(p => ({...p, name: productForm.name}))`) → sau khi bấm Lưu, **cả bảng bị đổi cùng 1 tên** cho đến khi reload. Assert: sau khi sửa 1 SP, đếm số dòng có tên mới > 1 → fail (bằng chứng bug).
- **BUG access control (server.js):** `POST/PUT/DELETE /api/products` **không có `authenticateToken`** → test API không gửi token vẫn tạo/sửa/xoá được (assertion mạnh nhất, làm ở tầng API).
- **BUG validate:** tạo SP `name` rỗng, `price` âm/chữ/cực lớn đều insert; `GET /api/products/:id` id chẵn trả `price` dạng string, id lạ trả `200 {}`; DELETE id không tồn tại vẫn báo thành công.
- **BUG XSS lưu trữ (App.jsx dòng 799-804):** cột địa chỉ đơn hàng render bằng `dangerouslySetInnerHTML` → stored XSS qua `shipping_address` (liên quan FR-08). Nếu có thời gian, ghi thêm bug cross-feature.
- **BUG doanh thu (App.jsx dòng 217-219):** dashboard tính `total_amount * 2` cho đơn delivered → doanh thu gấp đôi (bug hiển thị, tuỳ chọn ghi).
- **BUG XSS trong tên/mô tả SP:** name/description không escape khi hiển thị → thử payload `<img src=x onerror=...>`.

> ⚠️ Import CSV (`/api/admin/import-products`) và quản lý danh mục/coupon/user cũng nằm trong `App.jsx` nhưng **thuộc FR khác (FR-16/FR-14/…) — KHÔNG phải feature của 23127060**, agent chỉ đọc tham khảo, không viết test cho chúng.

---

## 3. Cấu trúc thư mục chuẩn của 23127060 (agent tạo đúng như vậy)

```
23127060/
├── README.md                          # self-assessment + test summary (§14 đề)
├── agent-skill/
│   ├── SKILL.md                       # chính file này
│   └── evidence/                      # screenshot minh chứng dùng skill
├── automation/
│   ├── package.json
│   ├── playwright.config.js           # config RIÊNG của 23127060
│   ├── scripts/
│   │   ├── run-multibrowser.mjs        # 3 feature × 3 browser = 9 run, mỗi run 1 report dir
│   │   ├── verify-report-banner.mjs    # grep "Run by: 23127060" + ISO timestamp trong index.html
│   │   ├── summarize-results.mjs       # đọc results.json → bảng số liệu cho README/report
│   │   └── md-to-pdf.mjs               # xuất PDF cho các .md bắt buộc
│   ├── tests/
│   │   ├── data/
│   │   │   ├── fr03-reset-cases.json
│   │   │   ├── fr03-token-variants.csv
│   │   │   ├── fr08-checkout-cases.json
│   │   │   ├── fr08-order-totals.csv
│   │   │   ├── fr15-product-cases.json
│   │   │   └── fr15-product-fields.csv
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── ForgotPasswordPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   └── AdminProductPage.js
│   │   ├── utils/
│   │   │   ├── env.js                 # BASE_URL web/admin/api đọc từ ENV, có default
│   │   │   ├── api.js                 # helper register/login/seed qua API
│   │   │   ├── csv.js                 # parser CSV tối giản (không thư viện ngoài)
│   │   │   └── data.js                # loadJson/loadCsv + unique email generator
│   │   ├── fr03-forgot-reset.spec.js
│   │   ├── fr08-checkout.spec.js
│   │   └── fr15-product-crud.spec.js
│   └── playwright-report/             # 9 thư mục report: fr03-reset-chromium, ...
├── ai/
│   ├── AI_Log.md                      # log thô theo từng lượt chat (append-only)
│   ├── AI_Audit_Report.md / .pdf      # tổng hợp từ AI_Log.md
│   └── AI_Critique.md / .pdf          # 200–300 từ
├── bug-report/
│   └── BUG_REPORT.md / .pdf
├── evidence/
│   ├── bugs/                          # ảnh bug (screenshot thật)
│   ├── report-screenshots/            # ảnh 9 HTML report có banner
│   ├── git-commit-log.txt
│   └── git-commit-log-files.txt       # log chỉ commit đụng *.spec.js
├── report/
│   └── HW04_Main_Report.md / .pdf
└── video-script/
    ├── VIDEO_1_DEMO_SCRIPT.md         # ≥5 phút, demo chạy + report + 1 fix
    └── VIDEO_2_AGENT_SKILL_SCRIPT.md  # demo dùng skill end-to-end
```

---

## 4. Chuẩn kỹ thuật bắt buộc (rubric-driven)

### 4.1 Số lượng
- **≥ 12 test case tự động / feature** → tối thiểu **36 test** cho FR-03 + FR-08 + FR-15. Trộn positive / negative / edge.
- Mỗi test có ID trong title: `FR03-TC01 ... FR03-TC12+`, `FR08-TCxx`, `FR15-TCxx`.

### 4.2 Data-driven (bắt buộc, không hardcode inline)
- Mọi input/expected nằm trong `tests/data/*.json` hoặc `*.csv`. Spec chỉ `for (const c of loadJson(...))`.
- Mỗi feature dùng **cả 1 file JSON (case phức) và 1 file CSV (bảng dữ liệu/boundary)** để chứng minh cả 2 định dạng.
- Cấm `const cases = [ {...}, {...} ]` trong file spec.

### 4.3 ≥ 3 assertion pattern khác nhau (khai báo rõ trong report)
1. **UI state/text**: `await expect(page.getByTestId('toast')).toHaveText(/…/)` , `toBeVisible()`.
2. **Navigation/URL**: `await expect(page).toHaveURL(/\/checkout\/success/)`.
3. **API/back-end state**: `const r = await request.post('/api/checkout', …); expect(r.status()).toBe(200); expect(body.orderId).toBeGreaterThan(0)` — hoặc xác minh dữ liệu qua `GET /api/orders/:id`.
4. (khuyến nghị thêm) **Tính toán số học/boundary**: `expect(total).toBe(expectedTotal)`; **soft assertion**: `expect.soft(...)` để 1 test bắt nhiều triệu chứng.

### 4.4 Selector policy (chống fragile — điểm chính khi review AI)
Ưu tiên theo thứ tự: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` (exact) > `data-testid` > CSS.
**Cấm**: xpath dài, class Tailwind (`.px-4.py-2`), `nth-child`, chuỗi text dài dễ đổi.
SUT là React + Tailwind, **không có data-testid** → phải dùng role/label/placeholder đọc từ `frontend-web/src/pages/*.jsx` và `frontend-admin/src/App.jsx`. Agent **đọc file JSX trước khi viết selector**, không đoán.

### 4.5 Wait policy (chống flaky)
- Cấm `page.waitForTimeout()` trừ khi có comment giải thích + không có cách khác.
- Dùng web-first assertion (`expect(...).toBeVisible()`), `waitForResponse(/api\/checkout/)`, `waitForURL`.
- Test độc lập: mỗi test tự tạo user/product riêng (`ts-${Date.now()}-${rand}@eshop.com`), cleanup qua API nếu tạo dữ liệu.

### 4.6 HTML report + banner (Anti-AI-Cheat §11)
- `playwright.config.js`:
  ```js
  const RUN_AT = new Date().toISOString();
  reporter: [
    ['html', { open: 'never', outputFolder: process.env.PW_REPORT_DIR || 'playwright-report/local',
               title: `Run by: 23127060 — ${RUN_AT}` }],
    ['json', { outputFile: (process.env.PW_REPORT_DIR||'playwright-report/local') + '/results.json' }],
  ],
  metadata: { 'Run by': '23127060 – Ninh Văn Khải', 'Run at (ISO)': RUN_AT, feature: process.env.PW_FEATURE || 'all' },
  ```
- Sau mỗi run, `verify-report-banner.mjs` phải **fail cứng** nếu `index.html` không chứa `Run by: 23127060` và một ISO timestamp.
- 9 report dir đặt tên: `fr03-reset-{chromium,firefox,webkit}`, `fr08-checkout-*`, `fr15-product-*`.

### 4.7 Git (đề §12)
- Repo public riêng của Khải; **≥ 8 commit đụng `*.spec.js`**.
- Commit theo từng bước có nghĩa, ví dụ:
  `test(fr03): add 12 data-driven forgot/reset cases`,
  `fix(fr03): replace fragile CSS selector with getByRole`,
  `test(fr08): add price-tampering and empty-cart cases`,
  `fix(fr08): remove waitForTimeout, use waitForResponse`,
  `test(fr15): add access-control and validation cases`,
  `fix(fr15): stabilize product row locator`,
  `test(fr15): add XSS + boundary price cases`,
  `chore(report): regenerate 9-browser html reports`.
- Xuất log: `git log --pretty=format:'%h|%ad|%an|%s' --date=iso > evidence/git-commit-log.txt` và bản chỉ spec:
  `git log --pretty=... -- '*.spec.js' > evidence/git-commit-log-files.txt`.

---

## 5. Quy trình làm việc theo phase (agent chạy tuần tự, mỗi phase 1 lượt chat + 1 entry AI_Log)

### PHASE 0 — Khởi tạo & recon (agent)
1. Tạo cây thư mục §3 (chỉ trong `23127060/`).
2. Đọc: `eshop-sut/README.md`, `api_specification.md`, `setup_guide.md`, `run_servers.sh`, `backend/server.js`, `backend/database.js`, `frontend-web/src/pages/{ForgotPassword,Login,Cart,Checkout}.jsx`, `frontend-web/src/context/*`, `frontend-admin/src/App.jsx`.
3. Ghi `automation/tests/utils/env.js` với BASE_URL thật + tài khoản seed.
4. Xuất `report/00-SUT-RECON.md`: bảng route ↔ selector ↔ API ↔ rủi ro. **Đây là input cho mọi prompt sau.**
5. 🧑 Khải chạy `bash run_servers.sh`, xác nhận 3 app lên (backend 3000 + web + admin) và dán output vào chat.

### PHASE 1 ��� Thiết kế test case (agent, theo từng feature một)
Với mỗi FR, lần lượt:
1. Trích **acceptance criteria** từ FR (đề + code thật).
2. Sinh bảng test case ≥12: `ID | Loại (P/N/E) | Tiền đề | Bước | Dữ liệu | Expected (dẫn nguồn: đề/code) | Assertion pattern | Có tự động được?`.
3. Đánh dấu case không automate được + lý do (ví dụ: kiểm tra email thật, CAPTCHA, rate-limit theo thời gian dài).
4. 🧑 Khải review & duyệt bảng case → agent mới sang Phase 2.

### PHASE 2 — Test data (agent)
1. Sinh `*.json` (case đầy đủ) + `*.csv` (bảng boundary) đúng tên ở §3.
2. Không để credential thật hardcode ngoài seed account công khai của SUT.
3. Self-check: mỗi case trong bảng Phase 1 phải map 1-1 với 1 record dữ liệu.

### PHASE 3 — Page Object + Spec (agent, từng feature)
1. Viết Page Object theo selector policy §4.4 (dựa trên JSX đã đọc, có comment nguồn selector).
2. Viết spec: `test.describe('FR-03 …', () => { for (const c of cases) test(`FR03-TC${c.id} ${c.title} @fr03`, …) })`.
3. Chạy `npx playwright test --project=chromium --grep @fr03` → sửa đến khi kết quả **ổn định 2 lần liên tiếp** (`--repeat-each=2`).
4. Commit riêng cho từng feature.

### PHASE 4 — Human review & fix (agent đề xuất, Khải quyết định)
Agent phải tự lập bảng **AI Gap Analysis** cho từng feature:
`Vấn đề | Loại (fragile selector / weak assertion / missing edge case / flaky wait / sai hiểu nghiệp vụ) | AI sai vì sao (prompt quality / model limitation / đặc thù feature) | Cách sửa | Commit hash`.
🧑 Khải đọc, chỉnh, ký xác nhận "đã review".

### PHASE 5 — Multi-browser run (agent chạy, Khải xác thực)
1. `node scripts/run-multibrowser.mjs` → 9 run, mỗi run: set `PW_REPORT_DIR`, `PW_FEATURE`, `--project=<browser> --grep @frXX`.
2. Chạy `verify-report-banner.mjs` cho cả 9 report.
3. `summarize-results.mjs` → bảng: feature | browser | total | passed | failed | flaky | duration.
4. 🧑 Khải mở từng report bằng trình duyệt, screenshot vào `evidence/report-screenshots/` (ảnh phải là ảnh thật, có banner).

### PHASE 6 — Bug report (agent draft, Khải xác nhận + đăng Issue)
1. Chỉ bug nào **có assertion fail thật** hoặc **có evidence script chạy ra được** mới được ghi. Mỗi bug:
   `BUG-ID | Tiêu đề | Feature | Severity/Priority | Env (browser, commit) | Precondition | Steps | Expected (dẫn nguồn) | Actual | Evidence file | Test case liên quan`.
2. Agent viết `scripts/capture-bug-evidence-frXX.mjs` để **tự chụp ảnh bằng Playwright** (ảnh thật, không vẽ).
3. 🧑 Khải tạo GitHub Issue cho từng bug + attach screenshot; nếu có `gh` CLI, agent có thể soạn sẵn lệnh `gh issue create --title … --body-file …` để Khải chạy.

### PHASE 7 — Viết tài liệu (agent draft, Khải review)
Thứ tự: `HW04_Main_Report.md` → `BUG_REPORT.md` → `AI_Audit_Report.md` (từ AI_Log.md) → `AI_Critique.md` (200–300 từ, đếm từ và in ra số từ) → `README.md` (self-assessment + test summary) → `VIDEO_1/2 script` → `md-to-pdf.mjs` xuất PDF.
Số liệu trong tất cả file phải khớp `summarize-results.mjs`. Nếu chưa có số thật → để `<CHỜ RUN THẬT>`, **không đoán**.

### PHASE 8 — Đóng gói
1. `zip -r 23127060_HW04_AI_Automation_<grade>.zip 23127060/` (grade 3 chữ số, ví dụ `090`) — 🧑 Khải chốt điểm tự đánh giá.
2. Checklist §14 đề bài: main report md+pdf, link GitHub public, 9 HTML report, link YouTube (unlisted), AI Critique + Audit (md+pdf), git commit log .txt, bug report + ảnh Issue, README, phụ liệu.
3. 🧑 Khải submit Moodle.

---

## 6. Prompt template Khải dùng cho từng bước (chống "1 prompt tổng")

```
[P0] Đọc SKILL.md của 23127060. Làm Phase 0: recon SUT, chỉ đọc eshop-sut + ghi trong 23127060/. Xuất 00-SUT-RECON.md. Ghi AI_Log.
[P1-FR03] Phase 1 cho FR-03: liệt kê ≥12 test case theo bảng chuẩn, dẫn nguồn expected từ server.js. Chưa viết code. Ghi AI_Log.
[P2-FR03] Phase 2: sinh fr03-reset-cases.json + fr03-token-variants.csv map 1-1 với bảng case đã duyệt. Ghi AI_Log.
[P3-FR03] Phase 3: viết ForgotPasswordPage.js + fr03-forgot-reset.spec.js, chạy chromium, báo cáo kết quả thật. Ghi AI_Log.
[P4-FR03] Phase 4: tự phê bình script vừa sinh theo bảng AI Gap Analysis, đề xuất fix + patch. Ghi AI_Log.
... lặp cho FR-08, FR-15 ...
[P5] Phase 5: chạy 9 run multi-browser + verify banner + bảng số liệu thật. Ghi AI_Log.
[P6] Phase 6: bug report từ các fail thật + script chụp evidence. Ghi AI_Log.
[P7] Phase 7: viết tài liệu, số liệu lấy từ results.json. Ghi AI_Log.
```

---

## 7. Phân vai: Agent làm gì / Khải làm gì

### Agent (Claude CLI / MCP) làm được — cứ làm luôn
- Đọc source SUT, sinh recon doc, bảng test case, file data JSON/CSV.
- Viết & refactor Page Object, spec, playwright.config, scripts (`run-multibrowser`, `verify-report-banner`, `summarize-results`, `md-to-pdf`, `capture-bug-evidence`).
- Chạy `npx playwright test`, đọc `results.json`, phân tích fail, phân biệt bug SUT vs bug script.
- Chụp screenshot bug **bằng script Playwright thật**.
- Soạn toàn bộ tài liệu .md, xuất PDF, `git add/commit` theo commit message chuẩn, xuất git log.
- Soạn lệnh `gh issue create` / nội dung Issue.
- Ghi `AI_Log.md` + tổng hợp `AI_Audit_Report.md`.

### 🧑 Khải làm (không được ủy quyền cho AI)
1. Khởi động SUT (`run_servers.sh`) và xác nhận môi trường.
2. **Duyệt bảng test case** (Phase 1) và **ký review script** (Phase 4) — đề bài quy trách nhiệm cho người học.
3. Mở 9 HTML report, xác nhận banner `Run by: 23127060` + ISO timestamp, screenshot.
4. Tạo GitHub repo public, push, tạo GitHub Issues, upload ảnh bug.
5. Quay video: ≥5 phút, thuyết minh **tiếng Việt bằng giọng thật**, có face-cam **hoặc** terminal `whoami` + `hostname`; nêu ≥1 fix mình đã sửa script AI. Upload YouTube **unlisted**. (Video 2 cho Agent Skill.)
6. Chốt điểm tự đánh giá, đặt tên zip, submit Moodle.
7. Chuẩn bị oral defense (30% bị gọi): giải thích được từng selector, từng assertion, từng bug.

---

## 8. FR-20 Mobile (Giỏ hàng & Thanh toán) — xử lý thế nào
- Theo đề §5, **HW04 chỉ tính 3 feature web (A/B/C)**; Pool D không dùng. Vì vậy FR-20 **không được thay thế** cho FR-03/08/15 và không nằm trong 25×3 điểm.
- Nếu Khải vẫn muốn làm thêm (điểm cộng/đỡ cho HW khác), agent xử lý ở `automation/mobile/` như phụ lục:
  - `frontend-mobile` là Expo/React Native → Playwright không chạy được trực tiếp.
  - Lộ trình khả thi: (a) `npx expo start --web` (react-native-web) rồi test bằng Playwright ở viewport mobile; (b) hoặc test **API-level** cart/checkout bằng `request` fixture; (c) hoặc Maestro/Appium — cần thiết bị/emulator → 🧑 Khải quyết định.
  - Ghi rõ trong Main Report là **phụ lục ngoài phạm vi tính điểm**, tránh gây hiểu là thay thế feature web.

---

## 9. CHỨC NĂNG AI LOG (bắt buộc — phục vụ AI_Audit_Report §9 đề bài)

### Quy tắc
- File: `23127060/ai/AI_Log.md`, **append-only**, không sửa entry cũ (chỉ thêm mục "Bổ sung/Đính chính").
- Mỗi **lượt hỏi–đáp** = 1 entry, ID tăng dần `LOG-001`, `LOG-002`, …
- Prompt phải là **nguyên văn** người dùng gửi (không tóm tắt, không sửa chính tả).
- Output ghi tóm tắt + danh sách file bị tạo/sửa + trích đoạn quan trọng.
- Có mục **Human review** (do Khải điền/agent để trống chờ) và **Verdict** (`Accepted / Accepted-with-fix / Rejected`).
- Nếu người dùng chỉ chào/hỏi vụn không tạo artifact → ghi entry rút gọn với `Kết quả: no artifact`.
- Timestamp: `YYYY-MM-DDTHH:mm:ss+07:00` (giờ máy thật, không bịa).

### Template entry (copy đúng khuôn)
```markdown
---
## LOG-0XX — <tiêu đề ngắn việc đã làm>

- **AI tool:** Claude Code (CLI), model <ghi model thật>
- **Thời điểm:** 2026-08-22T15:40:12+07:00
- **Phase:** P3 – FR-03 spec generation
- **Người dùng:** 23127060 – Ninh Văn Khải

**Prompt (nguyên văn):**
> <dán nguyên văn>

**AI output (tóm tắt):**
- <ý chính 1>
- <ý chính 2>

**File tạo/sửa:**
- `automation/tests/fr03-forgot-reset.spec.js` (mới, 14 test)
- `automation/tests/pages/ForgotPasswordPage.js` (mới)

**Lệnh đã chạy & kết quả thật:**
```
npx playwright test --project=chromium --grep @fr03
→ 12 passed, 2 failed (FR03-TC07, FR03-TC11)
```

**Human review (Khải):**
- Sai/thiếu: <…>
- Đã sửa: <…>

**Verdict:** Accepted-with-fix
**Liên kết:** commit `<hash>` · bug `BUG-0X` · report `fr03-reset-chromium`
---
```

### Nhắc nhở tự động (agent bắt buộc thực hiện)
- Đầu mỗi lượt: kiểm tra `AI_Log.md` có entry cho lượt trước chưa; nếu thiếu → bổ sung ngay trước khi làm việc mới.
- Cuối mỗi lượt: in `✅ AI_Log.md đã cập nhật: LOG-0XX` + nhắc `🧑 Cần Khải điền mục Human review cho LOG-0XX`.
- Khi đủ ~10 entry hoặc kết thúc 1 feature: đề nghị tổng hợp `AI_Audit_Report.md` (bảng: STT | Tool | Thời điểm | Mục đích | Prompt (rút gọn) | Output | Human action) + phần khai báo bắt buộc: *"I use AI tools for the following tasks"*.
- `AI_Critique.md`: đếm từ và in số từ ra terminal, phải nằm trong 200–300 từ, nội dung dựa trên **lỗi thật** đã ghi trong AI_Log (không viết chung chung).

---

## 10. Definition of Done (agent tự kiểm trước khi báo "xong")

- [ ] 3 feature × ≥12 test automate = ≥36 test, có ID, có tag.
- [ ] 0 dữ liệu hardcode inline; có cả JSON và CSV cho mỗi feature.
- [ ] ≥3 assertion pattern, được liệt kê rõ trong Main Report.
- [ ] 9 report dir tồn tại, mỗi `index.html` chứa `Run by: 23127060` + ISO timestamp (verify script pass).
- [ ] Bảng AI Gap Analysis cho cả 3 feature, có nguyên nhân + fix + commit.
- [ ] BUG_REPORT có evidence ảnh thật; mỗi bug map tới test case fail.
- [ ] ≥8 commit đụng `*.spec.js`; 2 file git log đã xuất.
- [ ] AI_Log.md đầy đủ, AI_Audit_Report + AI_Critique (200–300 từ) sinh từ log.
- [ ] README có self-assessment table + test summary số thật.
- [ ] Không có file nào bị tạo/sửa ngoài `23127060/`.
- [ ] Các việc 🧑 còn lại được liệt kê rõ ràng cho Khải ở cuối câu trả lời.

---

## 11. Anti-pattern (nếu thấy agent làm thế → dừng, sửa)
- "Viết hết script cho 3 feature" trong 1 prompt/1 commit.
- Selector kiểu `page.locator('div.bg-white > button:nth-child(2)')`.
- `await page.waitForTimeout(3000)` rải khắp spec.
- Assertion yếu: chỉ `expect(page.url()).toContain('/')` hoặc `expect(true).toBe(true)`.
- Test phụ thuộc nhau (test 2 cần user do test 1 tạo).
- Điền số pass/fail, ảnh, timestamp, whoami khi chưa chạy thật.
- Sửa code SUT để test pass.
- Mở/đọc/nhắc tới thư mục `23127195`, `23127259`.
