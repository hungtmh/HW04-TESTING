# VIDEO 1 — KỊCH BẢN DEMO (≥ 5 phút)

- **Người quay:** Ninh Văn Khải — MSSV 23127060
- **Ngôn ngữ:** tiếng Việt, **giọng thật** (không dùng TTS)
- **Bắt buộc:** face-cam **HOẶC** terminal chạy `whoami && hostname` hiện rõ trên màn hình
- **Upload:** YouTube **Unlisted** → dán link vào `README.md`

> ⚠️ Kịch bản này chỉ là **dàn ý nói**. Mọi con số đọc trong video phải là con số **hiện trên màn hình lúc quay**,
> không đọc theo file này. Nếu chạy lại mà số khác thì đọc theo số mới.

---

## Timeline tổng: ~8 phút

| Phần | Thời lượng | Nội dung |
|---|---|---|
| 1 | 0:00–0:40 | Giới thiệu & xác thực danh tính |
| 2 | 0:40–1:40 | Giới thiệu SUT và 3 feature |
| 3 | 1:40–2:40 | Kiến trúc bộ test (data-driven, POM, 5 assertion pattern) |
| 4 | 2:40–4:10 | Chạy test **live** |
| 5 | 4:10–5:20 | Mở HTML report, chỉ banner chống gian lận |
| 6 | 5:20–6:50 | Demo 3 bug nặng nhất |
| 7 | 6:50–7:50 | **Một lỗi AI tôi đã tự sửa** (bắt buộc) |
| 8 | 7:50–8:10 | Kết |

---

## PHẦN 1 — Giới thiệu & xác thực (0:00–0:40)

**Hình:** face-cam hoặc terminal.

**Thao tác:** gõ và để output hiện rõ:
```bash
whoami && hostname && date
```

**Lời nói:**
> "Chào thầy/cô. Em là Ninh Văn Khải, MSSV 23127060. Đây là bài HW04 — Automation Testing với AI,
> em làm ba feature: FR-03 Quên và Đặt lại mật khẩu, FR-08 Thanh toán, và FR-15 Quản lý sản phẩm.
> Trên màn hình là `whoami` và `hostname` của máy em để xác thực. Toàn bộ video này em chạy trực tiếp,
> không cắt ghép số liệu."

---

## PHẦN 2 — SUT và 3 feature (0:40–1:40)

**Thao tác:** mở 3 tab trình duyệt: `localhost:5173` (web), `localhost:5174` (admin), và `localhost:3000/api/products`.

**Lời nói:**
> "SUT là EShop: backend Express chạy port 3000, web port 5173, admin port 5174.
> Có một ràng buộc quan trọng em phải xử lý: cơ sở dữ liệu bị DROP và seed lại **mỗi lần** khởi động backend.
> Nên mọi test của em đều tự đăng ký user riêng bằng email random, không test nào phụ thuộc dữ liệu của test khác."

**Thao tác:** mở `report/00-SUT-RECON.md`, cuộn qua bảng route ↔ selector ↔ API.

> "Trước khi viết một dòng test nào, em đọc source SUT và lập bảng này: mỗi selector đều ghi rõ đọc từ file nào,
> dòng bao nhiêu. Ví dụ ô tổng tiền ở trang checkout — Checkout.jsx dòng 96 tới 106 — là input type number,
> tức là **sửa được**. Chính chỗ này thành bug nặng nhất của FR-08."

---

## PHẦN 3 — Kiến trúc bộ test (1:40–2:40)

**Thao tác:** mở `automation/tests/` trong editor, chỉ lần lượt `data/`, `pages/`, `utils/`.

**Lời nói:**
> "Bộ test có 80 test case, chia ba spec. Toàn bộ dữ liệu nằm ngoài code: ba file JSON cho case phức tạp,
> ba file CSV cho bảng giá trị biên — tổng 77 record. Trong spec không có một mảng dữ liệu hardcode nào."

**Thao tác:** mở `data/fr08-order-totals.csv`, chỉ 3 dòng TC15a/TC15b/TC15c.

