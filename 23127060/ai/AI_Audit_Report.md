# AI AUDIT REPORT — HW04 Automation Testing (EShop)

- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**
- **Nguồn:** tổng hợp từ `ai/AI_Log.md` (12 entry, append-only, ghi ngay tại thời điểm làm việc)
- **Timezone:** Asia/Ho_Chi_Minh (+07:00)

---

## Khai báo bắt buộc

> **"I use AI tools for the following tasks"**

| # | Công việc | AI có làm | Người làm |
|---|---|---|---|
| 1 | Đọc source SUT, lập bảng route ↔ selector ↔ API ↔ rủi ro | ✅ Claude Code | Khải xác minh lại port bằng cách chạy server |
| 2 | Thiết kế bảng 54 test case | ✅ Claude Code | 🧑 Khải **duyệt & ký** (Phase 1) |
| 3 | Sinh 6 file dữ liệu JSON/CSV (77 record) | ✅ Claude Code | Khải kiểm tra độ phủ edge case |
| 4 | Viết 5 Page Object + 3 spec (80 test) | ✅ Claude Code | 🧑 Khải **review selector & assertion** (Phase 4) |
| 5 | Chạy test, đọc `results.json`, phân tích fail | ✅ Claude Code | — |
| 6 | Viết script hạ tầng (multibrowser, banner, summarize, evidence) | ✅ Claude Code | — |
| 7 | Soạn BUG_REPORT, Main Report, Audit, Critique, README | ✅ Claude Code | 🧑 Khải review nội dung, chốt severity |
| 8 | Chụp ảnh minh chứng bug | ✅ Claude Code (Playwright thật) | — |
| 9 | **Tạo GitHub repo, push, tạo Issue** | ❌ | 🧑 **Khải** |
| 10 | **Quay video demo, thuyết minh giọng thật, upload YouTube** | ❌ | 🧑 **Khải** |
| 11 | **Chốt điểm tự đánh giá, đóng gói, nộp Moodle** | ❌ | 🧑 **Khải** |
| 12 | **Bảo vệ vấn đáp** | ❌ | 🧑 **Khải** |

---

## Bảng nhật ký AI (từ `AI_Log.md`)

