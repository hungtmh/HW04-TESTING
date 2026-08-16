# Main Report - Test Automation (HW04)

## 1. Môi trường kiểm thử
- **Mã sinh viên:** 23127259
- **Hệ điều hành:** macOS (thông qua Node 25.2)
- **Công cụ automation:** Playwright
- **Trình duyệt (Browsers):** Chromium, Firefox, WebKit (Cấu hình song song).
- **Mục tiêu SUT:** E-commerce System (React Frontend, Node/SQLite Backend, Admin Panel).

## 2. Kết quả chạy tự động đa trình duyệt (Multi-Browser Output)
Chi tiết log và kết quả Pass/Fail có trong thư mục `playwright-report/` (HTML files đã được generate).
Tổng số test cases được viết: 38 (mỗi tính năng ≥ 12 test cases).
Tổng số test executed: 38.

| Tính năng (Feature) | Số TC | Browser | Đánh giá | Ghi chú |
|---|---|---|---|---|
| FR-02 (Login & Lockout) | 12 | Chromium, Firefox, WebKit | 4 Passed, 8 Failed (Bugs) | Account lockout không đúng thiết kế (tự động cộng 2 thay vì 1), sai title trang, label sai, password type text. |
| FR-07 (Shopping Cart) | 14 | Chromium, Firefox, WebKit | 8 Passed, 6 Failed (Bugs) | Thêm cùng SP tạo dòng mới, tổng hiển thị sai, xóa không cảnh báo, không có button tăng giảm SL. |
| FR-16 (Product Import) | 12 | Chromium, Firefox, WebKit | 7 Passed, 5 Failed (Bugs) | Upload file chấp nhận file âm (price < 0), transaction xử lý sai (insert nửa chừng), RFC4180 dấu phẩy bị split sai. |

## 3. Kiến trúc Automation
- **Design Pattern:** Sử dụng mô hình **Page Object Model (POM)**: `LoginPage`, `CartPage`, `AdminImportPage`.
- **Data-Driven Testing (DDT):** Mọi data (credentials, danh sách sản phẩm, URLs, thông báo lỗi) đều được đọc từ các file CSV (`*-products.csv`, `*-credentials.csv`) và JSON (`*-cases.json`). Các test cases load parameters từ data files giúp code tái sử dụng tốt.
- **Tiêu chuẩn Testing:** API calls được gom lại trong `tests/utils/api.js` để tiện cho setup/teardown (ví dụ create customer trước khi test giỏ hàng) và skip UI nếu cần test performance (ví dụ bypass UI để force lockout limit).

## 4. Tóm tắt Bugs (Overview)
- Tìm thấy 19 bugs trên hệ thống, phân bổ ở 3 tính năng. Cấu trúc HTML UI có vẻ được dev code ẩu (đặt lộn xộn các thẻ tag như h2/h3, class CSS) và API thiếu validate dữ liệu nghiêm ngặt.
- Chi tiết xem file `Bug_Report.md`.
