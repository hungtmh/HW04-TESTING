# Kịch bản Video 1 — Demo bộ automation (Task 2, 15 điểm)

| | |
|---|---|
| **Yêu cầu đề** | YouTube **unlisted**, **≥ 5 phút**, thuyết minh **tiếng Việt** |
| **Bắt buộc có** | 1 script chạy end-to-end + multi-browser run + HTML report |
| **Bắt buộc có** | Kể **ít nhất 1 lỗi bạn đã sửa** trong script do AI sinh |
| **Chứng minh tác giả** | Face-cam **hoặc** terminal chạy `whoami` và `hostname` |
| **Feature demo** | **FR-09 — Mã giảm giá** (chạy ~2 phút, có bug ấn tượng nhất) |
| **Thời lượng mục tiêu** | 7–8 phút |

---

## ⚙️ CHUẨN BỊ TRƯỚC KHI BẤM REC

Chạy hết checklist này, **đừng bỏ bước nào** — hỏng giữa chừng là phải quay lại.

```powershell
cd D:\Kiem_thu\HW4\HW04-TESTING

# 1. Reset database về trạng thái sạch
node eshop-sut/backend/database.js

# 2. Terminal 1 — Backend
cd D:\Kiem_thu\HW4\HW04-TESTING\eshop-sut\backend
node server.js

# 3. Terminal 2 — Frontend web
cd D:\Kiem_thu\HW4\HW04-TESTING\eshop-sut\frontend-web
npm run dev
```

**Kiểm tra trước khi quay:**

- [ ] Mở `http://localhost:5173` thấy trang chủ EShop
- [ ] Xoá thư mục `test-results` cũ cho gọn
- [ ] Mở sẵn 4 tab/cửa sổ, sắp thứ tự để chuyển cho mượt:
  - **Terminal 3** (cửa sổ sẽ quay chính) — đang ở `D:\Kiem_thu\HW4\HW04-TESTING`
  - **VS Code** mở sẵn `tests/fr09-coupon.spec.js`
  - **Chrome tab 1**: `http://localhost:5173/checkout`
  - **Chrome tab 2**: https://github.com/hungtmh/HW04-TESTING/issues
- [ ] Phóng to cỡ chữ terminal & VS Code (Ctrl + `+`) — video nén xuống sẽ mờ
- [ ] Tắt thông báo Windows (Focus Assist), tắt Zalo/Messenger
- [ ] Test mic: nói thử 10 giây rồi nghe lại

---

## 🎬 PHÂN CẢNH

### [0:00 – 0:40] Mở đầu + chứng minh tác giả ⚠️ BẮT BUỘC

**Màn hình:** Terminal 3, gõ chậm rãi:

```powershell
whoami
hostname
date
```

**Lời thoại:**

> "Xin chào thầy cô và các bạn. Em là Trần Minh Hùng, mã số sinh viên 23127195.
> Đây là bài nộp HW04 môn Kiểm thử phần mềm, phần Automation Testing.
>
> Đầu tiên em xin xác thực danh tính bằng lệnh `whoami` và `hostname` trên máy
> của em, đúng theo yêu cầu của đề bài."

*(Dừng 2 giây cho thấy rõ output rồi mới nói tiếp)*

> "Trong video này em sẽ demo bộ test tự động cho feature FR-09 — Mã giảm giá,
> chạy trên ba trình duyệt, xem báo cáo HTML, và quan trọng nhất là kể lại một
> lỗi mà em đã phát hiện và sửa trong đoạn script do AI sinh ra."

---

### [0:40 – 1:40] Giới thiệu hệ thống và bộ test

**Màn hình:** VS Code, mở cây thư mục `tests/`

**Lời thoại:**

> "Hệ thống được kiểm thử là EShop, một website thương mại điện tử demo, gồm ba
> phần: backend API chạy ở cổng 3000, giao diện người dùng ở cổng 5173, và trang
> quản trị ở cổng 5174.
>
> Em chọn ba feature từ HW02: FR-01 đăng ký tài khoản, FR-09 mã giảm giá, và
> FR-14 quản lý danh mục. Tổng cộng 62 test case, chạy trên ba engine trình duyệt
> khác nhau là Chromium, Firefox và WebKit — tức 186 lượt chạy và 9 browser run."

**Màn hình:** click mở lần lượt `tests/data/fr09-coupon-calculations.csv`

> "Đề bài yêu cầu bộ test phải data-driven, nghĩa là dữ liệu test phải nằm ở file
> riêng chứ không được viết cứng trong code. Đây là file CSV chứa ma trận mười
> trường hợp tính giảm giá: mã, loại mã, tổng tiền, số tiền giảm mong đợi, và
> thành tiền mong đợi."

*(Trỏ chuột vào dòng TC-01)*

> "Ví dụ dòng đầu: mã SAVE10 giảm 10% trên đơn 500 nghìn, thì phải giảm 50 nghìn
> và còn phải trả 450 nghìn. Đây là con số **theo đặc tả**, không phải theo cách
> hệ thống đang chạy — điểm này rất quan trọng, lát nữa em sẽ quay lại."

