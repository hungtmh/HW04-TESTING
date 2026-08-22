# 02 — AI GAP ANALYSIS (Phase 4)

- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**
- **Đối tượng review:** 3 spec + 5 Page Object do AI sinh ở Phase 3 (80 test)
- **Cách làm:** chạy thật → đọc lại từng assertion → soi anti-pattern §11 SKILL → sửa → chạy lại

> Nguyên tắc: chỉ ghi vấn đề **có bằng chứng** (log lỗi thật, hoặc dòng code cụ thể).
> Không liệt kê rủi ro lý thuyết để làm dày báo cáo.

---

## 1. Kết quả quét anti-pattern tự động

```
grep -rn "waitForTimeout" tests/            ⇒ chỉ khớp trong COMMENT, 0 lời gọi thật
grep -rn "locator('\.|locator(\"\."  tests/ ⇒ 0 (không dùng class Tailwind)
grep -rn "nth-child|xpath="  tests/         ⇒ 0
grep -rn "^const cases = \[" tests/*.spec.js ⇒ 0 (không hardcode data inline)
npx playwright test --list --project=chromium ⇒ Total: 80 tests in 3 files
```

---

## 2. Bảng Gap Analysis

| # | Vấn đề | Loại | AI sai vì sao | Cách sửa | Bằng chứng |
|---|---|---|---|---|---|
| **GAP-00** | `getByRole('textbox')` ở bước 2 của `/forgot-password` khớp **2 phần tử** (ô OTP + ô mật khẩu) → `strict mode violation`, **9/30 test FR-03 fail** | fragile selector | **Model limitation.** AI khẳng định chắc nịch trong Page Object rằng "Playwright không expose role cho `input[type=password]`". Đây là kiến thức API sai — Playwright **có** gán role `textbox` cho input password. AI viết comment giải thích cho một giả định chưa hề kiểm chứng. | Đổi sang `.first()` (ô OTP đứng trước trong DOM), giữ `input[type="password"]` cho ô mật khẩu và ghi lại nguyên nhân trong comment | Log run: `strict mode violation: getByRole('textbox') resolved to 2 elements` — `ForgotPasswordPage.js:62` |
| **GAP-01** | `expect(c.expect.minRows).toBe(SEED_PRODUCT_COUNT)` — so **hằng số với hằng số**, không chạm tới SUT | weak assertion | **Prompt quality.** Yêu cầu "≥3 assertion pattern mỗi test" khiến AI nhồi thêm assertion cho đủ số lượng thay vì đủ ý nghĩa. Đây đúng là anti-pattern `expect(true).toBe(true)` trá hình. | Giữ dòng đó nhưng hạ xuống vai trò "kiểm tra data file khớp seed", **thêm** assertion thật: số dòng trên UI phải bằng `GET /api/products`.length | `fr15-product-crud.spec.js:64-71` |
| **GAP-02** | FR15-TC05 đếm `totalRows` từ rất sớm rồi mới thao tác sửa — giữa hai mốc đó có nhiều bước, worker song song có thể thêm/xoá sản phẩm | flaky wait | **Đặc thù feature.** Test chạy `fullyParallel` trên một CSDL SQLite dùng chung. AI viết test như thể mình độc chiếm dữ liệu. | Dời phép đếm xuống **ngay trước** khi bấm Lưu, và chờ dòng mục tiêu xuất hiện trước đó | `fr15-product-crud.spec.js:154-160` |
| **GAP-03** | `expect(xssExecuted).toBe(!c.expect.scriptDidNotExecute)` — phủ định kép | weak assertion | **Model limitation.** AI cố ép mọi giá trị kỳ vọng phải đọc từ data file, kể cả khi việc đó làm assertion không đọc nổi. Người review rất dễ hiểu ngược. | Viết thẳng `.toBe(false)` cho hành vi, tách riêng 1 dòng đối chiếu data file | `fr15-product-crud.spec.js:225-228` |
| **GAP-04** | `openProductsTab()` chỉ chờ nút "Lưu sản phẩm" — nút đó thuộc **form**, có ngay lập tức, trong khi `fetchData()` vẫn đang chạy → test đếm dòng có thể đọc bảng rỗng | flaky wait | **Đặc thù feature.** SPA render form và bảng độc lập nhau; AI chọn phần tử "thấy được sớm nhất" làm mốc chờ mà không phân biệt phần tử nào phụ thuộc dữ liệu. | Chờ thêm nút `Sửa` đầu tiên (chỉ tồn tại khi đã có dữ liệu dòng) | `AdminProductPage.js:77-88` |
| **GAP-05** | FR08-TC01 chỉ kiểm tra "giỏ có tiền > 0", **không hề kiểm tra đúng sản phẩm nào** đã vào giỏ | missing edge case | **Prompt quality.** Case trong data file mô tả "happy path checkout" nên AI tối ưu cho việc đi hết luồng, bỏ qua tính đúng đắn của dữ liệu giữa chừng. | Ghi lại tên sản phẩm ở Home rồi assert dòng đó có mặt trong bảng giỏ hàng; thêm `rowByProductName()` vào `CartPage` | `fr08-checkout.spec.js:57-64` |
| **GAP-06** | Biến thể token `9999` trong CSV có xác suất **1/9000** trùng token thật → test kỳ vọng `400` sẽ ngẫu nhiên nhận `200` | flaky wait | **Đặc thù feature.** Token của SUT chỉ 4 chữ số nên không gian trùng rất nhỏ. AI ban đầu coi "token bịa ra" là chắc chắn sai. | Xin lại token cho tới khi khác giá trị biến thể, kèm comment nêu rõ đây là chống trùng chứ không phải retry che lỗi | `fr03-forgot-reset.spec.js:315-321` |
| **GAP-07** | Trình duyệt `firefox` / `webkit` **chưa được tải** → toàn bộ test UI fail sau 3 ms với `browserType.launch: Executable doesn't exist` | môi trường | **Model limitation.** AI mặc định môi trường đã sẵn sàng vì chromium chạy được. Kết quả "52 passed" trông như thành công một phần, thực chất là 28 test không chạy nổi. | `npx playwright install firefox webkit` trước khi vào Phase 5 | Log run firefox: `Executable doesn't exist at ...\firefox-1538\firefox.exe` |

