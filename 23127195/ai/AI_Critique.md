# AI Critique

**Sinh viên:** 23127195 — **HW04 Automation Testing** — 2026-08-15

---

AI rất mạnh ở phần khung: nó dựng cấu hình Playwright ba trình duyệt, ba Page
Object và sáu file dữ liệu trong vài phút. Nhưng sai lầm của nó nằm ở chỗ khó
thấy nhất.

Nghiêm trọng nhất: AI chứng minh "tài khoản không được tạo" bằng cách assert URL
chưa đổi ngay sau khi bấm nút. Assertion khớp tức thì vì SPA chưa resolve xong
request, nên bốn test báo xanh trên một hệ thống đang chấp nhận email rác — bộ
test che giấu đúng lỗi nó được viết ra để tìm. Đây là lỗi thứ tự thời gian, không
phải cú pháp: code chạy được, test xanh, không tín hiệu nào cảnh báo.

Thứ hai, AI giả định form viết đúng chuẩn accessibility nên sinh `getByLabel()`;
thực tế label không gắn `htmlFor`, locator trả về 0 phần tử — và nó lặp lại đúng
sai lầm ấy ở màn hình admin.

Thứ ba, khi được đưa mã nguồn, AI viết test khớp hành vi đang có: nó đề xuất kỳ
vọng "`Password123!` bị từ chối" vì đọc regex thấy vậy. Test kiểu đó luôn xanh và
biến bug thành đặc tả. Nguyên nhân chung: AI tối ưu cho "chạy được ngay", còn
kiểm thử đòi hỏi phát hiện sai lệch so với đặc tả.

Bài học lớn nhất lại đến từ chính bản vá của tôi: khi sửa lỗi phân tích số tiền,
tôi bỏ dấu phẩy khỏi regex và làm sáu test đang xanh chuyển đỏ, vì trình duyệt
render theo locale en-US. Bản vá cũng phải được kiểm chứng lại như mã gốc. Và
phải đọc **lý do** test đỏ chứ không chỉ đếm số đỏ — có lúc năm test đỏ vì tài
khoản admin bị khoá, không liên quan lỗi chúng nhắm tới.