> "Đây là ví dụ về giá trị biên. Mã BIGBUY yêu cầu đơn tối thiểu 500.000. Em test ba mốc:
> 499.999, đúng 500.000, và 500.001. Chính mốc giữa — đúng bằng 500.000 — mới lộ ra bug off-by-one:
> code dùng dấu lớn hơn thay vì lớn hơn hoặc bằng. Nếu chỉ test 'đơn đủ lớn' với 'đơn quá nhỏ' thì bug này lọt hết."

**Thao tác:** mở `pages/CheckoutPage.js`, chỉ comment dẫn nguồn selector.

> "Năm Page Object, mỗi selector đều có comment ghi rõ nguồn. Và em dùng năm assertion pattern:
> kiểm tra text trên UI, kiểm tra URL, kiểm tra trạng thái backend qua API, kiểm tra số học ở giá trị biên,
> và bắt hộp thoại alert — vì SUT này báo kết quả bằng `alert()` chứ không render toast vào DOM."

---

## PHẦN 4 — Chạy test LIVE (2:40–4:10)

**Thao tác:**
```bash
cd 23127060/automation
npx playwright test --project=chromium --grep @fr08
```

**Lời nói (trong lúc test chạy):**
> "Em chạy live FR-08 trên Chromium. Lưu ý cách đọc kết quả: **rất nhiều test của em được viết để khẳng định
> hành vi SAI hiện tại của SUT**. Ví dụ test 'backend chấp nhận tổng tiền âm' — nó pass nghĩa là backend
> **thật sự** chấp nhận tổng tiền âm. Test pass ở đây nghĩa là **bug vẫn còn**. Khi SUT được vá,
> chính các test này sẽ fail — và đó là tín hiệu đúng, không phải test hỏng."

**Sau khi xong:**
```bash
node scripts/run-multibrowser.mjs
```
> "Còn đây là chín lần chạy: ba feature nhân ba trình duyệt. 240 test."

---

## PHẦN 5 — HTML report và banner (4:10–5:20)

**Thao tác:** mở `playwright-report/fr08-checkout-chromium/index.html` bằng trình duyệt.
Zoom vào banner đầu trang **và** vào tab title.

**Lời nói:**
> "Mỗi report có banner 'Run by: 23127060' kèm ISO timestamp — cả ở đầu trang và ở tiêu đề tab.
> Số passed, failed, duration trên banner này lấy từ chính lần chạy đó, không nhập tay."

**Thao tác:**
```bash
node scripts/verify-report-banner.mjs
```
> "Script này fail cứng nếu bất kỳ report nào thiếu banner. Chín trên chín hợp lệ."

**Điểm kỹ thuật nên nói (gây ấn tượng ở vấn đáp):**
> "Có một chi tiết em phải xử lý: option `title` của HTML reporter **không còn tác dụng** ở Playwright 1.62.
> Em kiểm chứng bằng cách giải nén blob base64 trong index.html — trường `title` trong đó là `null`.
> Nên em viết một reporter tuỳ biến chạy sau HTML reporter để đóng dấu banner vào file."

---

## PHẦN 6 — Demo 3 bug nặng nhất (5:20–6:50)

### Bug 1 — BUG-08-07: mã giảm giá làm TĂNG tiền (~30s)
**Thao tác:** trên web, thêm iPhone 30 triệu vào giỏ → checkout → nhập `SAVE10` → **Áp dụng**.

> "Mã SAVE10 là giảm 10%. Nhìn màn hình: nó báo 'Áp dụng thành công, giảm 10%' — nhưng thành tiền nhảy
> từ 30 triệu lên **300 triệu**. Nguyên nhân ở server.js dòng 432: công thức viết `total * (1 - discount_value)`,
> lẫn giữa 'tỉ lệ giảm' với 'hệ số còn lại', và quên chia 100. Với discount_value = 10 thì ra âm chín lần tổng tiền."

### Bug 2 — BUG-08-01: sửa tay tổng tiền (~30s)
**Thao tác:** sửa ô tổng tiền về `1` → **Xác Nhận Thanh Toán** → mở `localhost:3000/api/orders/<id>`.

> "Ô tổng tiền ở trang thanh toán là input number sửa được. Em gõ 1, bấm xác nhận — thành công.
> Mở đơn hàng trong database: `total_amount` bằng đúng 1 đồng cho giỏ hàng 30 triệu."

