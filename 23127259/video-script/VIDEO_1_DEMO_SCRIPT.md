# VIDEO 1: KỊCH BẢN DEMO REPORT (Thời lượng dự kiến: 3-5 phút)

**Người trình bày:** Nguyễn Tấn Thắng (23127259)
**Mục tiêu:** Chứng minh các test scripts (FR-02, FR-07, FR-16) đã chạy thành công trên nhiều trình duyệt và bắt được các bugs trên hệ thống.

---

## Phần 1: Giới thiệu (0:00 - 0:30)
- **Hành động:** Mở camera (nếu có), màn hình đang mở IDE (VS Code) hiện cấu trúc thư mục dự án và file `README.md`.
- **Thoại:** 
  > "Chào thầy và các bạn. Mình là Nguyễn Tấn Thắng, mã số sinh viên 23127259. Hôm nay mình xin demo kết quả bài tập Automation Testing HW04 của mình. Hệ thống mục tiêu (SUT) là EShop với 3 thành phần Backend, Frontend Web và Frontend Admin."
  > "Mình đã chọn 3 tính năng là FR-02 (Đăng nhập), FR-07 (Giỏ hàng) và FR-16 (Admin Import CSV)."

## Phần 2: Demo Chạy Script Tự Động (0:30 - 2:00)
- **Hành động:** 
  1. Mở Terminal.
  2. Gõ lệnh `npm run test` (Hoặc có thể chọn chạy 1 script nếu chạy toàn bộ quá lâu: `npm run test:fr02 -- --project=chromium --headed`).
  3. Chỉ vào việc Playwright tự động khởi tạo webServer trước khi chạy test.
- **Thoại:** 
  > "Ở bước cấu hình, mình đã thiết lập Playwright tự động bật Backend, Frontend và Admin panel trước khi chạy test để đảm bảo môi trường là chuẩn và tách biệt hoàn toàn."
  > "Tiếp theo, mình sẽ tiến hành chạy lệnh test. Như các bạn thấy, Playwright đang tự động tương tác với giao diện để kiểm tra tính năng. Mọi thông tin test (data) đều được lấy từ file CSV và JSON, tuân thủ nguyên tắc Data-Driven."

## Phần 3: Trình Bày HTML Report (2:00 - 3:30)
- **Hành động:** 
  1. Mở HTML Report lên trình duyệt bằng lệnh `npx playwright show-report`.
  2. Chỉ vào dòng Metadata ở góc trên cùng bên trái.
  3. Lướt qua danh sách các test cases passed và failed.
- **Thoại:** 
  > "Sau khi chạy xong, đây là Playwright HTML Report. Ở phần Metadata, báo cáo đã ghi nhận chính xác 'Run by: 23127259' và thời gian thực thi như yêu cầu của đề bài."
  > "Bộ test đã chạy trên cả 3 trình duyệt: Chromium, Firefox và WebKit. Chúng ta có tổng cộng 38 test cases."
  > "Các test cases màu xanh (Passed) chứng tỏ flow hoạt động bình thường."

## Phần 4: Demo Phát Hiện Bug (3:30 - 4:30)
- **Hành động:** 
  1. Bấm mở một Test Case màu đỏ (Failed), ví dụ TC07 của FR-02 hoặc TC09 của FR-16.
  2. Chỉ vào phần "Errors" hiển thị log assert bị fail.
- **Thoại:** 
  > "Đặc biệt, hệ thống đã bắt được 19 lỗi vi phạm tài liệu Đặc tả SRS. Ví dụ ở FR-02, tính năng Account Lockout cấu hình sai số lần cảnh báo; hay ở FR-16, Backend lại không validate giá trị tiền âm."
  > "Các test cases này được mình đánh tag `@bug` và sử dụng lệnh assert cố ý fail để xuất ra lỗi chính xác thay vì weaken the test."
  > "Toàn bộ danh sách 19 bugs đã được mình liệt kê trong file `BUG_REPORT.md` kèm theo."

## Phần 5: Kết thúc (4:30 - 5:00)
- **Hành động:** Quay lại màn hình `README.md`.
- **Thoại:** 
  > "Tất cả các tài liệu đánh giá AI, kịch bản, cùng file log git commit đã được đóng gói theo đúng cấu trúc yêu cầu. Cảm ơn thầy và các bạn đã theo dõi phần trình bày của mình."
