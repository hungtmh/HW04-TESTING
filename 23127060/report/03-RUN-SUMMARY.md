# 03 — KẾT QUẢ 9 LẦN CHẠY MULTI-BROWSER (Phase 5)

- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**
- **Sinh tự động bởi:** `scripts/summarize-results.mjs` lúc 2026-08-22T14:22:32.272Z
- **Nguồn số liệu:** `playwright-report/<dir>/results.json` do Playwright sinh ra. Không con số nào nhập tay.

| # | Report dir | Feature | Browser | Total | Passed | Failed | Flaky | Skipped | Duration (s) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `fr03-reset-chromium` | fr03-reset | chromium | 31 | 31 | 0 | 0 | 0 | 7.4 |
| 2 | `fr03-reset-firefox` | fr03-reset | firefox | 31 | 31 | 0 | 0 | 0 | 11.9 |
| 3 | `fr03-reset-webkit` | fr03-reset | webkit | 31 | 31 | 0 | 0 | 0 | 14.3 |
| 4 | `fr08-checkout-chromium` | fr08-checkout | chromium | 26 | 26 | 0 | 0 | 0 | 6.6 |
| 5 | `fr08-checkout-firefox` | fr08-checkout | firefox | 26 | 26 | 0 | 0 | 0 | 11.1 |
| 6 | `fr08-checkout-webkit` | fr08-checkout | webkit | 26 | 26 | 0 | 0 | 0 | 13.4 |
| 7 | `fr15-product-chromium` | fr15-product | chromium | 26 | 26 | 0 | 0 | 0 | 5.6 |
| 8 | `fr15-product-firefox` | fr15-product | firefox | 26 | 26 | 0 | 0 | 0 | 10.7 |
| 9 | `fr15-product-webkit` | fr15-product | webkit | 26 | 26 | 0 | 0 | 0 | 10.3 |
| | **TỔNG** | | | **249** | **249** | **0** | **0** | **0** | **91.5** |

## Banner chống gian lận (metadata đọc từ results.json)

| Report dir | Run by | Run at (ISO) |
|---|---|---|
| `fr03-reset-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T14:20:18.864Z |
| `fr03-reset-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T14:20:27.128Z |
| `fr03-reset-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T14:20:39.954Z |
| `fr08-checkout-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T14:20:55.137Z |
| `fr08-checkout-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T14:21:02.604Z |
| `fr08-checkout-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T14:21:14.586Z |
| `fr15-product-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T14:21:29.048Z |
| `fr15-product-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T14:21:35.552Z |
| `fr15-product-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T14:21:47.264Z |

Tỉ lệ pass tổng thể: **100.0%** (249/249).

> Mỗi test PASS ở đây nghĩa là **hành vi thật của SUT khớp với kỳ vọng đã ghi trong test**.
> Với các test gắn mã `BUG-xx-xx`, kỳ vọng chính là *hành vi sai* đã được xác minh —
> test pass = **bug vẫn tồn tại**. Chi tiết xem `bug-report/BUG_REPORT.md`.
