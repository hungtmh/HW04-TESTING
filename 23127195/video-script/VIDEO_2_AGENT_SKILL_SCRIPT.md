# Kịch bản Video 2 — Demo Agent Skill (Mục 7, 10 điểm)

| | |
|---|---|
| **Yêu cầu đề** | Nộp skill **kèm video** cho thấy **end-to-end** cách bạn dùng skill trên **một feature hoàn chỉnh** |
| **Skill** | `.claude/skills/eshop-automation/SKILL.md` |
| **Feature demo** | **FR-05 — Product listing and search** *(feature MỚI, chưa từng tự động hoá)* |
| **Thời lượng mục tiêu** | 6–7 phút |

> **Vì sao chọn FR-05 mà không phải 3 feature đã làm?**
> Đề bài nói skill phải *"reusable on additional features"*. Dùng skill trên một
> feature **chưa từng đụng tới** mới chứng minh được tính tái sử dụng — nếu demo
> lại FR-09 thì người xem không phân biệt được skill có tác dụng gì hay chỉ đang
> chạy lại thứ có sẵn.

> **🎁 Điểm ăn tiền của video này:** FR-05 render từ khoá tìm kiếm bằng
> `dangerouslySetInnerHTML`, nên **có lỗ hổng XSS thật**. Em đã kiểm chứng:
> payload `<img src=x onerror="window.__xss=1">` **thực thi được**. Skill sẽ phát
> hiện lỗi này **ngay trên video** ở bước probe — rất thuyết phục.

---

## ⚙️ CHUẨN BỊ TRƯỚC KHI BẤM REC

```powershell
cd D:\Kiem_thu\HW4\HW04-TESTING
node eshop-sut/backend/database.js
```

Hai terminal chạy nền: `node server.js` (backend) và `npm run dev` (frontend-web).

**Kiểm tra:**

- [ ] `http://localhost:5173` lên được
- [ ] **Chưa có** file `tests/fr05-search.spec.js` (để demo từ số 0 cho thật)
- [ ] Mở sẵn: Claude Code trong VS Code, terminal, Chrome
- [ ] Phóng to cỡ chữ, tắt thông báo

---

## 🎬 PHÂN CẢNH

### [0:00 – 0:45] Mở đầu + xác thực

**Màn hình:** Terminal

```powershell
whoami
hostname
```

**Lời thoại:**

> "Xin chào thầy cô. Em là Trần Minh Hùng, MSSV 23127195. Đây là video thứ hai
> của bài HW04, demo phần Agent Skill.
>
> Ở video trước em đã trình bày bộ test cho ba feature. Video này em sẽ chứng minh
> rằng em không chỉ viết test một lần rồi thôi, mà đã **đóng gói toàn bộ quy trình
> đó thành một Agent Skill tái sử dụng được** — và em sẽ dùng nó ngay bây giờ để
> tự động hoá **một feature hoàn toàn mới** là FR-05, tìm kiếm sản phẩm."

---

### [0:45 – 2:00] Giới thiệu skill và lý do từng bước tồn tại

**Màn hình:** VS Code mở `.claude/skills/eshop-automation/SKILL.md`

**Lời thoại:**

> "Đây là file skill. Điểm quan trọng em muốn nhấn mạnh: **skill này không phải
> lý thuyết chép từ tài liệu**, mà là kết tinh từ những lỗi em đã thực sự mắc
> phải khi làm ba feature trước. Mỗi quy tắc trong đây tương ứng với một lần em
> phải debug mất công."

*(Cuộn tới bước 1 và 2)*

> "Bước 1: **đọc đặc tả trước khi đọc code**. Vì nếu đưa mã nguồn cho AI trước,
> nó sẽ viết test khớp với hành vi hiện tại — loại test đó luôn xanh và không bao
> giờ tìm ra lỗi, nó biến bug thành đặc tả.
>
> Bước 2: **probe DOM thật, tuyệt đối không đoán**. Trong hệ thống này
> `getByLabel` không bao giờ hoạt động vì các thẻ label không gắn thuộc tính
> `htmlFor`. Riêng lỗi này em đã mắc hai lần — một lần ở trang đăng ký, một lần
> ở trang admin."

*(Cuộn tới bước 4 và 7)*

> "Bước 4 ghi rõ quy tắc quan trọng nhất: **không bao giờ chứng minh 'không xảy
> ra' bằng cách kiểm tra URL chưa đổi** — vì nó luôn khớp ngay lập tức.
>
> Bước 7: **con số không phải bằng chứng**. Đã có lần năm test báo đỏ nhưng vì lý
> do hoàn toàn khác với lỗi chúng nhắm tới, trong khi tổng số pass/fail trông vẫn
> y như kỳ vọng."

*(Cuộn xuống bảng "SUT facts")*

> "Cuối file là bảng những sự thật về hệ thống mà em đã tốn công phát hiện: mật
> khẩu admin thật là `Admin123!` chứ không phải như tài liệu ghi, cơ chế khoá tài
> khoản chỉ sau hai lần sai, Vite chỉ bind IPv6... Lần sau ai dùng skill này sẽ
> không phải mò lại."

---

### [2:00 – 2:45] Gọi skill trên feature mới

**Màn hình:** Claude Code trong VS Code

**Gõ prompt:**

```
Dùng skill eshop-automation để tự động hoá FR-05 — Product listing and search.
Làm đúng quy trình trong skill: probe DOM thật trước, dữ liệu để ngoài file,
assertion không race, rồi chạy 3 browser.
```

**Lời thoại:**