| STT | Tool | Thời điểm (+07:00) | Phase | Mục đích | Prompt (rút gọn) | Output | Human action |
|---|---|---|---|---|---|---|---|
| LOG-001 | Notion AI | 2026-08-22T15:40:12 | P-init | Phân tích đề, thiết kế quy trình | *"…phân tích đề bài, thiết kế ra SKILL.md để guideline AI agent làm việc, chia task từng bước… phần nào cần human verified thì để tui…"* | `agent-skill/SKILL.md` (9 phase, luật scope, chuẩn data-driven, quy tắc ghi AI Log), `ai/AI_Log.md` khởi tạo | Khải đọc & chấp nhận quy trình |
| LOG-002 | Claude Code | 2026-08-22T20:24:00 | P0 Recon | Khảo sát SUT, dựng khung | *"Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline. Remember to commit after each phase"* | `00-SUT-RECON.md`, `playwright.config.js`, 4 file utils. Xác minh **9 hành vi lỗi bằng curl thật** | Khải xác nhận port thật khi chạy `run_servers.sh` |
| LOG-003 | Claude Code | 2026-08-22T20:38:00 | P1 Test case | Thiết kế test case | *(cùng prompt trên)* | `01-TEST-CASES.md` — 54 TC, 12 case không automate được kèm lý do | 🧑 **Duyệt & ký bảng test case** |
| LOG-004 | Claude Code | 2026-08-22T20:52:00 | P2 Data | Sinh dữ liệu test | *(cùng prompt trên)* | 6 file JSON/CSV, 77 record, có cột `bug` + `source` truy vết | Khải kiểm độ phủ edge case |
| LOG-005 | Claude Code | 2026-08-22T21:10:00 | P3 FR-03 | Page Object + spec FR-03 | *(cùng prompt trên)* | `ForgotPasswordPage.js`, `LoginPage.js`, spec 30 test. **Lần 1 fail 9 test** do hiểu sai role của `input[type=password]`; đã sửa | Khải review selector |
| LOG-006 | Claude Code | 2026-08-22T21:26:00 | P3 FR-08 | Page Object + spec FR-08 | *(cùng prompt trên)* | `CartPage.js`, `CheckoutPage.js`, spec 25 test. Xác nhận `SAVE10` làm tổng tiền ×10 | Khải review assertion |
| LOG-007 | Claude Code | 2026-08-22T21:44:00 | P3 FR-15 | Page Object + spec FR-15 | *(cùng prompt trên)* | `AdminProductPage.js`, spec 25 test. Bắt bug "fake mass update" bằng assertion kép UI+API | Khải review |
| LOG-008 | Claude Code | 2026-08-22T22:05:00 | P4 Review | Tự phê bình & vá | *(cùng prompt trên)* | `02-AI-GAP-ANALYSIS.md` — **7 GAP** có bằng chứng, đã sửa 5 GAP trong code | 🧑 **Ký xác nhận đã review script** |
| LOG-009 | Claude Code | 2026-08-22T22:35:00 | P5 Run | 9 run multi-browser | *(cùng prompt trên)* | 4 script hạ tầng, 9 report, `03-RUN-SUMMARY.md`. **240/240 passed**, 9/9 banner hợp lệ | 🧑 **Mở 9 report, chụp màn hình banner** |
| LOG-010 | Claude Code | 2026-08-22T23:02:00 | P6 Bug | Bug report + evidence | *(cùng prompt trên)* | `BUG_REPORT.md` 28 bug, 11 ảnh PNG thật, 28 lệnh `gh issue create` (LOG-010 ghi nhầm "27 bug", đã đính chính ở LOG-013) | 🧑 **Tạo GitHub Issue, đính ảnh** |
| LOG-011 | Claude Code | 2026-08-22T23:20:00 | P7 Docs | Tài liệu | *(cùng prompt trên)* | Main Report, AI Audit, AI Critique (313→296 từ sau 3 lần cắt), README, 2 kịch bản video, 9 PDF | Khải review, chốt severity |
| LOG-012 | Claude Code | 2026-08-22T23:45:00 | P8 Đóng gói | Bổ sung test, vá GAP-08/09, xuất git log | *(cùng prompt trên)* | +3 test (83 tổng), 9 commit chạm `*.spec.js`, 249/249 pass, 2 file git log | 🧑 **Push repo, đóng gói, nộp** |

> **Ghi chú về prompt:** Khải gửi **một** prompt duy nhất yêu cầu agent thực hiện toàn bộ quy trình
> theo SKILL.md. Agent tự chia thành 8 phase, mỗi phase 1 commit + 1 entry log để giữ nguyên tinh thần
> "AI-first nhưng từng bước" của SKILL.md §0.3. Prompt nguyên văn được lặp lại đầy đủ ở mỗi entry
> trong `AI_Log.md` đúng theo template.

---

## Thống kê mức độ chấp nhận output của AI

| Loại output | Số lượng | Nhận xét |
|---|---|---|
| Dùng được ngay (Accepted) | ~70% | Cấu trúc thư mục, file dữ liệu, script hạ tầng, phần lớn assertion |
| Phải sửa mới dùng được (Accepted-with-fix) | ~30% | 9 GAP ở `02-AI-GAP-ANALYSIS.md` + 2 lỗi hạ tầng ở Phase 5 + 1 lỗi ở Phase 6 |
| Bỏ hẳn (Rejected) | 0 | Không có output nào phải vứt đi hoàn toàn |

**13 lỗi thật của AI đã được ghi nhận và sửa:**

