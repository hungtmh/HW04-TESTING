# HW04 — AI-Driven Automation Testing · 23127060

**Sinh viên:** Ninh Văn Khải — **MSSV 23127060**
**SUT:** EShop (`eshop-sut/`) — Express 5 + SQLite + React/Vite
**Feature:** FR-03 Quên/Đặt lại mật khẩu · FR-08 Thanh toán · FR-15 Quản lý sản phẩm
**Framework:** Playwright Test 1.62.1 (JavaScript, ESM) · Chromium / Firefox / WebKit

> 🔗 **GitHub repo:** https://github.com/hungtmh/HW04-TESTING (branch `nvk` · thư mục [`23127060/`](https://github.com/hungtmh/HW04-TESTING/tree/nvk/23127060))
> 🐛 **GitHub Issues:** https://github.com/hungtmh/HW04-TESTING/issues?q=is%3Aissue+23127060
> 🎥 **Video 1 (Demo ≥5 phút):** 🧑 *Khải dán link YouTube unlisted*
> 🎥 **Video 2 (Agent Skill):** 🧑 *Khải dán link YouTube unlisted*

---

## 1. Test summary (số liệu thật từ `results.json`)

| Feature | Tag | Test/browser | Chromium | Firefox | WebKit | Tổng |
|---|---|---|---|---|---|---|
| FR-03 Quên/Đặt lại mật khẩu | `@fr03` | 31 | 31 ✅ | 31 ✅ | 31 ✅ | 93 |
| FR-08 Thanh toán | `@fr08` | 26 | 26 ✅ | 26 ✅ | 26 ✅ | 78 |
| FR-15 Quản lý sản phẩm | `@fr15` | 26 | 26 ✅ | 26 ✅ | 26 ✅ | 78 |
| **TỔNG** | | **83** | **83** | **83** | **83** | **249** |

**249 passed · 0 failed · 0 flaky · 0 skipped · 91.5s** — chi tiết: [`report/03-RUN-SUMMARY.md`](report/03-RUN-SUMMARY.md)

> ⚠️ Nhiều test được viết để **khẳng định hành vi sai hiện tại** của SUT.
> Test **pass ⇒ bug vẫn còn**. Khi SUT được vá, các test gắn mã `BUG-xx-xx` sẽ fail — đó là tín hiệu đúng.

| Hạng mục | Con số |
|---|---|
| Bug phát hiện | **28** (9 Critical · 10 High · 9 Medium) |
| Record dữ liệu data-driven | **88** trong 6 file JSON/CSV |
| Assertion pattern | **5** (A1 UI · A2 URL · A3 API · A4 boundary · A5 dialog) |
| Page Object | 5 |
| Report HTML có banner | **9/9** verify pass |
| `waitForTimeout` trong spec | **0** |

---

## 2. Cấu trúc thư mục

```
23127060/
├── README.md                       ← file này
├── agent-skill/SKILL.md            AI Skill điều phối toàn bộ quy trình
├── ai/
│   ├── AI_Log.md                   16 entry — nhật ký từng lượt làm việc với AI
│   ├── AI_Audit_Report.md          tổng hợp từ AI_Log + khai báo bắt buộc
│   └── AI_Critique.md              296 từ (đếm tự động, trong khoảng 200–300)
├── automation/
│   ├── playwright.config.js        banner "Run by: 23127060" + 3 project browser
│   ├── scripts/                    6 script hạ tầng (xem §4)
│   ├── tests/
│   │   ├── data/                   3 JSON + 3 CSV — 88 record
│   │   ├── pages/                  5 Page Object
│   │   ├── utils/                  env · csv · data · api · fixtures
│   │   ├── fr03-forgot-reset.spec.js    31 test
│   │   ├── fr08-checkout.spec.js        26 test
│   │   └── fr15-product-crud.spec.js    26 test
│   └── playwright-report/          9 thư mục report HTML
├── bug-report/
│   ├── BUG_REPORT.md               28 bug chi tiết
│   ├── gh-issue-commands.sh        sinh 28 lệnh `gh issue create`
│   └── issue-bodies/               28 file body Issue
├── evidence/
│   ├── bugs/                       11 ảnh PNG thật + capture-log.txt
│   ├── report-screenshots/         🧑 Khải chụp 9 report
│   ├── git-commit-log.txt
│   └── git-commit-log-files.txt    chỉ commit chạm *.spec.js
├── report/
│   ├── HW04_Main_Report.md         báo cáo chính
│   ├── 00-SUT-RECON.md             bảng route ↔ selector ↔ API ↔ rủi ro
│   ├── 01-TEST-CASES.md            54 test case đã thiết kế
│   ├── 02-AI-GAP-ANALYSIS.md       9 điểm yếu của AI + cách sửa
│   └── 03-RUN-SUMMARY.md           số liệu 9 run (sinh tự động)
└── video-script/
    ├── VIDEO_1_DEMO_SCRIPT.md
    └── VIDEO_2_AGENT_SKILL_SCRIPT.md
```

