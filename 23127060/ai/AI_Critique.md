# AI CRITIQUE — 23127060 Ninh Văn Khải

> Yêu cầu: 200–300 từ. Số từ thật được đếm bằng `node scripts/count-words.mjs` và ghi ở cuối file.

---

Dùng Claude Code cho HW04, thứ đáng nhớ nhất không phải tốc độ sinh code mà là cách AI sai.

Nó không sai kiểu ngập ngừng. AI khẳng định Playwright không gán role `textbox` cho ô mật khẩu, rồi
viết hẳn một comment giải thích cho khẳng định đó — trông y hệt kiến thức đã kiểm chứng. Chạy thật,
chín test đổ vì strict mode. Bài học không phải "AI hay sai", mà là AI diễn đạt phỏng đoán bằng đúng
giọng điệu của sự thật, nên đọc code không đủ để phát hiện.

Kiểu sai thứ hai tinh vi hơn. Đề yêu cầu tối thiểu ba assertion pattern, AI liền nhét thêm cho đủ số:
một dòng so hằng số với hằng số, không chạm tới hệ thống. Test vẫn xanh, rubric vẫn tính là đủ pattern,
mà chẳng kiểm thử gì. AI tối ưu theo tiêu chí đo được, không theo mục đích thật của tiêu chí.

Kiểu thứ ba: AI mặc định thế giới hoàn hảo — chỉ mình nó dùng cơ sở dữ liệu, máy đã cài sẵn mọi trình
duyệt. Lần chạy Firefox đầu tiên báo "52 passed", nghe như thành công một phần, thực chất 28 test không
khởi động nổi trình duyệt.

Điều giữ được chất lượng là Phase 4: bắt AI tự đọc lại chính nó. Bảy điểm yếu lộ ra, năm cái tôi sửa
ngay trong code. Nhưng bước đó cũng cho thấy giới hạn — AI vừa viết test vừa viết kỳ vọng, nên không có
tư cách tự xác nhận mình đúng. Hai bug giá trị nhất đến từ phân tích giá trị biên, không phải từ AI.

AI viết nhanh hơn tôi rất nhiều. Nhưng thứ quyết định bài này vẫn là hoài nghi và chạy thật.

---

**Số từ (đếm tự động bởi `scripts/count-words.mjs`):** **296 từ** — ✅ nằm trong khoảng 200–300 từ theo yêu cầu

<sub>Đếm lúc 2026-08-22T14:27:55.918Z. Bỏ qua tiêu đề, ghi chú và inline code.</sub>
