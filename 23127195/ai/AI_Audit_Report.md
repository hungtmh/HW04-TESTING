# AI Audit Report — HW04 Automation Testing

**Sinh viên:** 23127195
**Ngày:** 2026-08-15
**Múi giờ:** UTC+7 (giờ ghi bên dưới là giờ local; các mốc ISO trong HTML report là UTC)

> **Declaration:** *I use AI tools for the following tasks.*

## Công cụ AI đã sử dụng

| Công cụ | Phiên bản / Model | Mục đích |
|---|---|---|
| Claude Code (CLI trong VS Code) | Claude Opus 5 (`claude-opus-5`) | Đọc đề, khảo sát SUT, sinh khung Playwright, sinh spec, phân tích lỗi, soạn tài liệu |

Không sử dụng ChatGPT, Gemini, Copilot hay Cursor trong bài này.

## Công cụ không phải AI

Playwright 1.62.1, Node.js 22.20.0, Git, SQLite (qua `sqlite3` của SUT).

---

## Nhật ký tương tác

> Cột "AI output" ghi tóm tắt kết quả và **tên artifact** sinh ra; toàn văn mã
> nguồn nằm trong repository, đây là bản ghi quá trình chứ không phải bản sao mã.

---

### #1 — 11:32 | Đọc và bóc tách yêu cầu đề bài

**Prompt:**
> "đọc file 2026.HW04.Automation .pdf cho tôi đế nắm hết những yêu cầu, nắm kỹ cấu trúc nộp bài đi"

**AI output:** Tóm tắt 17 mục của đề: ngưỡng ≥12 test case/feature, dữ liệu phải
tách file `.csv`/`.json`, ≥3 assertion pattern, ≥3 browser (≥9 run), HTML report
phải hiện `Run by: {StudentID}` + ISO timestamp, video ≥5 phút tiếng Việt, ≥8
commit chạm file `.spec.js`, và danh sách 9 mục bắt buộc trong file `.zip`.

**Human review:** Đối chiếu lại với PDF, xác nhận đúng. Ghi nhận hai điểm dễ mất
điểm: báo cáo phải có **cả `.md` lẫn `.pdf`**, và `Run by:` phải nhúng vào report
trước khi chạy chứ không thêm được sau.

---

### #2 — 11:38 | Gộp SUT vào repository chính

**Prompt:**
> "HW04-TESTING đang là github chính của tôi, còn eshop-sut là tui git clone 1 dự án về, làm sao để git add . hay gì đó để đẩy cả dự án eshop-sut lên github chính của tôi"

**AI output:** Chẩn đoán `eshop-sut` có `.git` riêng nên Git ghi nó thành gitlink
(`mode 160000`) thay vì ghi file. Đề xuất: di chuyển `.git` của SUT ra ngoài repo
(backup, không xoá), `git rm --cached -f eshop-sut`, tạo `.gitignore` giữ lại
`playwright-report/`, rồi commit + push. Kết quả: commit `756fa65`, 67 file.

**Human review:** Chấp nhận. Yêu cầu backup thay vì xoá `.git` — đã làm đúng
(`_eshop-sut_git_backup`). Kiểm tra lại `.gitignore` để chắc chắn không loại nhầm
`playwright-report/`, vì đề bắt buộc HTML report phải nằm trong repo public.

---

### #3 — 11:45 | Khai báo feature và giao việc FR-01

**Prompt:**
> "Đây là các feature từ hw02 của tôi: FR-01 — ĐĂNG KÝ TÀI KHOẢN, FR-09 — MÃ GIẢM GIÁ, FR-14 — QUẢN LÝ DANH MỤC […] bạn hãy làm cho tôi trước đầy đủ Feature 01 […] nhớ là phải chạy dự án eshop-sut […] và tạo thư mục 23127195 để viết báo cáo theo yêu cầu"

**AI output:** Lập kế hoạch 7 bước: cài & chạy SUT → khảo sát DOM → dựng config
Playwright → viết data + spec → chạy 3 browser → viết báo cáo → commit.

**Human review:** Đồng ý thứ tự. Nhấn mạnh bước "khảo sát DOM trước khi viết
spec" — đây chính là bước về sau ngăn được lỗi selector.

---

### #4 — 11:47 | Cài đặt và khởi chạy SUT

