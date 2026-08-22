# CHECKLIST NỘP BÀI — 23127060 Ninh Văn Khải

> Sinh ở Phase 8. Cột "Trạng thái" do agent tự kiểm bằng lệnh; cột 🧑 là việc Khải phải tự làm.

## A. Agent đã hoàn thành (kiểm bằng lệnh, không tự khai)

| # | Yêu cầu (SKILL §10 / đề §14) | Kết quả kiểm | Lệnh kiểm chứng |
|---|---|---|---|
| 1 | ≥12 test/feature, ≥36 tổng | **83** (FR-03 31 · FR-08 26 · FR-15 26) | `npx playwright test --list --project=chromium` |
| 2 | Mọi test có ID + tag | ✅ `FRxx-TCyy … @frxx` | xem tên test trong report |
| 3 | 0 dữ liệu hardcode inline | ✅ 0 | `grep -c "^const cases = \[" tests/*.spec.js` |
| 4 | Mỗi feature có cả JSON và CSV | ✅ 3 JSON + 3 CSV, 77 record | `ls tests/data/` |
| 5 | ≥3 assertion pattern | **5** (A1–A5) | `grep -oh "A[1-5]" tests/*.spec.js \| sort -u` |
| 6 | 0 `waitForTimeout` trong spec | ✅ 0 lời gọi thật | `grep -rn "waitForTimeout" tests/*.spec.js` |
| 7 | 9 thư mục report | ✅ 9 | `ls automation/playwright-report/` |
| 8 | Mọi report có banner + ISO timestamp | ✅ 9/9, exit 0 | `node scripts/verify-report-banner.mjs` |
| 9 | Số liệu run thật | **249/249 pass · 0 failed · 0 flaky · 91.5s** | `node scripts/summarize-results.mjs` |
| 10 | Gap Analysis cho cả 3 feature | ✅ 9 GAP (GAP-00…09), 7 đã sửa trong code | `report/02-AI-GAP-ANALYSIS.md` |
| 11 | Bug report có evidence ảnh thật | ✅ **28 bug**, 11 ảnh PNG + `capture-log.txt` | `ls evidence/bugs/` |
| 12 | ≥8 commit chạm `*.spec.js` | **9 commit** | `evidence/git-commit-log-files.txt` |
| 13 | AI_Log đầy đủ | **13 entry** (LOG-001…013) | `grep -c "^## LOG-" ai/AI_Log.md` |
| 14 | AI_Critique 200–300 từ | **296 từ**, script exit 0 | `node scripts/count-words.mjs` |
| 15 | README có self-assessment + test summary | ✅ | `README.md` §1, §5 |
| 16 | PDF cho tài liệu bắt buộc | ✅ 9/9 file | `node scripts/md-to-pdf.mjs` |
| 17 | Không tạo/sửa file ngoài `23127060/` | ✅ 0 file | `git status --short` |
| 18 | Không đụng `23127195/`, `23127259/` | ✅ 0 | không có trong git log của bài |

## B. 🧑 Khải phải tự làm trước khi nộp

| # | Việc | Ghi chú |
|---|---|---|
| 1 | Chạy `run_servers.sh`, xác nhận 3 app lên đúng port | dán output vào báo cáo nếu cần |
| 2 | **Ký duyệt** bảng test case — `report/01-TEST-CASES.md` §5 | đề quy trách nhiệm cho người học |
| 3 | **Ký xác nhận đã review script** — `report/02-AI-GAP-ANALYSIS.md` §5 | |
| 4 | Mở 9 HTML report, chụp banner → `evidence/report-screenshots/` | mở `automation/playwright-report/<dir>/index.html` |
| 5 | Tạo GitHub repo **public**, push | dán link vào `README.md` |
| 6 | Tạo Issue cho 28 bug + đính ảnh | `bash bug-report/gh-issue-commands.sh` |
| 7 | Điền **Human review** + **Verdict** cho 13 entry AI_Log | |
| 8 | Quay Video 1 (≥5 phút) theo `video-script/VIDEO_1_DEMO_SCRIPT.md` | có `whoami && hostname` hoặc face-cam |
| 9 | Quay Video 2 theo `video-script/VIDEO_2_AGENT_SKILL_SCRIPT.md` | |
| 10 | Upload 2 video YouTube **Unlisted**, dán link vào README | |
| 11 | Chốt điểm tự đánh giá — `README.md` §5 | |
| 12 | Đóng gói `23127060_HW04_AI_Automation_<điểm 3 số>.zip` | ví dụ `..._090.zip` |
| 13 | Nộp Moodle | |
| 14 | Chuẩn bị vấn đáp | giải thích được từng selector, assertion, bug |

## C. Lệnh đóng gói (chạy tại thư mục gốc repo)

```bash
# thay <điểm> bằng 3 chữ số điểm tự đánh giá, ví dụ 090
zip -r 23127060_HW04_AI_Automation_<điểm>.zip 23127060/ \
    -x "*/node_modules/*" "*/test-results/*" "*/.playwright/*"
```
