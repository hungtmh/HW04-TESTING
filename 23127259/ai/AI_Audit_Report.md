# AI Audit Report

## 1. Tuyên bố sử dụng AI
Tôi có sử dụng AI (Gemini 3.1 Pro) cho các công việc sau:
- Lên kế hoạch kiểm thử (Implementation Plan) cho FR-02, FR-07, FR-16.
- Tạo Page Object Model (POM) bằng Playwright.
- Sinh test data dạng `.csv` và `.json`.
- Viết 38 test cases tự động (automation scripts).
- Hỗ trợ format báo cáo Markdown.

## 2. Chi tiết các lần tương tác AI

### Tương tác 1: Khởi tạo POM và Test Data
- **AI Tool:** Gemini 3.1 Pro
- **Date/Time:** 2026-08-16 20:47:00
- **Prompt:** Lên kế hoạch test cho 3 tính năng FR-02, FR-07, FR-16 dựa theo SUT README, tạo thư mục và POM.
- **AI Output:** Đã generate ra `LoginPage.js`, `CartPage.js`, `AdminImportPage.js` và các file `fr*-cases.json`, `fr*-data.csv`.

### Tương tác 2: Generate Automation Scripts
- **AI Tool:** Gemini 3.1 Pro
- **Date/Time:** 2026-08-16 20:48:00
- **Prompt:** Sinh script `.spec.js` sử dụng ít nhất 3 assertion patterns, cover các bug phát hiện từ source.
- **AI Output:** Đã sinh ra 3 file `fr02-login.spec.js`, `fr07-cart.spec.js`, `fr16-import-csv.spec.js` đáp ứng đầy đủ yêu cầu, mỗi tính năng ≥ 12 test cases.

### Tương tác 3: Cấu hình Multi-browser & HTML Reporter
- **AI Tool:** Gemini 3.1 Pro
- **Date/Time:** 2026-08-16 20:50:00
- **Prompt:** Cấu hình `playwright.config.js` để có metadata "Run by: 23127259" và thêm admin webServer.
- **AI Output:** Đã cập nhật `playwright.config.js` và `package.json` thành công.