---

## 3. Cách chạy

### 3.1 Khởi động SUT (3 tiến trình)

```bash
# Terminal 1 — backend (BẮT BUỘC port 3000, frontend hardcode URL này)
cd eshop-sut/backend && node server.js

# Terminal 2 — frontend-web
cd eshop-sut/frontend-web && npm install && npx vite --port 5173 --strictPort

# Terminal 3 — frontend-admin
cd eshop-sut/frontend-admin && npm install && npx vite --port 5174 --strictPort
```

> ⚠️ CSDL bị `DROP` và seed lại **mỗi lần** khởi động backend. Không sao — mọi test tự tạo dữ liệu tiền đề.

### 3.2 Cài đặt và chạy test

```bash
cd 23127060/automation
npm install
npx playwright install chromium firefox webkit   # bắt buộc, nếu thiếu thì test UI fail sau 3ms

npm test                    # 83 test trên project mặc định
npm run test:fr03           # chỉ FR-03
npm run test:multibrowser   # 9 run → 9 thư mục report
npm run verify:banner       # fail cứng nếu report thiếu banner
npm run summarize           # sinh report/03-RUN-SUMMARY.md từ results.json
npm run evidence:bugs       # chụp lại ảnh minh chứng bug
```

Đổi port mà không sửa code:
```bash
API_BASE_URL=http://localhost:3000/api \
WEB_BASE_URL=http://localhost:5173 \
ADMIN_BASE_URL=http://localhost:5174 npm test
```

---

## 4. Script hạ tầng

| Script | Chức năng |
|---|---|
| `run-multibrowser.mjs` | 3 feature × 3 browser = 9 run, mỗi run 1 thư mục report riêng |
| `banner-reporter.mjs` | Đóng dấu `Run by: 23127060` + ISO timestamp vào `index.html` |
| `verify-report-banner.mjs` | **Fail cứng** (exit 1) nếu bất kỳ report nào thiếu banner |
| `summarize-results.mjs` | Đọc `results.json` thật → sinh `report/03-RUN-SUMMARY.md` |
| `capture-bug-evidence.mjs` | Chụp ảnh minh chứng 8 bug nặng nhất bằng Playwright thật |
| `count-words.mjs` | Đếm từ `AI_Critique.md`, exit 1 nếu ngoài khoảng 200–300 |
| `md-to-pdf.mjs` | Xuất 9 file `.md` bắt buộc ra PDF A4 bằng Chromium của Playwright |

---

## 5. Bảng tự đánh giá

| Tiêu chí | Điểm tối đa | Tự chấm | Căn cứ |
|---|---|---|---|
| **FR-03** — Quên/Đặt lại mật khẩu | 25 | 🧑 *điền* | 31 test × 3 browser · 8 bug (3 Critical) · boundary regex mật khẩu 6 biến thể · 100% pass |
| **FR-08** — Thanh toán | 25 | 🧑 *điền* | 26 test × 3 browser · 9 bug (4 Critical) · boundary coupon 3 mốc bắt được off-by-one · 100% pass |
| **FR-15** — Quản lý sản phẩm | 25 | 🧑 *điền* | 26 test × 3 browser · 10 bug (3 Critical) · assertion kép UI+API chứng minh bug thuộc frontend · 100% pass |
| **Báo cáo & AI Audit** | 25 | 🧑 *điền* | Main Report · Bug Report 28 bug có ảnh thật · Gap Analysis 9 GAP · AI Log 16 entry · Critique 296 từ |
| **TỔNG** | **100** | 🧑 *điền* | |

