# HW04 — Automation Testing | 23127195

| | |
|---|---|
| **Sinh viên** | 23127195 |
| **Bài tập** | HW04-AI — Automation Testing |
| **SUT** | EShop (`eshop-sut`) — frontend-web + backend API |
| **GitHub repository** | https://github.com/hungtmh/HW04-TESTING |
| **Video demo (YouTube, unlisted)** | ⏳ *chưa quay* |
| **Ngày** | 2026-08-15 |

---

## 1. Test Summary Report

| Chỉ số | Giá trị |
|---|---|
| Số feature đã tự động hoá | **1 / 3** (FR-01) |
| Số test case đã tự động hoá | **27** |
| Số test case đã thực thi | **81** (27 × 3 browser) |
| Số test **passed** | **57** |
| Số test **failed** | **24** (= 8 test `@bug` × 3 browser) |
| Số browser run | **3** (Chromium, Firefox, WebKit) |
| Số bug phát hiện | **6** (4 thuộc FR-01, 2 phát hiện tình cờ) |
| Số phát hiện khi review AI | **8** (R-01 → R-08) |

### Chi tiết theo browser

| Browser | Tổng | Pass | Fail | HTML report |
|---|---|---|---|---|
| Chromium | 27 | 19 | 8 | `playwright-report/fr01-register-chromium/index.html` |
| Firefox | 27 | 19 | 8 | `playwright-report/fr01-register-firefox/index.html` |
| WebKit | 27 | 19 | 8 | `playwright-report/fr01-register-webkit/index.html` |

Cả 3 HTML report đều hiển thị `Run by: 23127195` kèm ISO timestamp ở tiêu đề —
ảnh chụp kiểm chứng nằm trong `evidence/report-screenshots/`.

> **Lưu ý về 24 lượt fail:** đây **không** phải lỗi của bộ test. Tám test được
> viết theo **đặc tả** (`api_specification.md` + hint hiển thị trên UI) chứ không
> theo hành vi đang có của SUT; mỗi test đỏ ánh xạ 1-1 tới một bug đã ghi nhận
> trong `bug-report/BUG_REPORT.md`. Việc "nới" chúng cho xanh sẽ biến bug thành
> đặc tả.

---

## 2. Bug đã phát hiện

| ID | Mức độ | Tóm tắt | Test |
|---|---|---|---|
| BUG-01 | High | Luật mật khẩu bắt buộc khoảng trắng, cấm ký tự đặc biệt — ngược với hint UI và đặc tả | TC-02, TC-27 |
| BUG-02 | High | Không validate định dạng email ở cả frontend và backend | TC-18 → TC-21 |
| BUG-03 | Critical | Email trùng tạo được nhiều tài khoản (thiếu `UNIQUE`) | TC-22 |
| BUG-04 | Critical | Mật khẩu lưu plaintext và bị trả về trong response đăng nhập | TC-26 |
| BUG-05 | High | `GET /api/admin/users` không kiểm tra `role` (thuộc FR-12) | thủ công |
| BUG-06 | Low | `setup_guide.md` ghi sai mật khẩu admin | thủ công |

---

## 3. Cấu trúc bài nộp

```
23127195/
├── README.md                          ← tài liệu này
├── report/
│   └── HW04_Main_Report.md            ← báo cáo chính + gap analysis
├── ai/
│   ├── AI_Audit_Report.md             ← nhật ký 13 lần tương tác với AI
│   └── AI_Critique.md                 ← 299 từ
├── bug-report/
│   └── BUG_REPORT.md                  ← 6 bug, đầy đủ steps to reproduce
└── evidence/
    ├── report-screenshots/            ← ảnh 3 HTML report (chứng minh "Run by:")
    └── bugs/                          ← ảnh bằng chứng từng bug
```

Mã nguồn bộ test nằm ở thư mục gốc repository:

```
tests/
├── data/fr01-password-rules.csv       ← dữ liệu test (CSV)
├── data/fr01-register-cases.json      ← dữ liệu test (JSON)
├── pages/RegisterPage.js              ← Page Object
├── utils/{csv,env}.js
└── fr01-register.spec.js              ← 27 test case
scripts/
├── run-multibrowser.mjs               ← chạy 3 engine, mỗi engine 1 report
├── verify-report-banner.mjs           ← kiểm chứng "Run by: 23127195"
└── capture-bug-evidence.mjs           ← chụp ảnh bằng chứng bug
playwright.config.js
playwright-report/                     ← HTML report của từng browser
```

---

## 4. Cách chạy lại

```bash
npm install
npx playwright install chromium firefox webkit
npm --prefix eshop-sut/backend install
npm --prefix eshop-sut/frontend-web install
npm run sut:seed

node scripts/run-multibrowser.mjs tests/fr01-register.spec.js
node scripts/verify-report-banner.mjs
```

`playwright.config.js` tự khởi động backend (`:3000`) và frontend-web (`:5173`)
qua `webServer` với `reuseExistingServer: true`.

---

## 5. Bảng tự đánh giá

| No. | Criteria | Grade | Self-Assessed Grade |
|---|---|---|---|
| 1 | Task 1 — Feature A (FR-01 Đăng ký tài khoản) | 25 | **23** |
| 1 | Task 1 — Feature B (FR-09 Mã giảm giá) | 25 | **0** |
| 1 | Task 1 — Feature C (FR-14 Quản lý danh mục) | 25 | **0** |
| 2 | Task 2 — Demo video | 15 | **0** |
| 3 | Agent Skills | 10 | **0** |
| | **Total** | **100** | **23** |

### Căn cứ tự chấm Feature A = 23/25

| Yêu cầu | Ngưỡng | Đạt được |
|---|---|---|
| Test case tự động hoá | ≥ 12 | 27 ✅ |
| Dữ liệu tách file riêng | `.csv` / `.json` | cả hai ✅ |
| Assertion pattern | ≥ 3 | 6 ✅ |
| Browser | ≥ 3 | 3 ✅ |
| HTML report có `Run by:` + ISO | bắt buộc | ✅ đã chụp ảnh kiểm chứng |
| Review & phân tích lỗi AI | bắt buộc | 8 phát hiện ✅ |
| Bug report | nếu có | 6 bug ✅ |
| GitHub Issues kèm screenshot | nếu có bug | ⏳ **chưa tạo** (−2) |

---

## 6. Việc còn lại trước khi nộp

- [ ] FR-09 — Mã giảm giá: spec + data + 3 browser run
- [ ] FR-14 — Quản lý danh mục: spec + data + 3 browser run
- [ ] Tạo 6 GitHub Issues, đính ảnh từ `evidence/bugs/`, cập nhật link vào `BUG_REPORT.md`
- [ ] Quay video demo ≥ 5 phút, tiếng Việt, có `whoami` + `hostname`
- [ ] Xây Agent Skill + video demo skill
- [ ] Đạt ≥ 8 commit chạm file `.spec.js`, xuất `git log` ra file text
- [ ] Xuất bản PDF cho `HW04_Main_Report.md`, `AI_Audit_Report.md`, `AI_Critique.md`
- [ ] Đóng gói `23127195_HW04_AI_Automation_<điểm>.zip`
