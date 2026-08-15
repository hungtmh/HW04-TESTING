# AI Critique

**Sinh viên:** 23127195 — **HW04 Automation Testing** — 2026-08-15

---

AI rất mạnh ở phần khung: nó dựng cấu hình Playwright ba trình duyệt, Page Object
và bộ dữ liệu CSV/JSON trong vài phút. Nhưng ba sai lầm của nó đều nằm ở chỗ khó
thấy nhất.

Thứ nhất, AI mặc định form được viết đúng chuẩn accessibility nên sinh
`getByLabel('Họ Tên')`; thực tế `Register.jsx` không gắn `htmlFor` nên locator trả
về 0 phần tử. Nó suy diễn theo form React điển hình thay vì theo mã nguồn thật.

Thứ hai, nghiêm trọng nhất: AI chứng minh "tài khoản không được tạo" bằng cách
assert URL chưa đổi ngay sau khi bấm nút. Assertion khớp tức thì vì SPA chưa resolve
xong request, nên bốn test báo xanh trên một hệ thống đang chấp nhận email rác —
bộ test che giấu đúng lỗi nó được viết ra để tìm. Đây là lỗi thứ tự thời gian, không
phải cú pháp: code chạy được, test xanh, không tín hiệu nào cảnh báo.

Thứ ba, khi được đưa mã nguồn, AI viết test khớp hành vi đang có — nó đề xuất kỳ
vọng "`Password123!` bị từ chối" vì đọc regex thấy vậy. Test kiểu đó luôn xanh và
biến bug thành đặc tả.

Nguyên nhân chung: AI tối ưu cho "chạy được ngay", còn kiểm thử đòi hỏi phát hiện
sai lệch so với đặc tả — hai mục tiêu ngược chiều nhau.

Nguyên tắc tôi rút ra: nguồn chân lý của test là đặc tả, không phải mã nguồn; một
test xanh chưa chứng minh phần mềm đúng, nó có thể chỉ chứng minh assertion đặt sai
chỗ. Và phải đọc **lý do** test đỏ chứ không chỉ đếm số đỏ — có lúc năm test đỏ vì
tài khoản admin bị khoá, hoàn toàn không liên quan lỗi chúng nhắm tới.
