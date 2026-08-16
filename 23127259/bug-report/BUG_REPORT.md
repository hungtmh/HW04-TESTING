# Bug Reports (19 Bugs Phát Hiện Bằng Automation)

Dưới đây là danh sách 19 bugs được phát hiện khi chạy bộ Automation Test Scripts bằng Playwright. Các test cases này được đánh dấu `[Tag: @bug]` và bị Fail cố ý vì SUT vi phạm tài liệu Đặc tả Yêu cầu (SRS).

Tất cả bugs này đã được tham chiếu và chuẩn bị log lên hệ thống GitHub Issues của repo `HW04-TESTING`.

---

## FR-02: Login & Account Lockout (8 Bugs)

1. **BUG-LOGIN-01**: Tiêu đề trang Login hiển thị sai là "Đăng Ký" (SRS: "Đăng Nhập").
2. **BUG-LOGIN-02**: Label trường Email hiển thị "Username" thay vì "Email" (SRS: FR-22).
3. **BUG-LOGIN-03**: Password input có `type="text"` làm lộ mật khẩu (SRS: FR-22 `type="password"`).
4. **BUG-LOGIN-04**: Nút Đăng nhập có nhãn "Sign In" (SRS: FR-21 yêu cầu dùng tiếng Việt).
5. **BUG-LOGIN-05**: Đăng nhập sai 1 lần nhưng hệ thống tự tăng `login_attempts` lên 2 (SRS: tăng đúng 1 đơn vị).
6. **BUG-LOGIN-06**: Khi bị khóa, tài khoản khóa 180 giây (SRS: 30 giây).
7. **BUG-LOGIN-07**: Thông báo lỗi hiển thị bên dưới nút submit (SRS: FR-22 yêu cầu hiển thị TRÊN nút submit).
8. **BUG-LOGIN-08**: Security: Mật khẩu lưu dưới dạng plaintext, so sánh trực tiếp bằng toán tử `===` (SRS: SEC-01).

---

## FR-07: Shopping Cart (6 Bugs)

9. **BUG-CART-01**: Khi thêm cùng 1 sản phẩm nhiều lần, giỏ hàng tạo thành nhiều dòng riêng biệt thay vì tăng số lượng (SRS: FR-07).
10. **BUG-CART-02**: Bấm xóa sản phẩm khỏi giỏ hàng thực thi ngay lập tức mà không có Dialog xác nhận (SRS: FR-07).
11. **BUG-CART-03**: Nhãn tổng tiền hiển thị là "Tổng tạm tính" (SRS: Yêu cầu nhãn phải là "Tổng cộng").
12. **BUG-CART-04**: Không có nút +/- để thay đổi số lượng sản phẩm trực tiếp trong giỏ hàng (SRS: FR-07).
13. **BUG-CART-05**: Khi giỏ hàng trống (Empty State) không có hình ảnh/icon minh họa (SRS: FR-24).
14. **BUG-CART-06**: Nút quay lại trang chủ có nhãn "← Mua tiếp" (SRS: FR-07 yêu cầu nhãn "Tiếp tục mua sắm").

---

## FR-16: Product Import từ CSV (5 Bugs)

15. **BUG-CSV-01**: Backend không thực hiện validate giá trị `price`, cho phép import sản phẩm có giá âm (SRS: FR-15/FR-16).
16. **BUG-CSV-02**: Quá trình import thiếu cơ chế Transaction (all-or-nothing). Khi 1 dòng lỗi, các dòng khác vẫn được import (SRS: FR-16).
17. **BUG-CSV-03**: Frontend parse CSV bằng `.split(',')` nên không hỗ trợ các nội dung có dấu phẩy nằm trong ngoặc kép (RFC 4180).
18. **BUG-CSV-04**: API `POST /api/admin/import-products` chỉ kiểm tra token hợp lệ mà bỏ qua kiểm tra `role='admin'` (SRS: FR-12 / SEC-03).
19. **BUG-CSV-05**: File Input trên giao diện không có thuộc tính `accept=".csv"` để lọc giới hạn định dạng (SRS: FR-16).
