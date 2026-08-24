# VIDEO 2 - Demo Agent Skill `eshop-automation-23127259`

| | |
|---|---|
| Người trình bày | Nguyễn Tấn Thắng - 23127259 |
| Ngôn ngữ | Tiếng Việt |
| Thời lượng mục tiêu | 7-9 phút |
| Skill | `23127259/agent-skill/SKILL.md` |
| Feature demo hoàn chỉnh | FR-16 - Product Import from CSV |
| Evidence tác giả | Face-cam hoặc `whoami` + `hostname` |
| Chế độ YouTube | Unlisted |

> Đề không quy định riêng ngôn ngữ cho video Agent Skill, nhưng nên dùng **tiếng Việt** nhất quán với video chính và yêu cầu thuyết minh của bài.

---

# PHẦN A - CHUẨN BỊ TRƯỚC KHI BẤM REC

## A1. Mở sẵn các file

Trong VS Code/Codex mở:

- `23127259/agent-skill/SKILL.md`
- `23127259/agent-skill/AGENT_SKILL.md`
- `23127259/agent-skill/eshop-automation/SKILL.md`
- `tests/pages/AdminImportPage.js`
- `tests/data/fr16-import-cases.json`
- `tests/fr16-import-csv.spec.js`
- `playwright-report/fr16-import-csv-summary.json`

Mở Chrome sẵn:

- `https://github.com/hungtmh/HW04-TESTING/issues/31`
- `https://github.com/hungtmh/HW04-TESTING/pull/36`

## A2. Mở công cụ AI

Mở Codex/Claude Code trong repository. Không yêu cầu AI viết lại toàn bộ feature khi đang quay; mục tiêu là chứng minh skill được nạp, hiểu workflow và audit một feature hoàn chỉnh.

Prompt để copy nguyên khối:

```text
Use the EShop automation skill at 23127259/agent-skill/SKILL.md.
Audit FR-16 Product Import from CSV end to end.

Requirements:
1. Read FR-16, FR-12, FR-22 and SEC-03 in eshop-sut/README.md before code.
2. Check that AdminImportPage uses the real admin DOM and opens the Products tab.
3. Verify that CSV/JSON files actually drive the tests and no test payload array is hardcoded in the spec.
4. Run the Chromium non-@bug gate and classify any failure by root cause.
5. Verify the existing Chromium/Firefox/WebKit summaries and report metadata.
6. Do not edit the SUT and do not weaken an SRS assertion.
7. Return a concise audit with evidence paths.
```

## A3. Kiểm tra skill trước quay

Chạy:

```bash
python3 /Users/thangnhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  23127259/agent-skill/eshop-automation
```

Phải thấy:

```text
Skill is valid!
```

## A4. Checklist trước REC

- [ ] AI tool mở đúng repository.
- [ ] Skill và feature FR-16 mở sẵn.
- [ ] Prompt đã copy vào clipboard.
- [ ] Browser engines đã cài.
- [ ] Terminal font đủ lớn.
- [ ] Không có token/API key trong màn hình.

---

# PHẦN B - KỊCH BẢN QUAY VÀ LỜI THOẠI

## Mục 1 - Mở đầu và chứng minh tác giả (0:00-0:45)

### Thao tác

```bash
whoami
hostname
pwd
```

### Lời thoại

> Xin chào thầy. Em là sinh viên Nguyễn Tấn Thắng, mã số sinh viên 23127259. Đây là video thứ hai của bài HW04, trình bày Agent Skill `eshop-automation-23127259`. Skill này đóng gói quy trình tạo và kiểm tra automation theo SRS, POM, data-driven và multi-browser. Em sẽ áp dụng skill trên một feature hoàn chỉnh là FR-16 Product Import from CSV.

## Mục 2 - Giới thiệu cấu trúc và mục tiêu của skill (0:45-2:00)

### Thao tác

Mở `23127259/agent-skill/SKILL.md`, lướt qua tám bước và phần EShop facts.

### Lời thoại

> Skill bắt đầu bằng việc đọc đặc tả trước khi đọc implementation, vì expected result phải đến từ SRS. Bước hai yêu cầu probe DOM, API, route và vòng đời state thay vì đoán selector. Bước ba bắt buộc tách toàn bộ input và expected sang CSV hoặc JSON. Sau đó dùng POM nhưng giữ assertion SRS trong spec.

> Guardrail quan trọng nhất là non-bug gate. Mọi test không gắn @bug phải pass trước. Wrong selector, mất React state, thiếu browser hoặc timeout không được gọi là bug sản phẩm. Chỉ failure vi phạm SRS mới được tag @bug. Cuối cùng skill chạy ba engine, verify Run by và ISO timestamp, rồi tạo Bug Report, evidence và GitHub Issue.

Chỉ vào các SUT facts:

> Skill cũng lưu các kiến thức không nên mất công khám phá lại: port của ba service, DOM login admin dùng placeholder, phải mở tab Sản phẩm mới thấy import panel, và locator preview phải scope vì trang có nhiều table.

## Mục 3 - Validate skill (2:00-2:30)

### Thao tác

Chạy lệnh validator đã chuẩn bị.

### Lời thoại

> Đây là validator của Skill Creator. Kết quả Skill is valid xác nhận frontmatter, tên skill và cấu trúc không còn placeholder chưa hoàn thiện. Validator không thay thế việc chạy test, nên tiếp theo em sẽ dùng skill để audit FR-16 thực tế.

## Mục 4 - Gọi skill trong AI tool (2:30-3:35)

### Thao tác

Dán prompt chuẩn bị ở phần A2 và gửi. Khi AI đọc file, chỉ vào các file được mở hoặc tool log.

### Lời thoại trong lúc AI làm việc

