# Ảnh chụp 9 HTML report — 🧑 Khải tự chụp

Thư mục này **cố ý để trống**. Theo SKILL.md §7, việc mở report và chụp màn hình là việc của người học,
agent không được tự sinh ảnh giả.

## Cách làm

1. Mở lần lượt 9 file (hoặc `npx playwright show-report <đường dẫn>`):

```
23127060/automation/playwright-report/fr03-reset-chromium/index.html
23127060/automation/playwright-report/fr03-reset-firefox/index.html
23127060/automation/playwright-report/fr03-reset-webkit/index.html
23127060/automation/playwright-report/fr08-checkout-chromium/index.html
23127060/automation/playwright-report/fr08-checkout-firefox/index.html
23127060/automation/playwright-report/fr08-checkout-webkit/index.html
23127060/automation/playwright-report/fr15-product-chromium/index.html
23127060/automation/playwright-report/fr15-product-firefox/index.html
23127060/automation/playwright-report/fr15-product-webkit/index.html
```

2. Mỗi ảnh phải thấy rõ **cả hai** chỗ mang banner:
   - **Tiêu đề tab trình duyệt**: `Run by: 23127060 — <ISO timestamp> · <feature>`
   - **Khối banner nền tối ở đầu trang**: MSSV, họ tên, feature, browser, và số passed/failed thật.

3. Đặt tên ảnh trùng tên thư mục report, ví dụ `fr03-reset-chromium.png`.

## Đối chiếu số liệu (từ `report/03-RUN-SUMMARY.md`)

| Report dir | Total | Passed |
|---|---|---|
| fr03-reset-chromium / firefox / webkit | 31 | 31 |
| fr08-checkout-chromium / firefox / webkit | 26 | 26 |
| fr15-product-chromium / firefox / webkit | 26 | 26 |
| **Tổng 9 report** | **249** | **249** |

Nếu số trên ảnh **khác** bảng này thì report đã được chạy lại — hãy cập nhật lại `03-RUN-SUMMARY.md`
bằng `node scripts/summarize-results.mjs` để mọi tài liệu khớp nhau.
