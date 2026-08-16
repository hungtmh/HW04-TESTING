# VIDEO 2: KỊCH BẢN AGENT SKILL (Thời lượng dự kiến: 2-3 phút)

**Người trình bày:** Nguyễn Tấn Thắng (23127259)
**Mục tiêu:** Thể hiện việc biết cách ứng dụng AI (Gemini) làm trợ lý ảo (Agent) phối hợp giải quyết các task phức tạp trong quá trình làm tự động hóa.

---

## Phần 1: Giới thiệu Agent Skill (0:00 - 0:45)
- **Hành động:** Mở khung chat với AI (Gemini Antigravity hoặc tương đương) bên cạnh source code.
- **Thoại:** 
  > "Tiếp theo, mình xin trình bày quá trình sử dụng AI dưới vai trò là một Agentic Coding Assistant. Trong project này, thay vì chỉ hỏi đáp đơn giản, mình đã sử dụng hệ thống AI Antigravity tích hợp với IDE."
  > "AI có khả năng đọc toàn bộ thư mục SUT, phân tích tài liệu `README.md` (SRS) và mã nguồn của ứng dụng để tự hiểu context hệ thống trước khi bắt đầu code."

## Phần 2: Demo Khả Năng Lên Kế Hoạch & Viết Script (0:45 - 1:45)
- **Hành động:** 
  1. Mở file `implementation_plan.md` do AI generate.
  2. Cuộn qua các bước giải quyết.
  3. Mở file CSV test data và POM.
- **Thoại:** 
  > "Đầu tiên, mình giao cho AI phân tích 3 features FR-02, FR-07, FR-16. AI đã tự động sử dụng tool tìm kiếm file để rà soát thư mục backend và frontend. Sau đó, nó vạch ra `implementation_plan.md` cực kỳ chi tiết bao gồm những lỗi nó tìm thấy ngay cả trước khi chạy."
  > "Khi được cấp quyền thực thi, AI tự động tạo các Page Object Model như `CartPage.js`, sau đó chia tách Test Data ra các file CSV, JSON theo chuẩn DDT (Data-Driven Testing)."

## Phần 3: Phối Hợp Human-in-the-Loop (1:45 - 2:30)
- **Hành động:** Mở file `tests/fr16-import-csv.spec.js` đoạn test với RFC 4180.
- **Thoại:** 
  > "Trong quá trình làm việc, không phải lúc nào AI cũng đúng. Mình đã đóng vai trò duyệt code (Reviewer). Chẳng hạn ở tính năng Import CSV, ban đầu AI quên mất kiểm thử edge case về RFC4180 (dấu phẩy nằm trong chuỗi). Mình đã nhắc nhở và yêu cầu AI tạo riêng file `fr16-rfc4180-quoted.csv` để phát hiện ra lỗi split chuỗi bằng dấu phẩy thông thường trên SUT."
  > "Quá trình hợp tác này giúp tiết kiệm 80% thời gian code, đồng thời giữ được chất lượng kiểm thử ở mức độ chuyên gia."

## Phần 4: Kết luận (2:30 - end)
- **Hành động:** Mở qua folder report.
- **Thoại:** 
  > "Toàn bộ đánh giá về ưu/nhược điểm và lịch sử tương tác AI đã được lưu trữ tại file `AI_Critique.md` và `AI_Audit_Report.md`. Cảm ơn thầy và các bạn đã lắng nghe!"
