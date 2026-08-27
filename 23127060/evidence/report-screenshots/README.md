# Ảnh chụp 9 HTML report

Ảnh trong thư mục này do 🧑 **Khải tự mở report và chụp màn hình**. Theo SKILL.md §7,
agent **không được tự sinh ảnh** — agent chỉ đối chiếu số liệu trên ảnh với `results.json`.

## Kết quả đối chiếu — ✅ ĐỦ 9/9, KHỚP TUYỆT ĐỐI (verify 2026-08-27)

Đọc từng ảnh, so số hiển thị với `report/03-RUN-SUMMARY.md` và `playwright-report/<dir>/results.json`:

| # | Ảnh | All / Passed | Failed·Flaky·Skipped | Duration | ISO timestamp trên banner | Khớp |
|---|---|---|---|---|---|---|
| 1 | `fr03-reset-chromium.png` | 31 / 31 | 0 · 0 · 0 | 7.4s | `2026-08-22T14:20:18.864Z` | ✅ |
| 2 | `fr03-reset-firefox.png` | 31 / 31 | 0 · 0 · 0 | 11.9s | `2026-08-22T14:20:27.128Z` | ✅ |
| 3 | `fr03-reset-webkit.png` | 31 / 31 | 0 · 0 · 0 | 14.3s | `2026-08-22T14:20:39.954Z` | ✅ |
| 4 | `fr08-checkout-chromium.png` | 26 / 26 | 0 · 0 · 0 | 6.6s | `2026-08-22T14:20:55.137Z` | ✅ |
| 5 | `fr08-checkout-firefox.png` | 26 / 26 | 0 · 0 · 0 | 11.1s | `2026-08-22T14:21:02.604Z` | ✅ |
| 6 | `fr08-checkout-webkit.png` | 26 / 26 | 0 · 0 · 0 | 13.4s | `2026-08-22T14:21:14.586Z` | ✅ |
| 7 | `fr15-product-chromium.png` | 26 / 26 | 0 · 0 · 0 | 5.6s | `2026-08-22T14:21:29.048Z` | ✅ |
| 8 | `fr15-product-firefox.png` | 26 / 26 | 0 · 0 · 0 | 10.7s | `2026-08-22T14:21:35.552Z` | ✅ |
| 9 | `fr15-product-webkit.png` | 26 / 26 | 0 · 0 · 0 | 10.3s | `2026-08-22T14:21:47.264Z` | ✅ |
| | **TỔNG 9 report** | **249 / 249** | **0 · 0 · 0** | **91.5s** | | ✅ |

**Kết luận: đủ 9/9 ảnh, tất cả khớp tuyệt đối** với `03-RUN-SUMMARY.md` — cả số test, số passed,
duration lẫn ISO timestamp. **Report chưa hề bị chạy lại**, nên **không cần** chạy
`node scripts/summarize-results.mjs`; mọi tài liệu đang khớp nhau.

Mỗi ảnh đều hiện rõ khối banner chống gian lận ở đầu trang (MSSV, họ tên, feature, browser,
số passed/failed thật) và tiêu đề H1 `Run by: 23127060 — <ISO timestamp>`.

## Cách chụp (nếu cần chụp lại)

1. Mở file `index.html` của report bằng trình duyệt (hoặc `npx playwright show-report <đường dẫn>`).
2. Ảnh cần thấy rõ **khối banner nền tối ở đầu trang**: MSSV, họ tên, feature, browser,
   và số passed/failed thật. Thấy thêm **tiêu đề tab trình duyệt**
   (`Run by: 23127060 — <ISO> · <feature>`) thì càng chắc.
3. Đặt tên ảnh trùng tên thư mục report, ví dụ `fr08-checkout-firefox.png`.

## Ghi chú nhỏ (không bắt buộc sửa)

- `fr03-reset-chromium.png` đang bật bộ lọc `s:passed` trên thanh tìm kiếm nên có thêm dòng
  *"Filtered: 31"*. Không sai lệch gì — `All 31 / Passed 31` và banner vẫn hiện đầy đủ.
- 7/9 ảnh bị cắt phần tab trình duyệt, chỉ còn từ thanh địa chỉ trở xuống. Yêu cầu của đề bài
  (*HTML report visibly displays "Run by: {StudentID}"*) vẫn **đạt**, vì banner nền tối và
  tiêu đề H1 trong trang đều ghi rõ `Run by: 23127060` kèm ISO timestamp. Không cần chụp lại.