---

### [1:40 – 2:40] Xem cấu trúc test và các assertion pattern

**Màn hình:** VS Code, `tests/fr09-coupon.spec.js`, cuộn từ đầu file

**Lời thoại:**

> "Đây là file spec của FR-09, gồm 18 test case chia làm 7 nhóm. Ở đầu file em
> ghi rõ sáu kiểu assertion đã dùng, đề bài chỉ yêu cầu tối thiểu ba."

*(Cuộn chậm qua phần comment P1–P6)*

> "P1 là kiểm tra điều hướng, P2 kiểm tra phần tử và văn bản hiển thị, P3 kiểm
> tra giá trị số, P4 gọi thẳng API backend để đối chiếu, P5 đếm phần tử, và P6
> kiểm tra các bất biến — tức những điều kiện luôn phải đúng với mọi mã giảm giá."

*(Cuộn tới nhóm 1, dòng ~55)*

> "Nhóm một đọc file CSV rồi sinh test bằng vòng lặp. Mỗi dòng CSV thành một test
> case, nên muốn thêm trường hợp kiểm thử thì chỉ cần thêm dòng vào CSV, không
> phải sửa code."

*(Trỏ vào chỗ có `@bug`)*

> "Những test có nhãn `@bug` là các test em **cố ý để fail**. Chúng kiểm tra theo
> đúng đặc tả, còn hệ thống thì đang làm sai — mỗi test đỏ ứng với một lỗi thật
> mà em đã ghi vào bug report và đăng lên GitHub Issues."

---

### [2:40 – 4:50] Chạy thật trên 3 trình duyệt ⚠️ BẮT BUỘC

**Màn hình:** Terminal 3

```powershell
node scripts/run-multibrowser.mjs tests/fr09-coupon.spec.js
```

**Lời thoại (nói trong lúc chờ, khoảng 2 phút):**

> "Bây giờ em chạy lệnh này. Script sẽ chạy lần lượt file spec trên Chromium,
> rồi Firefox, rồi WebKit, mỗi engine sinh ra một báo cáo HTML riêng biệt.
>
> Em phải viết script riêng thay vì chạy `npx playwright test` thẳng, vì nếu chạy
> mặc định thì Playwright gộp kết quả cả ba trình duyệt vào một báo cáo duy nhất.
> Đề bài yêu cầu **mỗi browser run phải có một HTML report riêng**, nên script này
> đặt biến môi trường khác nhau cho mỗi lần chạy để tách thư mục báo cáo ra."

*(Khi Chromium chạy xong)*

> "Chromium xong: 12 test pass, 6 test fail. Sáu test fail này chính là các test
> `@bug` em vừa nói."

*(Trong lúc Firefox chạy)*

> "Đây là ba engine khác nhau về bản chất chứ không phải ba vỏ bọc của cùng một
> engine: Chromium dùng nhân Blink, Firefox dùng Gecko, còn WebKit là nhân của
> Safari. Playwright tải sẵn cả ba về máy, khoảng 500 megabyte, và điều khiển
> chúng qua giao thức WebSocket — tức là trình duyệt thật, không phải giả lập."

*(Khi bảng tổng kết hiện ra)*

> "Kết quả: cả ba engine đều cho đúng 12 pass, 6 fail. Sự đồng nhất này quan
> trọng, vì nó chứng tỏ bộ test không bị flaky — không có test nào lúc xanh lúc
> đỏ tuỳ trình duyệt."

---

### [4:50 – 6:00] Mở HTML report ⚠️ BẮT BUỘC

**Màn hình:** Terminal

```powershell
npx playwright show-report playwright-report/fr09-coupon-chromium
```

**Lời thoại:**

> "Em mở báo cáo HTML của lần chạy Chromium."

*(Trình duyệt mở ra — trỏ chuột vào **tiêu đề trang**, dừng lại 3 giây)*

> "Xin thầy cô chú ý dòng tiêu đề: **HW04 EShop Automation, Run by 23127195**,
> kèm theo dấu thời gian ISO của đúng lần chạy vừa rồi. Đây là yêu cầu chống gian
> lận của đề bài — mã số sinh viên và timestamp được nhúng vào báo cáo ngay lúc
> chạy, không thể thêm vào sau."

*(Click vào test TC-01 bị fail)*

> "Em click vào test TC-01 đang fail. Thông báo lỗi ghi rõ: kỳ vọng số tiền giảm
> là 50 nghìn, nhưng thực tế nhận được âm 4 triệu 500 nghìn."

*(Click "View Trace")*

> "Playwright còn lưu lại trace — em có thể tua lại từng thao tác: điền form,
> bấm nút, và xem đúng trạng thái trang web tại thời điểm đó."

---

### [6:00 – 6:50] Chứng minh bug là thật, không phải test sai

**Màn hình:** Chrome tab 1 → `http://localhost:5173/checkout`

**Lời thoại:**

