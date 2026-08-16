# HW04 — Automation Testing | 23127195

| | |
|---|---|
| **Sinh viên** | 23127195 |
| **Bài tập** | HW04-AI — Automation Testing |
| **SUT** | EShop (`eshop-sut`) — frontend-web, frontend-admin, backend API |
| **GitHub repository** | https://github.com/hungtmh/HW04-TESTING |
| **GitHub Issues** | https://github.com/hungtmh/HW04-TESTING/issues (15 bug) |
| **Video demo (YouTube, unlisted)** | ⏳ *chưa quay* |
| **Ngày** | 2026-08-15 |

---

## 1. Test Summary Report

| Chỉ số | Giá trị |
|---|---|
| Số feature đã tự động hoá | **3 / 3** (FR-01, FR-09, FR-14) |
| Số test case đã tự động hoá | **62** |
| Số test case đã thực thi | **186** (62 × 3 browser) |
| Số test **passed** | **117** |
| Số test **failed** | **69** (= 23 test `@bug` × 3 browser) |
| Số browser run | **9** (3 feature × 3 engine) |
| Số bug phát hiện | **15** |
| Số phát hiện khi review AI | **11** (R-01 → R-11) |

### Chi tiết theo feature và browser

| Feature | Test case | Chromium | Firefox | WebKit | HTML report |
|---|---|---|---|---|---|
| FR-01 Đăng ký tài khoản | 27 | 19/8 | 19/8 | 19/8 | `playwright-report/fr01-register-<browser>/` |
| FR-09 Mã giảm giá | 18 | 12/6 | 12/6 | 12/6 | `playwright-report/fr09-coupon-<browser>/` |
| FR-14 Quản lý danh mục | 17 | 8/9 | 8/9 | 8/9 | `playwright-report/fr14-category-<browser>/` |

*(định dạng: pass/fail)*

Cả 9 HTML report đều hiển thị `Run by: 23127195` kèm ISO timestamp ở tiêu đề —
ảnh chụp kiểm chứng trong `evidence/report-screenshots/`.

> **Lưu ý về 69 lượt fail:** đây **không** phải lỗi của bộ test. 23 test được
> viết theo **đặc tả** (`api_specification.md` + hint hiển thị trên UI) chứ không
> theo hành vi hiện có của SUT; mỗi test đỏ ánh xạ 1-1 tới một bug đã ghi nhận.
> Đã kiểm chứng bằng script quét toàn bộ `results.json`: **không có test nào fail
> ngoài nhóm `@bug`**.

---

## 2. Bug đã phát hiện (15)

