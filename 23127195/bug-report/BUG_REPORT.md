# Bug Report — FR-01 Đăng ký tài khoản

| | |
|---|---|
| **Sinh viên** | 23127195 |
| **SUT** | EShop (`eshop-sut`) — frontend-web `:5173` + backend API `:3000` |
| **Phát hiện bằng** | Bộ automation Playwright `tests/fr01-register.spec.js` |
| **Ngày** | 2026-08-15 |
| **Môi trường** | Windows 11, Node.js 22.20.0, Playwright 1.62.1, Chromium/Firefox/WebKit |

**Tổng quan:** 6 lỗi. 4 lỗi thuộc phạm vi FR-01 (BUG-01 → BUG-04), 2 lỗi phát hiện
tình cờ trong quá trình xây dựng bộ test (BUG-05, BUG-06).

| ID | Mức độ | Tóm tắt | Test phát hiện |
|---|---|---|---|
| BUG-01 | High | Luật mật khẩu bắt buộc khoảng trắng, cấm ký tự đặc biệt — ngược với hint UI và đặc tả | TC-02, TC-27 |
| BUG-02 | High | Không validate định dạng email ở cả frontend và backend | TC-18 → TC-21 |
| BUG-03 | Critical | Email trùng tạo được nhiều tài khoản | TC-22 |
| BUG-04 | Critical | Mật khẩu lưu plaintext và bị trả về trong response đăng nhập | TC-26 |
| BUG-05 | High | `GET /api/admin/users` không kiểm tra `role` | (phát hiện khi xây helper) |
| BUG-06 | Low | Tài liệu `setup_guide.md` ghi sai mật khẩu admin | (phát hiện khi xây helper) |

---

## BUG-01 — Luật mật khẩu mâu thuẫn với đặc tả và với chính hint trên UI

- **Mức độ:** High
- **Thành phần:** `eshop-sut/frontend-web/src/pages/Register.jsx:15`
- **Test:** TC-02 (fail), TC-27 (fail), TC-10 (bằng chứng bổ trợ)
- **Ảnh:** `../evidence/bugs/BUG-01-special-char-rejected.png`

### Mô tả

Trang đăng ký hiển thị hint:

> *"Yêu cầu: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."*

và `api_specification.md` dùng `"Password123!"` làm ví dụ mật khẩu hợp lệ. Tuy
nhiên regex thực thi lại là:

```js
const flawedStrongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\s)[A-Za-z\d\s]{8,}$/;
```

Hai sai lệch nghiêm trọng so với đặc tả:

1. `(?=.*\s)` — **bắt buộc phải có khoảng trắng**, điều mà không tài liệu nào yêu cầu.
2. `[A-Za-z\d\s]` — character class **chỉ cho phép chữ, số và khoảng trắng**, tức là
   **cấm ký tự đặc biệt** — đúng thứ mà hint bảo là bắt buộc.

Hệ quả: mật khẩu đúng đặc tả bị từ chối, còn mật khẩu yếu hơn (có khoảng trắng,
không có ký tự đặc biệt) lại được chấp nhận.

### Steps to reproduce

1. Mở `http://localhost:5173/register`
2. Nhập Họ Tên: `Nguyen Van A`
3. Nhập Email: `test01@eshop-test.local`
4. Nhập Mật khẩu: `Password123!`
5. Bấm **Đăng Ký**

### Expected

Đăng ký thành công, điều hướng sang `/login` (mật khẩu thoả toàn bộ yêu cầu ghi trên UI).

### Actual

Hiện banner đỏ, ở lại `/register`:

```
Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT.
```

### Bằng chứng đối chứng

| Mật khẩu | Có ký tự đặc biệt | Có khoảng trắng | Kết quả thực tế |
|---|---|---|---|
| `Password123!` | ✅ | ❌ | **Bị từ chối** |
| `Password123` | ❌ | ❌ | **Bị từ chối** |
| `Password 123` | ❌ | ✅ | **Được chấp nhận** |

### Đề xuất sửa

```js
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
```

---

## BUG-02 — Không validate định dạng email

- **Mức độ:** High
- **Thành phần:** `frontend-web/src/pages/Register.jsx:47` (input `type="text"`, không có kiểm tra) + `backend/server.js:20` (`POST /api/register` không validate)
- **Test:** TC-18, TC-19, TC-20, TC-21 (đều fail)
- **Ảnh:** `../evidence/bugs/BUG-02-invalid-email-accepted.png`