**Prompt:** (nội bộ, do AI tự thực hiện theo yêu cầu #3)
> Đọc `setup_guide.md`, cài dependencies backend + frontend-web, seed DB, khởi chạy 2 server.

**AI output:** `npm install` cho `eshop-sut/backend` (135 gói) và
`eshop-sut/frontend-web` (225 gói); `node database.js` → *"Database initialized and
seeded (Phase 2)"*; backend `:3000` OK; Vite `:5173` OK.

**Human review:** Phát hiện Vite bind vào **IPv6 `::1`**, nên `127.0.0.1:5173`
không kết nối được — cần dùng `localhost`. Ghi nhận để tránh nhầm lẫn khi cấu hình
`webServer`.

---

### #5 — 11:50 | Khảo sát DOM thật của trang đăng ký

**Prompt:**
> "Viết một script probe để kiểm tra: `getByLabel` có hoạt động không, cấu trúc input ra sao, và hành vi thực tế khi nhập `Password123!`, `Password 123`, email `abc`, email trùng."

**AI output (trích nguyên văn kết quả chạy):**
```
getByLabel("Họ Tên") -> count=0
getByLabel("Email") -> count=0
getByLabel("Mật khẩu") -> count=0
container("Họ Tên") -> count=1, type=text
[spec-valid pwd] error: Mật khẩu quá yếu! ... KÝ TỰ ĐẶC BIỆT.
[space pwd] url: http://localhost:5173/login
[duplicate email] url: http://localhost:5173/login
[bad email] url: http://localhost:5173/login
```

**Human review:** Đây là bước quyết định chất lượng cả bài. Kết quả bác bỏ giả định
mặc định của AI (`getByLabel`) và đồng thời lộ ra 3 lỗi ứng viên của SUT. Quyết định:
dùng selector neo theo `<div>` bọc label; đặt kỳ vọng test theo **đặc tả**, không theo
hành vi đang có.

---

### #6 — 11:52 | Dựng khung Playwright

**Prompt:**
> "Tạo `playwright.config.js` với 3 project chromium/firefox/webkit, HTML report hiện `Run by: 23127195` kèm ISO timestamp, và `webServer` tự khởi động SUT."

**AI output:** `playwright.config.js` với `reporter: [['html', { title: 'HW04 … Run by: 23127195 | <ISO>' }]]`, `metadata`, `webServer` cho cả `:3000` và `:5173`.

**Human review:** AI ban đầu gắn thêm `module.exports.STUDENT_ID = …` vào chính
đối tượng config — sẽ nhét key lạ vào schema của Playwright. Đã tách sang
`tests/utils/env.js`.

---

### #7 — 11:55 | Sinh data file và spec

**Prompt:**
> "Viết data file CSV cho ma trận mật khẩu và JSON cho các nhóm còn lại; spec phải ≥12 test case, ≥3 assertion pattern, không hardcode dữ liệu."

**AI output:** `tests/data/fr01-password-rules.csv` (10 dòng),
`tests/data/fr01-register-cases.json`, `tests/utils/csv.js`,
`tests/pages/RegisterPage.js`, `tests/fr01-register.spec.js` (27 test case, 6
assertion pattern P1–P6).

**Human review:** Bản nháp đầu có 2 dòng CSV trùng nội dung (TC-06 và TC-10 cùng
`Password abc`) — đã đổi TC-10 thành `Password123` để bổ sung bằng chứng cho BUG-01.

---

### #8 — 11:59 | Chạy thử lần 1 trên Chromium → phát hiện PASS GIẢ

**Prompt:**
> "Chạy thử trên Chromium trước để bắt lỗi script sớm."

**AI output:** `23 passed, 4 failed`. Bốn test fail đều gắn `@bug`.

**Human review — phát hiện quan trọng nhất của bài:** TC-18 → TC-21 (email sai
định dạng) **PASS**, mâu thuẫn trực tiếp với kết quả probe ở #5 (email `abc` được
chấp nhận). Truy nguyên: assertion `expect(page).toHaveURL(/\/register$/)` khớp
**tức thì** vì SPA chưa resolve xong `POST /api/register`. Bộ test đang **che
giấu** BUG-02. Yêu cầu AI thay bằng assertion hỏi thẳng backend số dòng `users`.

---

### #9 — 12:00 | Sửa assertion → lỗi thật lộ ra

**Prompt:**
> "Thay assertion racy bằng kiểm chứng tất định qua `GET /api/admin/users`; đảo thứ tự assertion ở nhóm 1 để chờ banner lỗi trước."

**AI output:** Thêm `countAccountsByEmail()`; kết quả đổi thành `19 passed, 8 failed`
— 4 test email chuyển từ xanh giả sang **đỏ thật**.

**Human review:** Xác nhận đây mới là kết quả phản ánh đúng chất lượng SUT.

---

### #10 — 12:02 | Chạy 3 browser → lộ flake chỉ trên WebKit