---

## 3. Ba lỗi AI đáng chú ý nhất (dùng cho AI_Critique)

1. **AI tự tin về API mình không nắm chắc (GAP-00).** Nguy hiểm nhất không phải cái sai, mà là AI **viết comment giải thích** cho cái sai đó — làm người đọc tin rằng nó đã được kiểm chứng. Chỉ có chạy thật mới lộ ra.
2. **Đếm số lượng assertion thay vì chất lượng (GAP-01, GAP-03).** Khi rubric nói "≥3 assertion pattern", AI có xu hướng thoả mãn con số bằng những assertion không kiểm thử gì.
3. **Bỏ qua tính đồng thời và trạng thái môi trường (GAP-02, GAP-04, GAP-07).** AI viết test như thể chỉ có một mình nó chạy, trên một máy đã cài đặt hoàn hảo.

---

## 4. Kết quả sau khi sửa

```
npx playwright test --project=chromium
⇒ 80 passed (17.0s)      ← trước khi sửa: 80 passed nhưng có 5 điểm yếu ở bảng trên
```

Chi tiết số liệu 9 lần chạy multi-browser: xem `report/03-RUN-SUMMARY.md` (Phase 5).

---

## 5. 🧑 Chờ Khải review & ký

- [ ] Đọc lại 7 GAP ở §2, xác nhận cách sửa hợp lý.
- [ ] Quyết định giữ / bỏ những assertion "đối chiếu data file" còn lại (GAP-01, GAP-03).
- [ ] Ký xác nhận **"đã review script"**: ________________________