> "Bây giờ em gọi skill. Em không mô tả lại quy trình — chỉ cần nêu tên skill và
> tên feature, vì toàn bộ hướng dẫn đã nằm trong file skill rồi."

*(Chờ Claude Code nạp skill)*

> "Các bạn thấy skill `eshop-automation` đã được nạp. Từ giờ nó sẽ làm theo đúng
> tám bước trong đó."

---

### [2:45 – 3:45] ⭐ Bước probe phát hiện lỗ hổng XSS

**Màn hình:** Claude Code đang viết và chạy script probe

**Lời thoại:**

> "Đúng như skill quy định, việc đầu tiên nó làm **không phải là viết test**, mà
> là viết một đoạn script tạm để dò xem trang tìm kiếm thực sự có gì: ô input tên
> gì, nút bấm ra sao, và hệ thống phản ứng thế nào với các đầu vào đặc biệt."

*(Khi kết quả probe hiện ra)*

> "Và đây là lý do bước probe đáng giá. Nhìn kết quả: từ khoá tìm kiếm được render
> bằng `dangerouslySetInnerHTML`, nên khi em nhập một payload XSS thì **đoạn mã
> đó thực thi thật** — biến `window.__xss` được gán giá trị 1.
>
> Đây là lỗ hổng Cross-Site Scripting thật sự. Nếu làm theo cách thông thường là
> viết test ngay từ mô tả feature, em sẽ chỉ kiểm tra 'tìm kiếm có ra kết quả
> không' và **bỏ sót hoàn toàn** lỗi này."

*(Mở Chrome, làm lại bằng tay để chứng minh)*

> "Em kiểm chứng lại bằng tay cho chắc chắn."

---

### [3:45 – 4:45] Skill sinh data file và spec

**Màn hình:** Claude Code tạo `tests/data/fr05-*.csv|json` và `tests/fr05-search.spec.js`

**Lời thoại:**

> "Sau khi đã biết chắc hệ thống hoạt động thế nào, nó mới sinh test. Theo đúng
> bước 3 của skill, toàn bộ dữ liệu được đưa ra file CSV và JSON riêng — đề bài
> cấm viết cứng dữ liệu trong file spec."

*(Mở file spec vừa sinh)*

> "Và trong spec, các assertion đều gắn nhãn P1 đến P6 để dễ đối chiếu. Chú ý test
> kiểm tra XSS: nó không kiểm tra qua URL mà kiểm tra trực tiếp xem đoạn mã có
> được thực thi hay không — đúng nguyên tắc 'assertion không race' ở bước 4."

---

### [4:45 – 6:15] Chạy 3 trình duyệt và xem báo cáo

**Màn hình:** Terminal

```powershell
node scripts/run-multibrowser.mjs tests/fr05-search.spec.js
```

**Lời thoại:**

> "Bước 6 của skill: chạy trên cả ba engine, mỗi engine một báo cáo HTML riêng."

*(Trong lúc chờ)*

> "Toàn bộ quá trình từ lúc em gõ một câu prompt tới lúc có bộ test hoàn chỉnh chạy
> đa trình duyệt mất khoảng vài phút. Nếu không có skill, em sẽ phải mô tả lại từ
> đầu tất cả các quy tắc kia — và nhiều khả năng lại mắc đúng những lỗi cũ, vì
> chính em đã mắc lỗi selector hai lần trên hai màn hình khác nhau."

*(Khi xong, mở report)*

```powershell
npx playwright show-report playwright-report/fr05-search-chromium
```

> "Báo cáo có đầy đủ dòng **Run by 23127195** kèm timestamp, giống hệt ba feature
> trước — vì cấu hình đó đã nằm sẵn trong dự án và skill biết cách dùng."

---

### [6:15 – 7:00] Kết

**Lời thoại:**

> "Tóm lại: skill này biến quy trình em rút ra sau ba feature thành thứ dùng lại
> được cho feature thứ tư mà không phải nhớ lại gì. Nó không chỉ ghi *phải làm
> gì*, mà quan trọng hơn là ghi **vì sao** — mỗi quy tắc gắn với một lỗi thật em
> đã mắc.
>
> Và như thầy cô vừa thấy, ngay trong lần dùng đầu tiên trên một feature mới, nó
> đã giúp em phát hiện thêm một lỗ hổng XSS.
>
> Em xin cảm ơn thầy cô đã theo dõi."

---

## ✅ CHECKLIST SAU KHI QUAY

- [ ] Thấy rõ skill được **nạp và sử dụng** (không phải chỉ đọc file)
- [ ] Thấy đủ chu trình: probe → data file → spec → chạy 3 browser → report
- [ ] Có cảnh phát hiện lỗi XSS
- [ ] Có `whoami` + `hostname`
- [ ] Upload YouTube **Unlisted**
- [ ] Dán link vào `23127195/README.md`
- [ ] **Nếu FR-05 sinh ra bug mới → tạo GitHub Issue cho nó** (BUG-16 XSS)

---

## 🔧 PHƯƠNG ÁN DỰ PHÒNG

Nếu lúc quay Claude Code gặp trục trặc, có thể chuyển sang phương án an toàn hơn:
quay lại quá trình dùng skill trên **FR-14** (feature đã làm), vừa chạy vừa đối
chiếu từng bước với file `SKILL.md`. Video vẫn hợp lệ vì đề chỉ yêu cầu *"shows
how you used the skill on a complete feature"* — nhưng sức thuyết phục kém hơn
hẳn so với việc làm trên feature mới.
