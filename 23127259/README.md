# Homework 04 - AI Automation Testing

- **Sinh viên:** Nguyễn Tấn Thắng
- **MSSV:** 23127259
- **Nhóm:** 08
- **Repository:** https://github.com/hungtmh/HW04-TESTING
- **SUT:** EShop - React Web, React Admin, Node/SQLite API

## Self-Assessment Grade

| No. | Criteria | Maximum | Current self-assessment | Evidence |
|---|---|---:|---:|---|
| 1 | Task 1 - Feature A: FR-02 | 25 | 25 | `tests/fr02-login.spec.js`, 3 browser reports |
| 1 | Task 1 - Feature B: FR-07 | 25 | 25 | `tests/fr07-cart.spec.js`, 3 browser reports |
| 1 | Task 1 - Feature C: FR-16 | 25 | 25 | `tests/fr16-import-csv.spec.js`, 3 browser reports |
| 2 | Task 2 - Demo video | 15 | 0 | Chưa quay/upload; kịch bản và checklist đã sẵn sàng |
| 3 | Agent Skill | 10 | 7 | Skill hợp lệ và đã validate; chưa có video demo skill |
| | **Total** | **100** | **82** | Không khai 100 khi chưa có video thật |

## Verified Test Summary

Kết quả được lấy từ ba file `playwright-report/*-summary.json` sau lần chạy ngày 2026-08-24.

| Feature | Unique cases | Normal Pass/browser | Intentional `@bug` Fail/browser | Browsers | Unexpected failures |
|---|---:|---:|---:|---|---:|
| FR-02 Login/Lockout | 16 | 6 | 10 | Chromium, Firefox, WebKit | 0 |
| FR-07 Shopping Cart | 17 | 11 | 6 | Chromium, Firefox, WebKit | 0 |
| FR-16 Admin Import CSV | 12 | 7 | 5 | Chromium, Firefox, WebKit | 0 |
| **Total** | **45** | **24** | **21** | **9 browser runs** | **0** |

Across the complete browser matrix: **135 executions = 72 Passed + 63 intentional `@bug` Failed + 0 unexpected Failed**. The 21 failing test cases map to **20 unique SUT defects** because the malformed-email and wrong-email-type assertions share one root cause.

## Deliverable Map

- Main report: `report/HW04_Main_Report.md` and `.pdf`
- Bug report: `bug-report/BUG_REPORT.md` and `.pdf`
- AI audit and critique: `ai/` in Markdown and PDF
- Git log: `evidence/git_commit_log.txt`
- Report screenshots: `evidence/report-screenshots/`
- Multi-browser reports: `playwright-report/fr02-*`, `fr07-*`, `fr16-*`
- Agent Skill: `agent-skill/eshop-automation/`
- Video scripts and recording checklist: `video-script/`

## Reproduction Commands

```bash
npm install
npx playwright install chromium firefox webkit
npm run test:multibrowser:all
node scripts/verify-report-banner.mjs
```

## Items Requiring Student Authorship

The homework prohibits fabricated execution evidence. The following must be completed by Nguyễn Tấn Thắng personally before submission:

1. Record the Vietnamese demo with voice and face-cam or visible `whoami` + `hostname`.
2. Upload it as an unlisted YouTube video of at least five minutes and add the URL here.
3. Record the Agent Skill demonstration and add its URL here.
4. Create GitHub Issues with screenshots for the confirmed defects and open/merge a real Pull Request for these changes.

- **Main demo video:** NOT RECORDED YET
- **Agent Skill video:** NOT RECORDED YET