| ID | Feature | Mức độ | Tóm tắt | Issue |
|---|---|---|---|---|
| BUG-01 | FR-01 | High | Luật mật khẩu bắt buộc khoảng trắng, cấm ký tự đặc biệt | [#1](https://github.com/hungtmh/HW04-TESTING/issues/1) |
| BUG-02 | FR-01 | High | Không validate định dạng email | [#2](https://github.com/hungtmh/HW04-TESTING/issues/2) |
| BUG-03 | FR-01 | Critical | Email trùng tạo được nhiều tài khoản | [#3](https://github.com/hungtmh/HW04-TESTING/issues/3) |
| BUG-04 | FR-01 | Critical | Mật khẩu plaintext, bị trả về trong response login | [#4](https://github.com/hungtmh/HW04-TESTING/issues/4) |
| BUG-05 | FR-12 | High | `GET /api/admin/users` không kiểm tra `role` | [#5](https://github.com/hungtmh/HW04-TESTING/issues/5) |
| BUG-06 | Tài liệu | Low | `setup_guide.md` ghi sai mật khẩu admin | [#6](https://github.com/hungtmh/HW04-TESTING/issues/6) |
| **BUG-07** | **FR-09** | **Critical** | **Công thức % bị đảo — khách bị tính gấp 10 lần** | [#7](https://github.com/hungtmh/HW04-TESTING/issues/7) |
| BUG-08 | FR-09 | Medium | Ngưỡng đơn tối thiểu loại trừ giá trị bằng ngưỡng | [#8](https://github.com/hungtmh/HW04-TESTING/issues/8) |
| BUG-09 | FR-09 | High | Bỏ `user_id` là lách được giới hạn lượt dùng | [#9](https://github.com/hungtmh/HW04-TESTING/issues/9) |
| BUG-10 | FR-14 | Medium | Tên danh mục rỗng/`null` vẫn tạo được | [#10](https://github.com/hungtmh/HW04-TESTING/issues/10) |
| BUG-11 | FR-14 | Critical | User thường toàn quyền CRUD danh mục | [#11](https://github.com/hungtmh/HW04-TESTING/issues/11) |
| BUG-12 | FR-14 | Medium | Sửa/xoá `id` không tồn tại vẫn báo 200 | [#12](https://github.com/hungtmh/HW04-TESTING/issues/12) |
| BUG-13 | FR-14 | High | Xoá danh mục có sản phẩm làm sản phẩm mồ côi | [#13](https://github.com/hungtmh/HW04-TESTING/issues/13) |
| BUG-14 | FR-14 | High | Giao diện danh mục thiếu hoàn toàn chức năng Sửa | [#14](https://github.com/hungtmh/HW04-TESTING/issues/14) |
| BUG-15 | FR-13 | Medium | Dashboard nhân đôi doanh thu đơn đã giao | [#15](https://github.com/hungtmh/HW04-TESTING/issues/15) |

---

## 3. Cấu trúc bài nộp

```
23127195/
├── README.md                          ← tài liệu này
├── report/HW04_Main_Report.md         ← báo cáo chính + gap analysis (R-01 → R-11)
├── ai/AI_Audit_Report.md              ← nhật ký tương tác với AI
├── ai/AI_Critique.md                  ← 299 từ
├── bug-report/BUG_REPORT.md           ← 15 bug, đầy đủ steps to reproduce
├── video-script/                      ← kịch bản quay 2 video (lời thoại + phân cảnh)
│   ├── VIDEO_1_DEMO_SCRIPT.md
│   └── VIDEO_2_AGENT_SKILL_SCRIPT.md
└── evidence/
    ├── report-screenshots/            ← 9 ảnh HTML report (chứng minh "Run by:")
    ├── bugs/                          ← ảnh bằng chứng từng bug
    └── git-commit-log*.txt            ← lịch sử commit dạng text
```

Mã nguồn bộ test ở thư mục gốc repository: `tests/`, `scripts/`,
`playwright.config.js`, `playwright-report/`.

---

## 4. Cách chạy lại

```bash
npm install
npx playwright install chromium firefox webkit

npm --prefix eshop-sut/backend install
npm --prefix eshop-sut/frontend-web install
npm --prefix eshop-sut/frontend-admin install
npm run sut:seed

# frontend-admin phải chạy tay (config chỉ tự khởi động backend + frontend-web)
npm --prefix eshop-sut/frontend-admin run dev

node scripts/run-multibrowser.mjs tests/fr01-register.spec.js
node scripts/run-multibrowser.mjs tests/fr09-coupon.spec.js
node scripts/run-multibrowser.mjs tests/fr14-category.spec.js
node scripts/verify-report-banner.mjs
```

---

## 5. Bảng tự đánh giá

| No. | Criteria | Grade | Self-Assessed Grade |
|---|---|---|---|
| 1 | Task 1 — Feature A (FR-01 Đăng ký tài khoản) | 25 | **24** |
| 1 | Task 1 — Feature B (FR-09 Mã giảm giá) | 25 | **24** |
| 1 | Task 1 — Feature C (FR-14 Quản lý danh mục) | 25 | **24** |
| 2 | Task 2 — Demo video | 15 | **0** |
| 3 | Agent Skills | 10 | **6** |
| | **Total** | **100** | **78** |

> **Agent Skill** đã xây tại [`.claude/skills/eshop-automation/SKILL.md`](../.claude/skills/eshop-automation/SKILL.md)
> — đóng gói toàn bộ quy trình 8 bước (probe DOM trước khi viết spec, data-driven,
> assertion không race, dọn dẹp hai nhánh, chạy 3 engine, kiểm chứng từng lý do
> fail) cùng bảng "SUT facts" ghi lại các cạm bẫy đã tốn công phát hiện.
> Tự chấm 6/10 vì **chưa có video demo dùng skill** theo yêu cầu mục 7 của đề.

### Căn cứ tự chấm mỗi feature 24/25

| Yêu cầu | Ngưỡng | Đạt được |
|---|---|---|
| Test case tự động hoá | ≥ 12 | 27 / 18 / 17 ✅ |
| Dữ liệu tách file riêng | `.csv` / `.json` | cả hai loại ✅ |
| Assertion pattern | ≥ 3 | 6 ✅ |
| Browser | ≥ 3 | 3 engine ✅ |
| HTML report có `Run by:` + ISO | bắt buộc | 9/9, có ảnh kiểm chứng ✅ |
| Review & phân tích lỗi AI | bắt buộc | 11 phát hiện ✅ |
| Bug report + GitHub Issues kèm ảnh | nếu có bug | 15 bug, 15 issue ✅ |
| Commit chạm `.spec.js` | ≥ 8 | ⏳ **chưa đủ** (−1 mỗi feature) |

---

## 6. Việc còn lại trước khi nộp

- [x] ~~Tạo GitHub Issues cho 15 bug, kèm ảnh~~ — xong (#1 → #15)
- [x] ~~Xây Agent Skill~~ — xong (`.claude/skills/eshop-automation/`)
- [ ] Quay video demo ≥ 5 phút, tiếng Việt, có `whoami` + `hostname`
- [ ] Quay video demo dùng Agent Skill trên một feature hoàn chỉnh
- [ ] Bổ sung commit chạm file `.spec.js` cho đủ 8 (hiện 3)
- [ ] Xuất bản PDF cho `HW04_Main_Report.md`, `AI_Audit_Report.md`, `AI_Critique.md`
- [ ] Đóng gói `23127195_HW04_AI_Automation_078.zip`
