# 03 — KẾT QUẢ 9 LẦN CHẠY MULTI-BROWSER (Phase 5)

- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**
- **Sinh tự động bởi:** `scripts/summarize-results.mjs` lúc 2026-08-27T16:05:53.983Z
- **Nguồn số liệu:** `playwright-report/<dir>/results.json` do Playwright sinh ra

Ở tài liệu này em tổng hợp lại kết quả của cả 9 lần chạy, tương ứng 3 feature nhân với 3 trình duyệt.
Em xin nói rõ là em không tự gõ bảng này: em viết script `summarize-results.mjs` để đọc thẳng file
`results.json` mà Playwright sinh ra sau mỗi lần chạy, rồi tự dựng bảng. Nhờ vậy em chắc chắn là
**không có con số nào trong đây do em nhập tay**, và nếu chạy lại thì bảng sẽ tự cập nhật theo.

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

## Banner chống gian lận (metadata em đọc từ results.json)

Đề bài yêu cầu mỗi report phải có banner ghi rõ người chạy để chống gian lận. Em kiểm tra lại bằng
cách đọc phần metadata trong chính `results.json` của từng lần chạy, và xin liệt kê ra đây để
thầy/cô đối chiếu với ảnh chụp màn hình mà em nộp kèm:

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

Tính chung cả 9 lần chạy, tỉ lệ pass em đạt được là **100.0%**, tức 249 trên tổng số 249 lượt chạy test.

> **Em xin giải thích rõ con số này nên được hiểu như thế nào.** Một test PASS ở đây có nghĩa là
> **hành vi thật của SUT khớp với kỳ vọng mà em đã ghi trong test**. Riêng với những test em gắn mã
> `BUG-xx-xx`, kỳ vọng mà em ghi vào chính là *hành vi sai* mà em đã xác minh được từ trước. Cho nên
> với các test đó, pass đồng nghĩa với việc **bug vẫn còn tồn tại trong hệ thống**, chứ không phải là
> hệ thống chạy đúng. Chi tiết từng lỗi em trình bày ở `bug-report/BUG_REPORT.md`.
