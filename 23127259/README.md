# HW04 - Automation Testing | 23127259

| | |
|---|---|
| Sinh viên | Nguyễn Tấn Thắng - 23127259 |
| Bài tập | HW04-AI - Automation Testing |
| SUT | EShop (`eshop-sut`): frontend-web, frontend-admin, backend API |
| GitHub repository | https://github.com/hungtmh/HW04-TESTING |
| Nhánh bài làm | `codex/23127259-hw04-completion` |
| Pull Request | [#36 - MERGED](https://github.com/hungtmh/HW04-TESTING/pull/36), author/merger `thangak18` |
| GitHub Issues | 20 bug, xem bảng mục 2 |
| Video demo (Task 2) | [FR07 - Shopping Cart - Automation Test](https://youtu.be/RRAYnyt3cJ0) - 12:02 |
| Video Agent Skill | [FR16 - Agent Skill](https://youtu.be/ZEHdd4JB9dw) - 8:27 |
| Tên file nộp | `23127259_HW04_AI_Automation_100.zip` |
| Ngày | 2026-08-24 |

> Hai video bắt buộc phải do sinh viên tự quay, nói tiếng Việt và có face-cam hoặc `whoami` + `hostname`. Repository không khai khống link video.

---

## 1. Test Summary Report

| Chỉ số | Giá trị |
|---|---|
| Feature đã tự động hoá | 3 (FR-02, FR-07, FR-16) |
| Test case đã tự động hoá | 45 |
| Lượt thực thi | 135 (45 x 3 browser) |
| Passed | 72 |
| Failed có chủ đích | 63 (21 `@bug` x 3 browser) |
| Unexpected failure | 0 |
| Browser run | 9 (3 feature x 3 engine) |
| Root defect phát hiện | 20 |
| Human-review corrections | 10 (R-01 -> R-10) |

Toàn bộ 63 lượt fail đến từ 21 test gắn `@bug` viết theo SRS. Ba summary JSON xác nhận **không có test fail ngoài nhóm `@bug`**; Chromium, Firefox và WebKit cho kết quả trùng khớp.

### Chi tiết theo feature

| Feature | Test case | Chromium | Firefox | WebKit |
|---|---:|---:|---:|---:|
| FR-02 Login & Lockout | 16 | 6/10 | 6/10 | 6/10 |
| FR-07 Shopping Cart | 17 | 11/6 | 11/6 | 11/6 |
| FR-16 Import CSV | 12 | 7/5 | 7/5 | 7/5 |

*(định dạng pass/fail; ba feature thuộc ba Pool A/B/C)*

Chín HTML report đều hiển thị `Run by: 23127259` cùng ISO timestamp. Ảnh kiểm chứng nằm trong [evidence/report-screenshots/](evidence/report-screenshots/).

---

## 2. Bug đã phát hiện (20)

| ID | Feature | Mức độ | Tóm tắt | Issue |
|---|---|---|---|---|
| BUG-01 | FR-02 | High | Email login không dùng type=email và label sai, làm mất HTML5 validation | [#16](https://github.com/hungtmh/HW04-TESTING/issues/16) |
| BUG-02 | FR-02 | Critical | Một lần đăng nhập sai làm bộ đếm tăng 2 thay vì 1 | [#17](https://github.com/hungtmh/HW04-TESTING/issues/17) |
| BUG-03 | FR-02 | Critical | Tài khoản bị khóa sớm trước lần đăng nhập sai thứ ba | [#18](https://github.com/hungtmh/HW04-TESTING/issues/18) |
| BUG-04 | FR-02 | High | Thời gian khóa tài khoản là 180 giây thay vì 30 giây | [#19](https://github.com/hungtmh/HW04-TESTING/issues/19) |
| BUG-05 | FR-21 | Medium | Trang Login không có H1 và hiển thị sai tiêu đề Đăng Ký | [#20](https://github.com/hungtmh/HW04-TESTING/issues/20) |
| BUG-06 | FR-22 | Critical | Ô mật khẩu Login dùng type=text và làm lộ ký tự | [#21](https://github.com/hungtmh/HW04-TESTING/issues/21) |
| BUG-07 | FR-21 | Low | Nút đăng nhập dùng tiếng Anh Sign In thay vì tiếng Việt | [#22](https://github.com/hungtmh/HW04-TESTING/issues/22) |
| BUG-08 | FR-22 | Medium | Thông báo lỗi Login nằm dưới nút submit | [#23](https://github.com/hungtmh/HW04-TESTING/issues/23) |
| BUG-09 | SEC-01 | Critical | API Login trả lại mật khẩu plaintext trong response | [#24](https://github.com/hungtmh/HW04-TESTING/issues/24) |
| BUG-10 | FR-07 | High | Thêm cùng sản phẩm hai lần tạo hai dòng thay vì tăng số lượng | [#25](https://github.com/hungtmh/HW04-TESTING/issues/25) |
| BUG-11 | FR-07 | High | Xóa sản phẩm khỏi giỏ không có dialog xác nhận | [#26](https://github.com/hungtmh/HW04-TESTING/issues/26) |
| BUG-12 | FR-07 | Low | Nhãn tổng tiền hiển thị Tổng tạm tính thay vì Tổng cộng | [#27](https://github.com/hungtmh/HW04-TESTING/issues/27) |
| BUG-13 | FR-07 | High | Giỏ hàng thiếu nút tăng giảm số lượng +/- | [#28](https://github.com/hungtmh/HW04-TESTING/issues/28) |
| BUG-14 | FR-24 | Low | Empty state của giỏ hàng không có icon hoặc hình minh họa | [#29](https://github.com/hungtmh/HW04-TESTING/issues/29) |
| BUG-15 | FR-07 | Low | Link tiếp tục mua sắm ở giỏ có nhãn sai | [#30](https://github.com/hungtmh/HW04-TESTING/issues/30) |
| BUG-16 | FR-16 | Critical | User thường có thể gọi API admin import sản phẩm | [#31](https://github.com/hungtmh/HW04-TESTING/issues/31) |
| BUG-17 | FR-16 | Critical | Import CSV không rollback toàn bộ khi một dòng lỗi | [#32](https://github.com/hungtmh/HW04-TESTING/issues/32) |
| BUG-18 | FR-16 | Critical | Import chấp nhận sản phẩm có giá âm | [#33](https://github.com/hungtmh/HW04-TESTING/issues/33) |
| BUG-19 | FR-16 | High | CSV parser không hỗ trợ dấu phẩy trong trường được quote theo RFC 4180 | [#34](https://github.com/hungtmh/HW04-TESTING/issues/34) |
| BUG-20 | FR-16 | Low | File picker Import không giới hạn đuôi .csv | [#35](https://github.com/hungtmh/HW04-TESTING/issues/35) |

Chi tiết từng bug (steps, expected, actual, evidence, đề xuất sửa) nằm trong [bug-report/BUG_REPORT.md](bug-report/BUG_REPORT.md).

---

## 3. Cấu trúc bài nộp

```text
23127259/
|-- README.md / README.pdf
|-- report/HW04_Main_Report.md / .pdf
|-- ai/AI_Audit_Report.md / .pdf
|-- ai/AI_Critique.md / .pdf
|-- bug-report/BUG_REPORT.md / .pdf
|-- evidence/
|   |-- bugs/                         # 20 evidence image + catalog
|   |-- report-screenshots/           # 9 report attribution image
|   `-- git_commit_log.txt
|-- agent-skill/
|   |-- AGENT_SKILL.md / .pdf
|   `-- SKILL.md / .pdf
`-- video-script/                    # script Markdown + PDF
```

Mã nguồn test nằm ở gốc repository: `tests/`, `scripts/`, `playwright.config.js`; chín report nằm trong `playwright-report/fr02-*`, `fr07-*`, `fr16-*`.

---

## 4. Cách chạy lại

```bash
npm install
npx playwright install chromium firefox webkit
npm run test:multibrowser:all
node scripts/verify-report-banner.mjs
```

`playwright.config.js` tự khởi động backend, frontend-web và frontend-admin. Runner phân loại riêng `bugFailures` và `unexpectedFailures`; chỉ infrastructure/non-bug failure mới làm command thất bại.

---

## 5. Agent Skill

Skill `eshop-automation` gói quy trình: đọc SRS trước, probe DOM/state thật, tách CSV/JSON, dùng POM, chạy non-bug gate, chạy ba engine, phân loại nguyên nhân fail và tạo evidence. Skill đã qua `quick_validate.py`; xem [agent-skill/AGENT_SKILL.md](agent-skill/AGENT_SKILL.md).

---

## 6. Bảng tự đánh giá

| No. | Tiêu chí | Điểm tối đa | Tự chấm hiện tại |
|---|---|---:|---:|
| 1 | Feature A - FR-02 | 25 | 25 |
| 1 | Feature B - FR-07 | 25 | 25 |
| 1 | Feature C - FR-16 | 25 | 25 |
| 2 | Demo video | 15 | 15 |
| 3 | Agent Skill | 10 | 10 |
| | **Tổng** | **100** | **100** |

Hai video YouTube đã được xác minh truy cập thành công: video demo dài 12:02 và video Agent Skill dài 8:27.

### Căn cứ tự chấm Task 1

| Yêu cầu | Ngưỡng | Đạt được |
|---|---|---|
| Test case tự động hoá | >= 12/feature | 16 / 17 / 12 |
| Dữ liệu ngoài spec | CSV / JSON | dùng cả hai, không import thừa |
| Assertion pattern | >= 3 | 8 pattern |
| Browser | >= 3 | Chromium / Firefox / WebKit |
| HTML report có student + ISO | 9/9 | 9/9, kèm screenshot |
| Fail ngoài `@bug` | 0 | 0 |
| Commit chạm `.spec.js` | >= 8 | 12 |
| GitHub Issues kèm evidence | 20 | 20/20 |
