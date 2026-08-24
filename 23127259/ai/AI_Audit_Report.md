# AI Audit Report

**Sinh viên:** Nguyễn Tấn Thắng - **MSSV:** 23127259

## 1. Declaration

Em sử dụng các công cụ AI để lập kế hoạch, sinh mã, review và sửa bộ Playwright automation cho FR-02, FR-07 và FR-16. Em chịu trách nhiệm đối chiếu từng assertion với SRS và thực thi bộ test cuối.

## 2. Interaction Log

### Interaction 1 - Initial architecture

- **Tool:** Gemini 3.1 Pro
- **Date/time:** 2026-08-16 20:47 +07:00
- **Prompt:** "Lên kế hoạch test cho FR-02, FR-07, FR-16 dựa trên SUT README; tạo Page Object Model và tách test data CSV/JSON."
- **AI output:** Proposed `LoginPage`, `CartPage`, `AdminImportPage`, JSON messages, credential/product CSV files, and Playwright specs.
- **Human review:** The generated POM and fixtures were retained as a starting point, but the first implementation only imported some CSV files without iterating them.

### Interaction 2 - Test generation

- **Tool:** Gemini 3.1 Pro
- **Date/time:** 2026-08-16 20:48 +07:00
- **Prompt:** "Sinh ít nhất 12 test cho mỗi feature, dùng tối thiểu ba assertion pattern và giữ assertion theo SRS cho các case @bug."
- **AI output:** Generated three specs with 38 initial tests and UI/API assertions.
- **Human review:** Weak total assertions, hardcoded payloads, and incomplete lockout checks were identified. Several red results were automation failures rather than SUT defects.

### Interaction 3 - Multi-browser configuration

- **Tool:** Gemini 3.1 Pro
- **Date/time:** 2026-08-16 20:50 +07:00
- **Prompt:** "Cấu hình Playwright cho Chromium, Firefox, WebKit; tự khởi động backend/web/admin và hiển thị Run by: 23127259 cùng ISO timestamp."
- **AI output:** Added three projects, three web servers, metadata, HTML/JSON reporters, and a multi-browser runner.
- **Human review:** The runner originally ignored process failures and Firefox/WebKit were not installed, so the generated reports were not valid browser evidence.

### Interaction 4 - Repository audit and repair

- **Tool:** OpenAI Codex
- **Date/time:** 2026-08-24 16:45-17:07 +07:00
- **Prompt:** "Hãy đọc kĩ đề rồi từ đó bổ sung những cái còn thiếu và chưa làm cho tôi."
- **AI output:** Re-read the eight-page assignment; repaired POM navigation/selectors; converted fixtures to real DDT; expanded the suite to 45 cases; separated `@bug` and unexpected failures; installed browser engines; generated nine reports; verified metadata visually; created and validated an Agent Skill; completed Markdown/PDF deliverables.
- **Human review required:** Ở giai đoạn đó, em vẫn phải tự kiểm tra diff/report và quay hai video bằng danh tính, giọng nói của em. Sau đó em đã hoàn thành video; GitHub Issues và Pull Requests được tạo bằng tài khoản `thangak18` đã xác thực. AI không tạo giả evidence tác giả.

### Interaction 5 - Match the completed teammate presentation and publish evidence

- **Tool:** OpenAI Codex + GitHub CLI authenticated as `thangak18`
- **Date/time:** 2026-08-24 17:10-19:22 +07:00
- **Prompt:** "Bạn check xem thành viên Trần Mạnh Hùng làm xong chưa, rồi bạn làm theo tương tự cách trình bày như bạn Hùng nhé, làm bằng acc github thangak18 nhé."
- **AI output:** Verified Hùng's two YouTube links and 15 Issues; restructured README/Main/Bug Report/Agent Skill like the evidence-first reference; created Issues #16-#35; opened and merged PR #36; added detailed Vietnamese video scripts through PR #38; replaced all generated evidence cards with 20 raw Playwright HTML-report screenshots without text overlays and merged that correction through PR #39 (`dbdbc3d1df431b02910a7576da11f8cc7bbf03ba`); regenerated and visually checked the PDF package.
- **Human review:** Verified Issue/PR authorship, raw-image accessibility, PDF rendering, the 24/24 non-`@bug` gate, the 72/63/0 test matrix, and 9/9 report metadata. YouTube metadata for the two supplied links confirmed author `Thắng Nguyễn`, HTTP accessibility, and durations of 12:02 and 8:27 before final publication.
