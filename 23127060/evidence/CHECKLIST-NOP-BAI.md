# CHECKLIST NỘP BÀI — 23127060 Ninh Văn Khải

> Sinh ở Phase 8, cập nhật 2026-08-27. Cột "Trạng thái" do agent tự kiểm bằng lệnh; mục B là việc Khải tự làm.

## A. Agent đã hoàn thành (kiểm bằng lệnh, không tự khai)

| # | Yêu cầu (SKILL §10 / đề §14) | Kết quả kiểm | Lệnh kiểm chứng |
|---|---|---|---|
| 1 | ≥12 test/feature, ≥36 tổng | **83** (FR-03 31 · FR-08 26 · FR-15 26) | `npx playwright test --list --project=chromium` |
| 2 | Mọi test có ID + tag | ✅ `FRxx-TCyy … @frxx` | xem tên test trong report |
| 3 | 0 dữ liệu hardcode inline | ✅ 0 | `grep -c "^const cases = \[" tests/*.spec.js` |
| 4 | Mỗi feature có cả JSON và CSV | ✅ 3 JSON + 3 CSV, **88 record** | `ls tests/data/` |
| 5 | ≥3 assertion pattern | **5** (A1–A5) | `grep -oh "A[1-5]" tests/*.spec.js \| sort -u` |
| 6 | 0 `waitForTimeout` trong spec | ✅ 0 lời gọi thật | `grep -rn "waitForTimeout" tests/*.spec.js` |
| 7 | 9 thư mục report | ✅ 9 | `ls automation/playwright-report/` |
| 8 | Mọi report có banner + ISO timestamp | ✅ 9/9, exit 0 | `node scripts/verify-report-banner.mjs` |
| 9 | Số liệu run thật | **249/249 pass · 0 failed · 0 flaky · 91.5s** | `node scripts/summarize-results.mjs` |
| 10 | Gap Analysis cho cả 3 feature | ✅ 9 GAP (GAP-00…09), 7 đã sửa trong code | `report/02-AI-GAP-ANALYSIS.md` |
| 11 | Bug report có evidence ảnh thật | ✅ **28 bug**, 11 ảnh PNG + `capture-log.txt` | `ls evidence/bugs/` |
| 12 | ≥8 commit chạm `*.spec.js` | **10 commit** | `evidence/git-commit-log-files.txt` |
| 13 | AI_Log đầy đủ | **20 entry** (LOG-001…020), 20/20 có Human review + Verdict | `grep -cE "^## LOG-0[0-9]{2} " ai/AI_Log.md` |
| 14 | AI_Critique 200–300 từ | **296 từ**, script exit 0 | `node scripts/count-words.mjs` |
| 15 | README có self-assessment + test summary | ✅ | `README.md` §1, §5 |
| 16 | PDF cho tài liệu bắt buộc | ✅ 9/9 file | `node scripts/md-to-pdf.mjs` |
| 17 | Không tạo/sửa file ngoài `23127060/` | ✅ 0 file | `git status --short` |
| 18 | Không đụng `23127195/`, `23127259/` | ✅ 0 | không có trong git log của bài |

## B. Việc Khải tự làm trước khi nộp

| # | Việc | Trạng thái / Ghi chú |
|---|---|---|
| 1 | Chạy `run_servers.sh`, xác nhận 3 app lên đúng port | ✅ backend `:3000` · web `:5173` · admin `:5174` |
| 2 | **Ký duyệt** bảng test case — `report/01-TEST-CASES.md` §5 | ✅ đã ký 2026-08-27 |
| 3 | **Ký xác nhận đã review script** — `report/02-AI-GAP-ANALYSIS.md` §5 | ✅ đã ký 2026-08-27 |
| 4 | Mở 9 HTML report, chụp banner → `evidence/report-screenshots/` | ✅ 9/9 ảnh, khớp `03-RUN-SUMMARY.md` |
| 5 | Tạo GitHub repo **public**, push | ✅ branch `nvk`, link đã có trong `README.md` |
| 6 | Tạo Issue cho 28 bug + đính ảnh | ✅ issue #46–#73 |
| 7 | Điền **Human review** + **Verdict** cho các entry AI_Log | ✅ 20/20 entry |
| 8 | Quay video **2-trong-1** (demo end-to-end + Agent Skill, ≥5 phút) & upload YouTube | ✅ https://youtu.be/P_8rnOMATfw — có `whoami && hostname` hoặc face-cam |
| 9 | Chốt điểm tự đánh giá — `README.md` §5 | ✅ **100/100** (25 × 4) |
| 10 | Đóng gói `23127060_HW04_AI_Automation_100.zip` | ☐ **còn lại** |
| 11 | Nộp Moodle | ☐ **còn lại** |
| 12 | Chuẩn bị vấn đáp | ☐ **còn lại** — giải thích được từng selector, assertion, bug |

## C. Lệnh đóng gói (chạy tại thư mục gốc repo)

```bash
# điểm tự đánh giá đã chốt: 100
zip -r 23127060_HW04_AI_Automation_100.zip 23127060/ \
    -x "*/node_modules/*" "*/test-results/*" "*/.playwright/*"
```