### Bug 3 — BUG-15-01: sửa 1 sản phẩm, cả bảng đổi tên (~30s)
**Thao tác:** mở admin → tab Sản phẩm → chụp bảng trước → Sửa 1 sản phẩm → Lưu → chỉ vào bảng sau.

> "Em sửa tên đúng **một** sản phẩm. Nhìn bảng: **cả sáu dòng** đổi thành cùng một tên — nhưng cột Giá
> thì vẫn khác nhau. Đó là manh mối: dữ liệu thật không đổi, chỉ state phía frontend bị gán sai.
> Test của em chứng minh bằng hai assertion: UI đếm được 6 dòng cùng tên, còn API chỉ trả về 1 bản ghi đổi tên.
> Ghép hai lại mới kết luận được đây là bug **frontend**, không phải backend."

---

## PHẦN 7 — MỘT LỖI AI TÔI ĐÃ TỰ SỬA (6:50–7:50) — **BẮT BUỘC**

**Thao tác:** mở `report/02-AI-GAP-ANALYSIS.md`, chỉ vào GAP-00. Sau đó mở `pages/ForgotPasswordPage.js` dòng ~30.

**Lời nói:**
> "Phần này em muốn nói thẳng về chỗ AI làm sai.
>
> AI sinh Page Object cho trang quên mật khẩu, và nó viết trong comment rằng: *Playwright không gán role
> `textbox` cho `input[type=password]`, nên ở bước 2 `getByRole('textbox')` vẫn trỏ đúng ô OTP.*
> Comment nghe rất chắc chắn, đọc qua thì tin ngay.
>
> Nhưng đó là **sai**. Playwright **có** gán role textbox cho ô password. Chạy thật thì chín trên ba mươi test
> FR-03 fail với lỗi `strict mode violation: getByRole('textbox') resolved to 2 elements`.
>
> Em sửa thành `.first()` — vì ô OTP đứng trước ô mật khẩu trong DOM — và viết lại comment ghi rõ
> đây là kết luận **từ run thật**, không phải giả định."

**Thao tác:** chỉ vào GAP-01 trong file gap analysis.

> "Còn một lỗi nữa đáng nói. Đề yêu cầu tối thiểu ba assertion pattern mỗi test. AI đối phó bằng cách
> nhét thêm dòng `expect(c.expect.minRows).toBe(SEED_PRODUCT_COUNT)` — so một hằng số với một hằng số,
> chẳng chạm tới hệ thống. Test vẫn xanh, rubric vẫn tính đủ pattern, mà không kiểm thử gì cả.
> Em thay bằng assertion thật: số dòng hiển thị trên UI phải khớp số sản phẩm mà API trả về.
>
> Tổng cộng em ghi nhận **7 điểm yếu** của AI trong file này, sửa 5 cái trong code. Bài học của em là:
> AI diễn đạt phỏng đoán bằng đúng giọng điệu của sự thật — nên đọc code không đủ, phải chạy thật."

---

## PHẦN 8 — Kết (7:50–8:10)

> "Tóm lại: 80 test case, chạy trên ba trình duyệt thành 240 lần chạy, phát hiện 27 bug trong đó 9 bug
> mức Critical. Ảnh minh chứng đều do script Playwright chụp thật, kèm log response nguyên văn.
> Toàn bộ quá trình làm việc với AI được ghi trong AI_Log với 11 entry.
> Em cảm ơn thầy/cô đã xem."

---

## ✅ Checklist trước khi bấm Upload

- [ ] Video ≥ 5 phút
- [ ] Có `whoami && hostname` hiện rõ **hoặc** face-cam
- [ ] Giọng nói tiếng Việt **thật**, không TTS
- [ ] Có chạy test **live**, không phải video quay sẵn tua lại
- [ ] Có mở HTML report và chỉ rõ banner `Run by: 23127060`
- [ ] Có nói về **ít nhất 1 lỗi AI mình đã tự sửa** (Phần 7)
- [ ] Mọi con số đọc trong video **khớp** với màn hình
- [ ] Upload YouTube ở chế độ **Unlisted**, dán link vào `README.md`