> "Để chứng minh đây là lỗi thật của hệ thống chứ không phải test em viết sai,
> em làm lại bằng tay trên giao diện."

*(Thao tác: điền Tổng tiền = `500000`, nhập mã `SAVE10`, bấm Áp dụng)*

> "Em đặt tổng tiền 500 nghìn, nhập mã SAVE10 là mã giảm 10 phần trăm, rồi bấm
> Áp dụng."

*(Dừng lại, trỏ vào kết quả)*

> "Kết quả: giao diện hiện dấu tích xanh, ghi 'Áp dụng thành công, giảm 10%'.
> Nhưng nhìn xuống dưới: **Tiết kiệm âm 4 triệu 500 nghìn**, và **Thành tiền 5
> triệu đồng**. Đơn hàng 500 nghìn mà khách phải trả 5 triệu — **gấp 10 lần**.
>
> Nguyên nhân nằm ở backend: công thức viết là tổng tiền nhân với một trừ giá trị
> giảm giá. Với mã 10 phần trăm thì thành 1 trừ 10 bằng âm 9, nên số tiền giảm
> thành số âm. Mà thành tiền bằng tổng trừ đi số giảm, trừ một số âm thì thành
> cộng. Công thức đúng phải là tổng tiền nhân phần trăm chia 100.
>
> Đây là lỗi nghiêm trọng nhất em tìm được trong cả bài, đã ghi thành Issue số 7."

---

### [6:50 – 8:00] ⚠️ BẮT BUỘC — Kể lỗi em đã sửa trong script do AI sinh

> **Đây là phần đề bài bắt buộc phải có. Nói kỹ, đừng vội.**

**Màn hình:** VS Code mở `tests/pages/RegisterPage.js`, cuộn tới phần comment R-03 (hoặc mở `tests/fr01-register.spec.js` dòng ~39)

**Lời thoại:**

> "Cuối cùng, em xin kể về một lỗi mà em đã phát hiện và sửa trong đoạn code do
> AI sinh ra. Đây là lỗi nguy hiểm nhất, vì nó không làm test đỏ — nó làm test
> **xanh giả**.
>
> Ban đầu, để chứng minh 'email sai định dạng thì không được tạo tài khoản', AI
> viết như thế này: sau khi bấm nút Đăng ký, kiểm tra xem địa chỉ URL có còn ở
> trang `/register` hay không. Nếu còn thì coi như hệ thống đã từ chối.
>
> Nghe rất hợp lý. Và bốn test đó **đều báo xanh**.
>
> Nhưng khi em chạy thử bằng tay thì thấy hệ thống thực tế **chấp nhận** email
> `abc` — tức là bốn test kia đáng lẽ phải đỏ.
>
> Em truy nguyên và hiểu ra: ứng dụng này là single-page application. Ngay sau
> khi bấm nút, request gửi lên server **chưa xử lý xong**, nên URL đương nhiên
> vẫn là `/register` — bất kể server quyết định gì. Câu lệnh kiểm tra khớp ngay
> lập tức và chuyển xanh, trước khi ứng dụng kịp quyết định bất cứ điều gì.
>
> Nói cách khác: **bộ test đã che giấu đúng cái lỗi mà nó được viết ra để tìm.**
>
> Cách em sửa là bỏ hẳn việc đoán qua URL, thay bằng hỏi thẳng cơ sở dữ liệu:
> 'còn bao nhiêu dòng người dùng mang email này?' Nếu hệ thống từ chối đúng thì
> phải là 0 dòng. Sau khi sửa, cả bốn test chuyển sang đỏ — và đó mới là kết quả
> phản ánh đúng chất lượng của hệ thống.
>
> Bài học em rút ra là: **một test xanh không chứng minh phần mềm đúng, nó có thể
> chỉ chứng minh câu lệnh kiểm tra đã đặt sai chỗ.**"

---

### [8:00 – 8:30] Kết

**Màn hình:** Chrome tab 2 → GitHub Issues

**Lời thoại:**

> "Tổng kết: em đã tự động hoá 3 feature với 62 test case, chạy 9 browser run,
> tìm ra 15 lỗi và đăng đầy đủ lên GitHub Issues, mỗi issue kèm ảnh chụp bằng
> chứng và các bước tái hiện.
>
> Em xin cảm ơn thầy cô đã theo dõi."

*(Cuộn danh sách issue một lượt rồi dừng)*

---

## ✅ CHECKLIST SAU KHI QUAY

- [ ] Video **≥ 5 phút**
- [ ] Có giọng nói **của chính bạn** xuyên suốt
- [ ] Có cảnh `whoami` + `hostname` **đọc được rõ**
- [ ] Có cảnh chạy **3 trình duyệt**
- [ ] Có cảnh HTML report hiện **"Run by: 23127195"** + ISO timestamp
- [ ] Có đoạn kể **lỗi đã sửa** trong script AI sinh
- [ ] Upload YouTube ở chế độ **Unlisted** (Không công khai)
- [ ] Dán link vào `23127195/README.md`