### Điểm mạnh tự nhận
- Mọi selector đều **đọc từ JSX thật** và có comment dẫn số dòng — không đoán.
- Mọi expected result đều **dẫn nguồn** về một dòng cụ thể trong `server.js` / `*.jsx`.
- 0 `waitForTimeout`, 0 selector class Tailwind, 0 dữ liệu hardcode inline trong spec.
- Ghi lại **9 điểm yếu thật của AI** kèm nguyên nhân và commit sửa — không tô hồng, kể cả 2 lỗi chỉ WebKit mới lộ.
- Ảnh minh chứng bug do **script Playwright chụp**, kèm log response nguyên văn, không vẽ tay.

### Hạn chế tự nhận
- Chưa test được các case phụ thuộc hạ tầng SUT không có (email thật, tồn kho, order_items) — đã liệt kê rõ lý do.
- Test chạy song song 2 worker trên cùng một CSDL SQLite; đã xử lý bằng dữ liệu riêng cho mỗi test,
  nhưng vẫn là ràng buộc cần lưu ý nếu tăng số worker.
- FR-20 (Mobile) **không** được làm — đúng theo đề §5, Pool D không tính cho HW04.

---

## 6. 🧑 Bàn giao — việc Khải phải tự làm

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Chạy `run_servers.sh`, xác nhận 3 app lên đúng port | ☐ |
| 2 | **Duyệt & ký** bảng test case (`report/01-TEST-CASES.md` §5) | ☐ |
| 3 | **Ký xác nhận đã review script** (`report/02-AI-GAP-ANALYSIS.md` §5) | ☐ |
| 4 | Mở 9 HTML report bằng trình duyệt, chụp màn hình banner → `evidence/report-screenshots/` | ✅ **9/9** — mọi ảnh khớp `03-RUN-SUMMARY.md` (test, passed, duration, ISO timestamp) |
| 5 | Tạo GitHub repo **public**, push toàn bộ | ✅ [`nvk`](https://github.com/hungtmh/HW04-TESTING/tree/nvk/23127060) |
| 6 | Tạo GitHub Issue cho 28 bug, đính ảnh | ✅ issue [#46–#73](https://github.com/hungtmh/HW04-TESTING/issues?q=is%3Aissue+23127060) — xem [`bug-report/github-issues.txt`](bug-report/github-issues.txt) |
| 7 | Điền mục **Human review** + **Verdict** cho **16** entry trong `ai/AI_Log.md` | ☐ |
| 8 | Quay Video 1 (demo ≥5 phút, giọng Việt thật, có face-cam **hoặc** `whoami && hostname`) | ☐ |
| 9 | Quay Video 2 (demo Agent Skill end-to-end) | ☐ |
| 10 | Upload 2 video lên YouTube **Unlisted**, dán link vào §đầu README | ☐ |
| 11 | Chốt điểm tự đánh giá ở §5 | ☐ |
| 12 | Xuất PDF cho các `.md` bắt buộc | ☐ |
| 13 | Đóng gói `23127060_HW04_AI_Automation_<điểm 3 số>.zip` và nộp Moodle | ☐ |
| 14 | Chuẩn bị vấn đáp: giải thích được từng selector, từng assertion, từng bug | ☐ |

---

## 7. Khai báo sử dụng AI

> **"I use AI tools for the following tasks"**

Toàn bộ chi tiết trong [`ai/AI_Audit_Report.md`](ai/AI_Audit_Report.md).
Tóm tắt: AI (Claude Code CLI + Notion AI) được dùng để đọc source SUT, thiết kế test case, sinh dữ liệu,
viết Page Object + spec, viết script hạ tầng, chạy test, soạn tài liệu và chụp ảnh minh chứng.
AI **không** được dùng cho: tạo repo/Issue, quay video, thuyết minh, chốt điểm, nộp bài, bảo vệ vấn đáp.

**12 lỗi thật của AI** đã được ghi nhận và sửa — xem `report/02-AI-GAP-ANALYSIS.md` và `ai/AI_Audit_Report.md`.
