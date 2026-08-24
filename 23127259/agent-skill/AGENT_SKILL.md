# Agent Skill - `eshop-automation-23127259`

| | |
|---|---|
| Sinh viên | Nguyễn Tấn Thắng - 23127259 |
| Skill | `eshop-automation-23127259` |
| Bản nộp | `23127259/agent-skill/SKILL.md` |
| Bản Codex đã validate | `23127259/agent-skill/eshop-automation/SKILL.md` |
| Video demo | [FR16 - Agent Skill](https://youtu.be/ZEHdd4JB9dw) - 8:27 |
| Feature demo | FR-16 - Product Import from CSV |

## 1. Skill này làm gì

Khi xây bộ test ban đầu, các lỗi không nằm ở Playwright syntax mà nằm ở cách suy luận: AI đoán selector theo form chuẩn, import CSV nhưng không dùng dữ liệu, reload làm mất React Context, hoặc thấy test đỏ là gọi ngay là bug. Skill này gói các bài học đó thành quy trình 8 bước:

1. Đọc SRS và cross-cutting requirements trước.
2. Probe DOM, API, route và vòng đời state thật.
3. Tách toàn bộ input/expected sang CSV hoặc JSON.
4. Dùng POM cho locator/action, giữ assertion SRS trong spec.
5. Chạy cổng `--grep-invert @bug` để loại lỗi harness.
6. Chỉ tag `@bug` khi nguyên nhân là SUT vi phạm SRS.
7. Chạy Chromium/Firefox/WebKit và verify metadata.
8. Tạo bug report, evidence, Issue và ghi lại human review.

## 2. Buổi áp dụng trên FR-16

FR-16 là minh chứng rõ nhất cho giá trị của skill. Bản nháp AI dùng selector `input[type=email]` và nút “Đăng Nhập”, trong khi DOM admin thực tế không có `type=email` và nút ghi `Login`. Sau khi login, AI cũng không mở tab Sản phẩm; selector table lại match cả preview và product table.

Làm theo skill, em đã:

- Probe DOM và chuyển selector sang placeholder thật.
- Click tab Sản phẩm trước khi thao tác import.
- Scope tất cả locator trong import panel.
- Chuyển payload non-admin, mixed rows và negative price sang JSON.
- Chạy bảy case bình thường qua non-bug gate.
- Giữ năm assertion đỏ theo SRS: role, rollback, price, RFC 4180, file filter.

Kết quả của FR-16 trên cả ba engine giống nhau:

| Browser | Pass | `@bug` fail | Unexpected |
|---|---:|---:|---:|
| Chromium | 7 | 5 | 0 |
| Firefox | 7 | 5 | 0 |
| WebKit | 7 | 5 | 0 |

## 3. Validation và evidence

Skill Codex đã được kiểm tra bằng:

```bash
python3 /Users/thangnhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  23127259/agent-skill/eshop-automation
```

Kết quả: `Skill is valid!`.

Evidence cho buổi demo:

- `playwright-report/fr16-import-csv-{chromium,firefox,webkit}/`
- `evidence/report-screenshots/fr16-import-csv-*.png`
- `evidence/bugs/BUG-16...BUG-20*.png`

## 4. Video demonstration

Video Agent Skill do em trực tiếp thao tác và thuyết minh đã được upload: [https://youtu.be/ZEHdd4JB9dw](https://youtu.be/ZEHdd4JB9dw). YouTube metadata xác nhận video có tiêu đề **FR16 - Agent Skill**, tác giả **Thắng Nguyễn**, thời lượng 8:27. Hai link video cuối được lưu trong `video-script/VIDEO_LINKS.md`.
