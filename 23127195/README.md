# HW04 — Automation Testing | 23127195

| | |
|---|---|
| Sinh viên | 23127195 |
| Bài tập | HW04-AI — Automation Testing |
| SUT | EShop (`eshop-sut`): frontend-web, frontend-admin, backend API |
| GitHub repository | https://github.com/hungtmh/HW04-TESTING |
| GitHub Issues | https://github.com/hungtmh/HW04-TESTING/issues (15 bug) |
| Video demo (Task 2) | https://youtu.be/AR1Z5RGFVRs |
| Video Agent Skill | https://youtu.be/Vxf9-R9AC54 |
| Ngày | 2026-08-16 |

Cả hai video để chế độ **Unlisted**, nói tiếng Việt, quay kèm face-cam.

---

## 1. Test Summary Report

| Chỉ số | Giá trị |
|---|---|
| Feature đã tự động hoá | 3 (FR-01, FR-09, FR-14) |
| Test case đã tự động hoá | 63 |
| Lượt thực thi | 189 (63 × 3 browser) |
| Passed | 120 |
| Failed | 69 |
| Browser run | 9 (3 feature × 3 engine) |
| Bug phát hiện | 15 |
| Phát hiện khi review AI | 13 (R-01 → R-13) |

Toàn bộ 69 lượt fail đến từ 23 test được gắn `@bug` chạy trên 3 browser. Đây là chủ ý: các test này viết theo **đặc tả** (`api_specification.md` cộng với hint hiển thị trên giao diện) chứ không theo hành vi hiện tại của mã nguồn, nên mỗi test đỏ tương ứng đúng một lỗi thật đã ghi trong bug report. Tôi có một script quét toàn bộ `results.json` để chắc chắn không test nào fail nằm ngoài nhóm `@bug`, và ba engine cho kết quả trùng khớp tuyệt đối.

### Chi tiết theo feature

| Feature | Test case | Chromium | Firefox | WebKit |
|---|---|---|---|---|
| FR-01 Đăng ký tài khoản | 27 | 19/8 | 19/8 | 19/8 |
| FR-09 Mã giảm giá | 19 | 13/6 | 13/6 | 13/6 |
| FR-14 Quản lý danh mục | 17 | 8/9 | 8/9 | 8/9 |

*(định dạng pass/fail; ba feature nằm trong ba Pool A/B/C theo đúng lựa chọn từ HW02)*

Chín HTML report tương ứng đều in dòng `Run by: 23127195` kèm ISO timestamp ngay trên đầu trang. Ảnh chụp lại nằm trong [evidence/report-screenshots/](evidence/report-screenshots/).

---

## 2. Bug đã phát hiện (15)

