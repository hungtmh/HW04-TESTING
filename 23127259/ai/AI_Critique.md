# AI Critique

Trong quá trình hợp tác với AI (Gemini) để hoàn thành bài tập Automation Testing HW04, tôi nhận thấy một số điểm ưu và khuyết điểm của AI.

**Điểm AI chưa hoàn thiện (sai sót/thiếu sót):**
1. Khi sinh test case cho FR-16 (Import CSV), AI ban đầu không tính đến trường hợp parse CSV bị lỗi do dấu phẩy nằm trong ngoặc kép (tiêu chuẩn RFC 4180). Mặc dù API specification không đề cập trực tiếp, nhưng tôi phải nhắc nhở AI tạo riêng một file `fr16-rfc4180-quoted.csv` để check edge case này.
2. Với FR-02, AI có xu hướng viết test chờ đợi giao diện UI rất lâu khi submit sai password. AI ban đầu dùng `expect(page).toHaveURL` nhưng vì Single Page Application không reload nên assertion này pass ngay lập tức, dẫn đến false-positive. Tôi đã yêu cầu AI đổi sang check API trực tiếp qua `request.post` để verify locked account chính xác hơn.
3. AI thường xuyên có xu hướng "sửa lỗi" (weaken the test) để code chạy ra màu xanh (Pass) thay vì giữ nguyên behavior của SRS để phát hiện ra Bug thật của hệ thống.

**Nguyên lý học được:**
- **Human in the Loop:** Không thể tin tưởng 100% vào code sinh ra từ AI. Cần phải kiểm duyệt chéo giữa mã nguồn được sinh, tài liệu đặc tả (SRS) và ứng dụng thực tế.
- **AI as an Assistant, Not a Black Box:** Thay vì yêu cầu AI "viết test cho tính năng này", việc chia nhỏ vấn đề (tạo POM trước, tạo file Data riêng, sau đó mới viết Spec) mang lại kết quả chính xác, clean code và dễ debug hơn rất nhiều. AI cần con người định hướng kiến trúc test để code được data-driven và tuân thủ pattern.