| # | Lỗi | Phát hiện nhờ | Phase |
|---|---|---|---|
| 1 | Hiểu sai: `input[type=password]` **có** role `textbox` ⇒ strict mode violation, 9 test fail | Chạy thật | P3 |
| 2 | Assertion so hằng số với hằng số (không kiểm thử gì) | Tự đọc lại code | P4 |
| 3 | Đếm số dòng bảng quá sớm ⇒ hở race khi chạy song song | Tự đọc lại code | P4 |
| 4 | Phủ định kép `.toBe(!c.expect.scriptDidNotExecute)` khó đọc | Tự đọc lại code | P4 |
| 5 | Mốc chờ không phụ thuộc dữ liệu ⇒ có thể đọc bảng rỗng | Tự đọc lại code | P4 |
| 6 | Happy path không kiểm tra đúng sản phẩm nào vào giỏ | Tự đọc lại code | P4 |
| 7 | Biến thể token 4 số có 1/9000 xác suất trùng token thật | Phân tích không gian giá trị | P3 |
| 8 | Mặc định firefox/webkit đã cài ⇒ 28 test không chạy nổi mà báo "52 passed" | Chạy thật | P4 |
| 9 | `spawnSync('npx.cmd')` trên Windows ⇒ 9/9 run trả `exit=null` sau 0.0s | Chạy thật | P5 |
| 10 | Chụp màn hình bên trong dialog handler ⇒ treo renderer, timeout 30s | Chạy thật | P6 |
| 11 | `isVisible()` **không chờ** ⇒ `itemRowCount()` trả `-1` khi React chưa render (chỉ WebKit mới lộ) | Chạy thật trên WebKit | P8 |
| 12 | Coi "alert đã đóng" là mốc an toàn để đọc DOM ⇒ đếm dòng bảng ra 0 (chỉ WebKit mới lộ) | Chạy thật trên WebKit | P8 |
| 13 | **Đếm sai số bug tổng kết**: ghi 27 trong khi tài liệu có 28 mục | `grep -c` đối chiếu | P8 |

**Nhận xét:** 7/13 lỗi chỉ lộ ra khi **chạy thật** (1, 8, 9, 10, 11, 12 và một phần 7); 5 lỗi lộ ra khi
**đọc lại code với tâm thế phản biện**; 1 lỗi (số 13) chỉ lộ ra khi **đếm bằng lệnh thay vì bằng mắt**.
Không lỗi nào tự biến mất — nếu bỏ qua Phase 4 và chỉ nhìn dòng "80 passed", toàn bộ 5 điểm yếu về
chất lượng assertion sẽ đi thẳng vào bài nộp.

**Lỗi 13 đáng suy nghĩ nhất trong ngữ cảnh môn Kiểm thử:** AI viết đúng 28 mục bug chi tiết, đúng 28 dòng
trong bảng tổng quan, nhưng phần tổng kết lại ghi "27 bug". Con số tóm tắt **không khớp với dữ liệu ngay
phía trên nó**, và không script nào trong bài bắt được — chỉ `grep -c` đối chiếu mới phát hiện.
Đây chính là loại lỗi mà kiểm thử tồn tại để chống lại: **thứ trông có vẻ đúng và không ai kiểm lại**.

Đáng chú ý nhất là **lỗi 11 và 12**: cả hai **pass sạch trên chromium kể cả với `--repeat-each=2`**, và chỉ
fail khi chạy WebKit. Nói cách khác, tiêu chí "ổn định 2 lần liên tiếp" mà chính SKILL.md đặt ra **vẫn chưa đủ** —
phải chạy đủ 3 trình duyệt mới phát hiện. Đây là lý do bước multi-browser không chỉ để lấy điểm rubric.

---

## Ranh giới AI ↔ con người

**AI làm tốt:** đọc nhanh 1.600 dòng source để trích selector kèm số dòng; sinh dữ liệu boundary có hệ thống;
viết script hạ tầng lặp đi lặp lại; soạn tài liệu dài đúng cấu trúc; chạy và đọc kết quả test.

**AI không thay được con người:** quyết định bug nào là *Critical* trong ngữ cảnh nghiệp vụ; phán đoán
một hành vi lạ là bug hay là thiết kế cố ý; **tin được hay không** một dòng "passed" — vì chính AI là bên
đã viết cả test lẫn kỳ vọng, nên nó không có tư cách tự xác nhận mình đúng.

**Kết luận:** AI rút ngắn rất nhiều thời gian ở phần *cơ học*, nhưng phần *phán đoán* — thiết kế giá trị biên,
đọc lại assertion với thái độ hoài nghi, chạy thật để kiểm chứng — vẫn quyết định chất lượng cuối cùng.
Hai bug đáng giá nhất tìm thêm được (BUG-08-07, BUG-08-08) đến từ **kỹ thuật thiết kế test**, không phải từ việc dùng AI.