### Mô tả

Không có tầng nào kiểm tra định dạng email:

- Frontend khai báo `<input type="text">` thay vì `type="email"`, nên trình duyệt
  cũng không kiểm tra hộ; `handleSubmit` chỉ kiểm tra mật khẩu.
- Backend `POST /api/register` `INSERT` thẳng vào bảng, không validate.

### Steps to reproduce

1. Mở `http://localhost:5173/register`
2. Nhập Họ Tên: `Nguyen Van A`
3. Nhập Email: `abc`
4. Nhập Mật khẩu: `Password 123`
5. Bấm **Đăng Ký**

### Expected

Từ chối với thông báo email không hợp lệ; **không** tạo bản ghi trong bảng `users`.

### Actual

Đăng ký thành công, điều hướng `/login`. Kiểm chứng qua `GET /api/admin/users`
cho thấy đã tồn tại một dòng với `email = "abc"`.

Các giá trị sau đều được chấp nhận: `abc`, `abc@`, `@domain.com`, `a b@domain.com`.

### Đề xuất sửa

Đổi input sang `type="email"`, thêm regex kiểm tra ở frontend, và **quan trọng
hơn** là validate ở backend trước khi `INSERT` (client-side validation luôn có
thể bị bỏ qua bằng cách gọi thẳng API).

---

## BUG-03 — Email trùng tạo được nhiều tài khoản

- **Mức độ:** Critical
- **Thành phần:** `backend/database.js:50` (thiếu `UNIQUE`) + `backend/server.js:20` (không kiểm tra tồn tại)
- **Test:** TC-22 (fail)
- **Ảnh:** `../evidence/bugs/BUG-03-duplicate-email-rows.png`

### Mô tả