| ID | Feature | Mức độ | Tóm tắt | Issue |
|---|---|---|---|---|
| BUG-01 | FR-01 | High | Luật mật khẩu bắt buộc khoảng trắng, cấm ký tự đặc biệt | [#1](https://github.com/hungtmh/HW04-TESTING/issues/1) |
| BUG-02 | FR-01 | High | Không kiểm tra định dạng email | [#2](https://github.com/hungtmh/HW04-TESTING/issues/2) |
| BUG-03 | FR-01 | Critical | Email trùng vẫn tạo được nhiều tài khoản | [#3](https://github.com/hungtmh/HW04-TESTING/issues/3) |
| BUG-04 | FR-01 | Critical | Mật khẩu lưu plaintext và trả về trong response login | [#4](https://github.com/hungtmh/HW04-TESTING/issues/4) |
| BUG-05 | FR-12 | High | `GET /api/admin/users` không kiểm tra `role` | [#5](https://github.com/hungtmh/HW04-TESTING/issues/5) |
| BUG-06 | Tài liệu | Low | `setup_guide.md` ghi sai mật khẩu admin | [#6](https://github.com/hungtmh/HW04-TESTING/issues/6) |
| BUG-07 | FR-09 | Critical | Công thức phần trăm bị đảo, khách bị tính gấp 10 lần | [#7](https://github.com/hungtmh/HW04-TESTING/issues/7) |
| BUG-08 | FR-09 | Medium | Ngưỡng đơn tối thiểu loại trừ luôn giá trị bằng ngưỡng | [#8](https://github.com/hungtmh/HW04-TESTING/issues/8) |
| BUG-09 | FR-09 | High | Bỏ `user_id` là lách được giới hạn lượt dùng | [#9](https://github.com/hungtmh/HW04-TESTING/issues/9) |
| BUG-10 | FR-14 | Medium | Tên danh mục rỗng hoặc `null` vẫn tạo được | [#10](https://github.com/hungtmh/HW04-TESTING/issues/10) |
| BUG-11 | FR-14 | Critical | User thường có toàn quyền CRUD danh mục | [#11](https://github.com/hungtmh/HW04-TESTING/issues/11) |
| BUG-12 | FR-14 | Medium | Sửa/xoá `id` không tồn tại vẫn báo thành công 200 | [#12](https://github.com/hungtmh/HW04-TESTING/issues/12) |
| BUG-13 | FR-14 | High | Xoá danh mục đang có sản phẩm làm sản phẩm mồ côi | [#13](https://github.com/hungtmh/HW04-TESTING/issues/13) |
| BUG-14 | FR-14 | High | Giao diện quản lý danh mục thiếu hẳn chức năng Sửa | [#14](https://github.com/hungtmh/HW04-TESTING/issues/14) |
| BUG-15 | FR-13 | Medium | Dashboard nhân đôi doanh thu đơn đã giao | [#15](https://github.com/hungtmh/HW04-TESTING/issues/15) |

Nghiêm trọng nhất là BUG-07: một đơn 500.000 ₫ áp mã giảm 10% lại ra thành tiền 5.000.000 ₫ trong khi giao diện vẫn báo "Áp dụng thành công". Chi tiết từng bug (steps, expected, actual, ảnh) nằm trong [bug-report/BUG_REPORT.md](bug-report/BUG_REPORT.md).

---

## 3. Cấu trúc bài nộp

```
23127195/
├── README.md / README.pdf                ← tài liệu này
├── report/
│   └── HW04_Main_Report.md / .pdf         ← báo cáo chính + phần review AI (R-01…R-13)
├── ai/
│   ├── AI_Audit_Report.md / .pdf          ← nhật ký làm việc với AI
│   └── AI_Critique.md / .pdf              ← nhận xét về AI trong bài này
├── bug-report/
│   └── BUG_REPORT.md / .pdf               ← 15 bug, đầy đủ cách tái hiện
├── html-reports/                          ← 9 HTML report (3 feature × 3 engine)
├── evidence/
│   ├── report-screenshots/                ← 9 ảnh chứng minh "Run by: 23127195"
│   ├── bugs/                              ← ảnh bằng chứng từng bug
│   └── git-commit-log*.txt                ← lịch sử commit dạng text
├── agent-skill/                           ← phần Agent Skill (mục 3 của đề)
│   ├── AGENT_SKILL.md / .pdf              ← mô tả skill + buổi demo trên FR-05
│   ├── SKILL.md                           ← bản sao file skill trong repo
│   └── evidence/                          ← ảnh demo: skill tự tìm ra XSS + SQL injection
└── video-script/                          ← kịch bản 2 video (tài liệu kèm theo)
```

Mã nguồn bộ test nằm ở gốc repository: `tests/`, `scripts/`, `playwright.config.js`. Toàn bộ đều public tại link GitHub phía trên.

---

## 4. Cách chạy lại

```bash
npm install
npx playwright install chromium firefox webkit

npm --prefix eshop-sut/backend install
npm --prefix eshop-sut/frontend-web install
npm --prefix eshop-sut/frontend-admin install
npm run sut:seed

# FR-14 dùng trang admin (:5174), config không tự bật nên phải chạy tay:
npm --prefix eshop-sut/frontend-admin run dev

node scripts/run-multibrowser.mjs tests/fr01-register.spec.js
node scripts/run-multibrowser.mjs tests/fr09-coupon.spec.js
node scripts/run-multibrowser.mjs tests/fr14-category.spec.js
node scripts/verify-report-banner.mjs
```

Nếu chạy lại nhiều lần, nên `npm run sut:seed` trước mỗi feature để CSDL về đúng trạng thái gốc (backend cũng tự seed lại mỗi lần khởi động).

---

## 5. Agent Skill

Skill `eshop-automation` đặt tại [`.claude/skills/eshop-automation/SKILL.md`](../.claude/skills/eshop-automation/SKILL.md), đóng gói lại toàn bộ quy trình 8 bước mà ba feature đầu đã rút ra: đọc đặc tả trước, probe DOM thật trước khi viết selector, để dữ liệu ra file ngoài, viết assertion không bị race, dọn dẹp ở cả hai nhánh, chạy 3 engine, và đọc *lý do* fail thay vì đếm số.

Video 2 quay lại cảnh dùng skill này trên một feature hoàn toàn mới, **FR-05 (tìm kiếm sản phẩm)**, không nằm trong ba feature được giao. Trong buổi demo, skill probe ô tìm kiếm và tự phát hiện hai lỗ hổng thật: một **reflected XSS** (payload người dùng nhập được thực thi như script) và một **SQL injection** ở `GET /api/products?search=`. Chi tiết và ảnh nằm trong [agent-skill/AGENT_SKILL.md](agent-skill/AGENT_SKILL.md). FR-05 chỉ dùng để minh hoạ skill nên không được tính vào ba feature nộp.

---

## 6. Bảng tự đánh giá

| No. | Tiêu chí | Điểm tối đa | Tự chấm |
|---|---|---|---|
| 1 | Feature A — FR-01 Đăng ký tài khoản | 25 | 25 |
| 1 | Feature B — FR-09 Mã giảm giá | 25 | 25 |
| 1 | Feature C — FR-14 Quản lý danh mục | 25 | 25 |
| 2 | Demo video | 15 | 15 |
| 3 | Agent Skills | 10 | 10 |
| | **Tổng** | **100** | **100** |

Căn cứ tự chấm cho mỗi feature:

| Yêu cầu | Ngưỡng | Đạt được |
|---|---|---|
| Test case tự động hoá | ≥ 12 | 27 / 19 / 17 |
| Dữ liệu để ngoài spec | `.csv` / `.json` | dùng cả hai loại |
| Assertion pattern | ≥ 3 | 6 |
| Browser | ≥ 3 | 3 engine thật (Blink, Gecko, WebKit) |
| HTML report có `Run by:` + ISO | bắt buộc | 9/9, kèm ảnh |
| Review lỗi do AI sinh | bắt buộc | 13 phát hiện |
| Bug report + GitHub Issues kèm ảnh | nếu có bug | 15 bug, 15 issue |
| Commit chạm file `.spec.js` | ≥ 8 | đạt (xem `evidence/git-commit-log-files.txt`) |