**AI output:** Chromium 19/8, Firefox 19/8, **WebKit 18/9**. Test dôi ra là TC-24
(SQL injection payload) với lỗi `expect(res.ok()).toBeTruthy()` — đăng nhập thất bại.

**Human review:** Xác định đây là lỗi **của bộ test**, không phải của SUT: spec gọi
`POST /api/login` ngay sau `register()` mà không chờ request của trang hoàn tất.
TC-23 vô tình che được vì có thêm `page.evaluate()` tạo độ trễ; TC-24 không có nên
đua thẳng, và WebKit chậm hơn nên lộ. Đã thêm `await expect(page).toHaveURL(/\/login$/)`
trước khi gọi API → 3 engine đồng nhất 19/8.

---

### #11 — 12:06 | Phát hiện assertion đỏ vì SAI LÝ DO

**Prompt:**
> "Kiểm tra thông báo lỗi của từng test fail xem có đúng bản chất không."

**AI output:** 5/8 test fail với message *"admin login must succeed to inspect user
rows"* — tức chúng đỏ vì helper hỏng, **không phải** vì BUG-02/BUG-03.

Truy nguyên: `setup_guide.md` ghi mật khẩu admin là `admin123`, trong khi
`database.js:92` seed `Admin123!`. Do FR-02 cộng `login_attempts + 2` với ngưỡng
khoá 3, chỉ 2 lần thử sai đã khoá tài khoản admin 180 giây, và trong lúc khoá thì
mật khẩu đúng cũng bị từ chối.

**Human review:** Đây là bài học đắt giá — **một test đỏ chưa chắc đã đỏ vì lý do
mình nghĩ**. Nếu không đọc message mà chỉ nhìn con số 19/8 (trùng khớp với lần chạy
trước) thì đã kết luận sai hoàn toàn về BUG-02 và BUG-03. Sửa mật khẩu theo
**seed script (source of truth)** thay vì theo tài liệu, thêm cache token để giảm
số lần đăng nhập, reseed DB, chạy lại và **đọc lại từng message** để xác nhận.

---

### #12 — 12:08 | Chạy lại sau khi sửa → xác nhận nguyên nhân đúng

**AI output:** Chromium/Firefox/WebKit đều `19 passed, 8 failed`. Message của từng
test fail giờ khớp đúng defect:
```
[TC-18] email "abc" must not create a user row — Expected: 0
[TC-22] a duplicate e-mail must not create a second account — Expected: 1
[TC-26] expect(received).not.toBe("Password 123")
[TC-02] toHaveURL /\/login$/ — Received "http://localhost:5173/register"
```

**Human review:** Đã đối chiếu từng dòng. Chấp nhận kết quả.

---

### #13 — 12:11 | Sinh bằng chứng và tài liệu

**Prompt:**
> "Viết script chụp ảnh bằng chứng cho từng bug, kiểm chứng report có `Run by:`, rồi soạn báo cáo chính, bug report, AI audit, AI critique, README."

**AI output:** `scripts/verify-report-banner.mjs` (3 ảnh report, đều xác nhận
`runBy=true` + ISO), `scripts/capture-bug-evidence.mjs` (4 ảnh bug),
`23127195/report/HW04_Main_Report.md`, `23127195/bug-report/BUG_REPORT.md`, tài
liệu này, `AI_Critique.md`, `README.md`.

**Human review:** Kiểm tra ảnh chụp report thấy tiêu đề
*"HW04 EShop Automation - FR-01 | Run by: 23127195 | 2026-08-15T05:08:39.944Z"* —
đạt yêu cầu chống gian lận của đề. Kiểm chứng thêm BUG-05 bằng tay: token
`role='user'` đọc được 52 dòng từ `/api/admin/users`.

---

## Tổng kết mức độ can thiệp của con người

| Hạng mục | Số lượng |
|---|---|
| Lỗi trong sản phẩm do AI sinh, được người phát hiện và sửa | **8** (R-01 → R-08) |
| Trong đó lỗi khiến test **xanh giả** (nguy hiểm nhất) | **2** (R-03, R-07) |
| Trong đó lỗi chỉ lộ khi chạy đa trình duyệt | **1** (R-05) |
| Trong đó lỗi khiến test **đỏ vì sai lý do** | **1** (R-08) |
| Quyết định thiết kế do người đưa ra, không phải AI | Đặt kỳ vọng theo đặc tả thay vì theo code; chấp nhận 8 test đỏ thay vì nới cho xanh |

**Cam kết:** Tôi đã đọc, kiểm chứng và chịu trách nhiệm hoàn toàn về mã nguồn và
kết quả trong bài nộp này.