> Prompt yêu cầu AI đọc FR-16, FR-12 và SEC-03 trước; kiểm tra POM, DDT, non-bug gate, ba summary và metadata. Em giới hạn rõ không được sửa SUT và không được làm yếu assertion. Đây là cách dùng AI có kiểm soát thay vì chỉ yêu cầu chung chung là viết test cho feature này.

Khi AI trả audit, chỉ vào kết luận và evidence paths.

## Mục 5 - Minh họa human review trên FR-16 (3:35-4:55)

### Thao tác

Mở `AdminImportPage.js`, chỉ lần lượt:

- Selector theo placeholder `Email`/`Password`.
- Nút `Login`.
- Click tab `Sản phẩm`.
- `importSection` và các locator scope bên trong.

Mở JSON payload và spec TC06, TC09, TC10.

### Lời thoại

> Bản AI ban đầu sai selector vì giả định admin login giống một form chuẩn: dùng input type email và nút Đăng Nhập. DOM thật lại không có type email và nút ghi Login. AI cũng quên mở tab Sản phẩm và dùng selector table quá rộng, làm preview nhận cả product table.

> Theo skill, em probe DOM rồi sửa POM theo placeholder thật, click đúng tab và scope mọi locator trong import panel. Các payload non-admin, mixed rows và negative price được đưa sang JSON. Spec chỉ tham chiếu data ngoài, không hardcode mảng payload.

## Mục 6 - Chạy non-bug gate (4:55-5:40)

### Thao tác

```bash
npx playwright test tests/fr16-import-csv.spec.js \
  --project=chromium --grep-invert @bug
```

### Lời thoại

> Đây là cổng quan trọng nhất của skill. Lệnh loại các case @bug và chỉ chạy case bình thường. Kết quả phải là bảy trên bảy pass. Nếu có một case đỏ ở đây thì em phải sửa test harness trước, chưa được tạo Bug Report.

Khi hiện `7 passed`, phóng to kết quả.

## Mục 7 - Chạy đủ ba browser và xem summary (5:40-6:55)

### Thao tác

```bash
npm run test:multibrowser:fr16
```

Trong khi chờ, mở sẵn `playwright-report/fr16-import-csv-summary.json` ở cửa sổ khác nếu cần.

### Lời thoại

> Runner chạy Chromium, Firefox và WebKit, mỗi engine sinh một report. Năm case đỏ của FR-16 kiểm tra: user thường gọi được API admin, import không rollback, chấp nhận giá âm, parser sai RFC 4180 và file picker thiếu accept .csv.

Khi summary xuất hiện:

> Cả ba browser đều có bảy pass, năm bug failure và zero unexpected failure. Kết quả nhất quán chứng minh các failure không phải flaky hoặc lỗi riêng engine.

## Mục 8 - Report, evidence và GitHub Issue (6:55-7:55)

### Thao tác

Mở report:

```bash
npx playwright show-report playwright-report/fr16-import-csv-chromium
```

Mở TC06 hoặc TC09, chỉ metadata và failure. Sau đó chuyển Chrome sang Issue #31.

### Lời thoại

> Report có Run by 23127259 và ISO timestamp. TC06 kỳ vọng customer token bị từ chối 403 theo SEC-03, nhưng SUT trả 200 và import thành công. Đây là Critical bug, không phải lỗi test. Issue số 31 do tài khoản thangak18 tạo, có steps, expected, actual, đề xuất sửa và evidence image. Năm root defect FR-16 tương ứng Issues 31 đến 35.

## Mục 9 - Khả năng tái sử dụng và kết luận (7:55-8:40)

### Thao tác

Quay lại `SKILL.md`, chỉ deliverables checklist và `AGENT_SKILL.md`.

### Lời thoại

> Skill có thể tái sử dụng cho feature khác bằng cách đổi mapping SRS, Page Object và dataset. Quy tắc non-bug gate, ba browser, phân loại root cause và evidence vẫn giữ nguyên. Qua bài này em học được rằng AI giúp tăng tốc nhưng con người phải kiểm tra DOM thật, nguyên nhân failure và tính đúng của assertion. Em cảm ơn thầy đã theo dõi phần Agent Skill.

---

# PHẦN C - KIỂM TRA SAU KHI QUAY

- [ ] Có `whoami`, `hostname` hoặc face-cam.
- [ ] Giới thiệu rõ skill và tám bước.
- [ ] Chạy validator và thấy `Skill is valid!`.
- [ ] Gửi prompt vào AI tool và thấy AI đọc/audit file thật.
- [ ] Giải thích ít nhất một lỗi AI và human fix.
- [ ] Non-bug gate hiện `7 passed`.
- [ ] Multi-browser summary có ba engine và zero unexpected.
- [ ] HTML report có student ID + ISO.
- [ ] Có evidence/GitHub Issue.
- [ ] Video nói tiếng Việt, âm thanh rõ.
- [ ] Upload YouTube **Unlisted** và kiểm tra link ở Incognito.
- [ ] Gửi link để cập nhật README/Main Report/Agent Skill.

## Phương án dự phòng

- Nếu AI tool phản hồi chậm: quay trước phần giải thích skill và terminal; không giả output, có thể cắt thời gian chờ.
- Nếu AI đề nghị sửa SUT: dừng và nhắc lại guardrail `Do not edit the SUT`.
- Nếu multi-browser run dài: không cắt mất bảng summary cuối; có thể tăng tốc đoạn chờ khi edit nhưng phải giữ thao tác bắt đầu và kết quả.
- Nếu validator path khác máy: chạy validator theo path thực tế hoặc chỉ rõ file `SKILL.md` đã validate trước, nhưng nên quay được output thật.