Bảng `users` khai báo `email TEXT` **không có ràng buộc `UNIQUE`**:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,          -- thiếu UNIQUE
    password TEXT,
    ...
)
```

và `POST /api/register` không kiểm tra email đã tồn tại hay chưa. Kết quả là
nhiều tài khoản có thể dùng chung một địa chỉ email.

Đây là lỗi **Critical** vì email là định danh đăng nhập: `POST /api/login` dùng
`db.get(... WHERE email = ?)` nên chỉ trả về **dòng đầu tiên**. Người đăng ký sau
không bao giờ đăng nhập được vào tài khoản của chính mình, và luồng
"quên mật khẩu" (FR-03) trở nên không xác định.

### Steps to reproduce

1. Đăng ký tài khoản với email `dup@eshop-test.local`, mật khẩu `Password 123`
2. Quay lại `/register`
3. Đăng ký **lại** đúng email đó với tên khác
4. Đăng nhập admin, gọi `GET /api/admin/users`

### Expected

Bước 3 bị từ chối với thông báo "Email đã được sử dụng". Số dòng mang email đó = **1**.

### Actual

Bước 3 thành công. Số dòng mang email đó = **2**:

```json
[
  { "id": 49, "name": "Nguoi Dung Goc",   "email": "bug03...@eshop-test.local", "role": "user" },
  { "id": 50, "name": "Nguoi Dung Trung", "email": "bug03...@eshop-test.local", "role": "user" }
]
```

### Đề xuất sửa

Thêm `UNIQUE` cho cột `email` **và** kiểm tra tồn tại trong `POST /api/register`,
trả về HTTP 409 kèm thông báo rõ ràng.

---

## BUG-04 — Mật khẩu lưu plaintext và bị trả về trong response đăng nhập

- **Mức độ:** Critical
- **Thành phần:** `backend/server.js:20` (lưu) và `backend/server.js:52` (trả về)
- **Test:** TC-26 (fail)
- **Ảnh:** `../evidence/bugs/BUG-04-plaintext-password.png`

### Mô tả

Hai vấn đề chồng lên nhau:

1. `POST /api/register` `INSERT` thẳng mật khẩu thô, không hash:
   ```js
   db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], ...)
   ```
2. `POST /api/login` `SELECT *` rồi trả nguyên đối tượng `user` về client:
   ```js
   res.json({ message: "Login successful", token, user });
   ```
   nên response chứa luôn trường `password`.

### Steps to reproduce

1. `POST /api/register` với `{"name":"Plain Text","email":"plain@eshop-test.local","password":"Password 123"}`
2. `POST /api/login` với `{"email":"plain@eshop-test.local","password":"Password 123"}`
3. Đọc trường `user.password` trong response

### Expected

Mật khẩu được hash (bcrypt/argon2) khi lưu, và **không bao giờ** xuất hiện trong
bất kỳ response nào.

### Actual

```
Password sent at registration : "Password 123"
Password echoed by the API    : "Password 123"
Identical                     : true
```

Bất kỳ ai xem được response (DevTools, log proxy, biến thể XSS) đều lấy được mật
khẩu thô. Nếu database rò rỉ, toàn bộ mật khẩu lộ ngay lập tức.

### Đề xuất sửa

Hash bằng `bcrypt` khi đăng ký, so sánh bằng `bcrypt.compare` khi đăng nhập, và
loại bỏ trường `password` khỏi mọi payload trả về.

---

## BUG-05 — `GET /api/admin/users` không kiểm tra quyền

- **Mức độ:** High
- **Thành phần:** `backend/server.js:100` (`authenticateToken`) và `server.js:494`
- **Phạm vi:** thuộc **FR-12 (Access control)**, nằm ngoài FR-01 — ghi nhận vì phát hiện được trong quá trình xây bộ test FR-01
- **Test:** không có test riêng; xác minh thủ công

### Mô tả

Middleware `authenticateToken` chỉ xác minh chữ ký JWT, **không kiểm tra
`req.user.role`**:

```js
const authenticateToken = (req, res, next) => {
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();               // <-- không hề kiểm tra role
  });
};
```

Endpoint `/api/admin/users` chỉ gắn middleware này, nên **bất kỳ tài khoản thường
nào cũng đọc được toàn bộ danh sách người dùng**.

### Steps to reproduce

1. Đăng ký một tài khoản thường bất kỳ
2. Đăng nhập, lấy `token` (JWT có `role: "user"`)
3. `GET /api/admin/users` với header `Authorization: Bearer <token>`

### Expected

HTTP 403 Forbidden.

### Actual

HTTP 200, trả về toàn bộ bảng người dùng:

```
logged in as role=user
ADMIN ENDPOINT ACCESSIBLE by role='user' -> returned 52 user rows
```

### Đề xuất sửa

Thêm middleware `requireAdmin` kiểm tra `req.user.role === 'admin'` cho toàn bộ
nhóm route `/api/admin/*`.

---

## BUG-06 — `setup_guide.md` ghi sai mật khẩu admin

- **Mức độ:** Low (lỗi tài liệu)
- **Thành phần:** `eshop-sut/setup_guide.md:105` vs `eshop-sut/backend/database.js:92`

### Mô tả

Tài liệu hướng dẫn cài đặt ghi tài khoản admin mặc định là:

> **Email**: `admin@eshop.com` — **Mật khẩu**: `admin123`

nhưng script seed thực tế lại ghi:

```js
insertUser.run('Admin User', 'admin@eshop.com', 'Admin123!', 'admin');
```

### Tác động

Người dùng làm theo tài liệu sẽ đăng nhập sai. Do FR-02 có lỗi cộng dồn
`login_attempts + 2` với ngưỡng khoá là 3, **chỉ cần 2 lần thử theo tài liệu là
tài khoản admin bị khoá 180 giây** — và trong thời gian khoá, ngay cả mật khẩu
đúng cũng bị từ chối vì hệ thống kiểm tra khoá **trước** khi so mật khẩu.

Lỗi tài liệu này đã trực tiếp làm hỏng 5 test trong lần chạy đầu tiên của bộ
automation (xem R-08 trong báo cáo chính).

### Đề xuất sửa

Sửa `setup_guide.md` thành `Admin123!`, hoặc đổi seed cho khớp tài liệu.

---

## Trạng thái GitHub Issues

| Bug | Issue |
|---|---|
| BUG-01 | ⏳ chưa tạo |
| BUG-02 | ⏳ chưa tạo |
| BUG-03 | ⏳ chưa tạo |
| BUG-04 | ⏳ chưa tạo |
| BUG-05 | ⏳ chưa tạo |
| BUG-06 | ⏳ chưa tạo |

> Nội dung từng issue đã sẵn sàng trong tài liệu này; ảnh đính kèm nằm ở
> `23127195/evidence/bugs/`. Cần đăng nhập GitHub để tạo issue và cập nhật bảng
> trên với link tương ứng.
