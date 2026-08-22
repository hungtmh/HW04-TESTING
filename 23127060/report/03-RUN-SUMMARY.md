# 03 — KẾT QUẢ 9 LẦN CHẠY MULTI-BROWSER (Phase 5)

- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**
- **Sinh tự động bởi:** `scripts/summarize-results.mjs` lúc 2026-08-22T13:53:30.524Z
- **Nguồn số liệu:** `playwright-report/<dir>/results.json` do Playwright sinh ra. Không con số nào nhập tay.

| # | Report dir | Feature | Browser | Total | Passed | Failed | Flaky | Skipped | Duration (s) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `fr03-reset-chromium` | fr03-reset | chromium | 30 | 30 | 0 | 0 | 0 | 7.3 |
| 2 | `fr03-reset-firefox` | fr03-reset | firefox | 30 | 30 | 0 | 0 | 0 | 12.4 |
| 3 | `fr03-reset-webkit` | fr03-reset | webkit | 30 | 30 | 0 | 0 | 0 | 15.5 |
| 4 | `fr08-checkout-chromium` | fr08-checkout | chromium | 25 | 25 | 0 | 0 | 0 | 6.9 |
| 5 | `fr08-checkout-firefox` | fr08-checkout | firefox | 25 | 25 | 0 | 0 | 0 | 12.2 |
| 6 | `fr08-checkout-webkit` | fr08-checkout | webkit | 25 | 25 | 0 | 0 | 0 | 13.8 |
| 7 | `fr15-product-chromium` | fr15-product | chromium | 25 | 25 | 0 | 0 | 0 | 5.7 |
| 8 | `fr15-product-firefox` | fr15-product | firefox | 25 | 25 | 0 | 0 | 0 | 10.0 |
| 9 | `fr15-product-webkit` | fr15-product | webkit | 25 | 25 | 0 | 0 | 0 | 9.8 |
| | **TỔNG** | | | **240** | **240** | **0** | **0** | **0** | **93.7** |

## Banner chống gian lận (metadata đọc từ results.json)

| Report dir | Run by | Run at (ISO) |
|---|---|---|
| `fr03-reset-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T13:51:45.350Z |
| `fr03-reset-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T13:51:53.718Z |
| `fr03-reset-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T13:52:06.980Z |
| `fr08-checkout-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T13:52:23.336Z |
| `fr08-checkout-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T13:52:31.122Z |
| `fr08-checkout-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T13:52:44.187Z |
| `fr15-product-chromium` | 23127060 – Ninh Văn Khải | 2026-08-22T13:52:58.994Z |
| `fr15-product-firefox` | 23127060 – Ninh Văn Khải | 2026-08-22T13:53:05.659Z |
| `fr15-product-webkit` | 23127060 – Ninh Văn Khải | 2026-08-22T13:53:16.596Z |

Tỉ lệ pass tổng thể: **100.0%** (240/240).

> Mỗi test PASS ở đây nghĩa là **hành vi thật của SUT khớp với kỳ vọng đã ghi trong test**.
> Với các test gắn mã `BUG-xx-xx`, kỳ vọng chính là *hành vi sai* đã được xác minh —
> test pass = **bug vẫn tồn tại**. Chi tiết xem `bug-report/BUG_REPORT.md`.
