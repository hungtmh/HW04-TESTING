# VIDEO 2 — KỊCH BẢN DEMO AGENT SKILL

- **Người quay:** Ninh Văn Khải — MSSV 23127060
- **Mục tiêu:** chứng minh `agent-skill/SKILL.md` **thật sự điều khiển** được AI agent end-to-end,
  chứ không phải một file tài liệu để trưng bày
- **Thời lượng gợi ý:** 4–6 phút
- **Upload:** YouTube **Unlisted** → dán link vào `README.md`

---

## Timeline

| Phần | Thời lượng | Nội dung |
|---|---|---|
| 1 | 0:00–0:30 | Giới thiệu: Agent Skill là gì và giải quyết vấn đề gì |
| 2 | 0:30–1:40 | Đi qua cấu trúc SKILL.md |
| 3 | 1:40–3:10 | **Chạy thật:** ra lệnh cho agent, xem nó tự đi theo skill |
| 4 | 3:10–4:20 | Cơ chế AI Log — vì sao bắt buộc |
| 5 | 4:20–5:20 | Skill chặn AI đi sai như thế nào |
| 6 | 5:20–5:40 | Kết |

---

## PHẦN 1 — Vấn đề cần giải (0:00–0:30)

**Lời nói:**
> "Em là Ninh Văn Khải, 23127060. Video này em demo Agent Skill.
>
> Vấn đề em gặp: nếu ra lệnh cho AI kiểu 'viết hết test cho ba feature đi', nó sẽ sinh ra một đống code
> trông rất ổn, chạy có thể pass, nhưng em không kiểm soát được nó dựa vào đâu, và em cũng không trả lời
> được ở buổi vấn đáp. Ngoài ra nhóm em ba người dùng chung một repo — AI rất dễ đọc nhầm hoặc ghi đè
> lên thư mục của bạn khác, mà theo đề thì trùng bài là **cả hai bên cùng bị không điểm**.
>
> SKILL.md sinh ra để giải hai vấn đề đó."

---

## PHẦN 2 — Cấu trúc SKILL.md (0:30–1:40)

**Thao tác:** mở `.claude/skills/eshop-automation-23127060/SKILL.md`, cuộn qua từng mục.

**Chỉ vào §0 — Luật bất biến:**
> "Mục đầu tiên là luật cứng. Agent **chỉ được** ghi trong `23127060/`, **chỉ được đọc** `eshop-sut/`,
> và **cấm hoàn toàn** hai thư mục của hai bạn còn lại. Đây là rào chắn chống trùng bài."

**Chỉ vào §2 — Kiến thức SUT đã xác minh:**
> "Mục này quan trọng nhất. Em không để agent tự đoán selector. Em bắt nó đọc JSX thật và ghi vào đây:
> ô nào ở dòng nào, endpoint nào có middleware, endpoint nào không. Nhờ vậy mọi expected result trong test
> đều dẫn nguồn được về một dòng code cụ thể."

**Chỉ vào §4 — Chuẩn kỹ thuật:**
> "Ràng buộc cứng: tối thiểu 12 test mỗi feature, dữ liệu phải nằm ngoài code, tối thiểu 3 assertion pattern,
> cấm `waitForTimeout`, cấm selector bằng class Tailwind, và bắt buộc có banner chống gian lận trong report."

**Chỉ vào §5 — Quy trình 9 phase:**
> "Và đây là xương sống: chín phase, mỗi phase có sản phẩm riêng, có commit riêng, và có mục đánh dấu
> **việc nào em phải tự làm** — ký duyệt test case, chụp report, tạo Issue, quay video, bảo vệ."

---

## PHẦN 3 — CHẠY THẬT (1:40–3:10)

**Thao tác:** mở terminal, khởi động Claude Code trong thư mục repo, gõ đúng prompt đã dùng:

```
Read file SKILL.md in folder eshop-automation-23127060 and do task as guideline.
Remember to commit after each phase
```

**Lời nói (trong lúc agent chạy):**
> "Chỉ một câu lệnh. Không mô tả feature, không đưa selector, không nói tên file. Toàn bộ ngữ cảnh nằm trong skill.
>
> Nhìn agent làm: nó đọc skill, rồi đi Phase 0 trước — khảo sát SUT, gọi `curl` để tự xác minh hành vi API,
> chứ không tin những gì skill viết sẵn. Rồi Phase 1 thiết kế test case, Phase 2 sinh dữ liệu, Phase 3 viết code.
> Mỗi phase một commit."

**Thao tác:** trong khi agent chạy, mở tab khác:
```bash
git log --oneline | head -12
```
> "Đây là lịch sử commit — mỗi phase một commit riêng, đúng như skill yêu cầu. Không phải một commit khổng lồ."

---

## PHẦN 4 — AI Log (3:10–4:20)

**Thao tác:** mở `ai/AI_Log.md`, cuộn qua vài entry.

**Lời nói:**
> "Skill có một quy tắc mà em cho là quan trọng nhất: **kết thúc mỗi lượt làm việc, agent bắt buộc ghi
> một entry vào AI_Log.md** — prompt nguyên văn, output tóm tắt, file nào bị sửa, và **lệnh nào đã chạy
> kèm output thật**."

**Thao tác:** dừng ở LOG-005, chỉ vào phần "Lệnh đã chạy & kết quả thật".

> "Nhìn entry này. Nó ghi thẳng rằng lần chạy đầu tiên **fail 9 test** vì AI hiểu sai một API của Playwright,
> rồi mới sửa. Skill cấm agent bịa số liệu — mọi con số phải lấy từ `results.json` thật.
>
> Nhờ log này, em sinh được `AI_Audit_Report.md` và viết được `AI_Critique.md` dựa trên **lỗi thật**,
> chứ không phải viết chung chung kiểu 'AI đôi khi không chính xác'."

---

## PHẦN 5 — Skill chặn AI đi sai (4:20–5:20)

**Thao tác:** mở `report/02-AI-GAP-ANALYSIS.md`.

**Lời nói:**
> "Skill có riêng Phase 4 bắt agent **tự phê bình chính code nó vừa viết**: tìm selector dễ vỡ, assertion yếu,
> chỗ chờ dễ flaky, edge case còn thiếu — và phải nêu **nguyên nhân** thuộc loại nào: do em ra lệnh chưa đủ rõ,
> do giới hạn của model, hay do đặc thù của feature.
>
> Kết quả: 7 điểm yếu được ghi ra, 5 cái được sửa ngay trong code."

**Thao tác:** mở §11 Anti-pattern trong SKILL.md.

> "Mục cuối skill liệt kê thẳng những thứ nếu thấy agent làm thì phải dừng lại: viết hết ba feature trong một
> prompt, selector kiểu `div.bg-white > button:nth-child(2)`, rải `waitForTimeout` khắp nơi, assertion kiểu
> `expect(true).toBe(true)`, và — quan trọng nhất — **điền số pass/fail khi chưa chạy thật**.
>
> Em có chạy quét tự động để kiểm: không có `waitForTimeout` nào, không có selector class Tailwind nào,
> không có mảng dữ liệu hardcode nào trong spec."

**Thao tác:**
```bash
cd 23127060/automation
grep -rn "waitForTimeout" tests/*.spec.js || echo "0 ket qua"
```

---

## PHẦN 6 — Kết (5:20–5:40)

> "Tóm lại, Agent Skill với em không phải file tài liệu. Nó là **hợp đồng làm việc** với AI:
> quy định phạm vi được đụng, chuẩn kỹ thuật phải đạt, quy trình phải đi qua, và bắt buộc phải ghi lại
> mọi thứ để em kiểm chứng được.
>
> Cái em giữ lại được sau bài này không phải 80 test case, mà là cách ràng buộc một AI agent
> sao cho vẫn kiểm soát và giải thích được từng dòng nó viết ra. Em cảm ơn thầy/cô."

---

## ✅ Checklist trước khi Upload

- [ ] Có mở và giải thích **SKILL.md thật**, không nói suông
- [ ] Có **chạy agent live** với đúng prompt đã dùng
- [ ] Có chỉ `git log` cho thấy mỗi phase một commit
- [ ] Có mở `AI_Log.md` và chỉ vào một entry ghi **lỗi thật**
- [ ] Có mở `02-AI-GAP-ANALYSIS.md` và nói về việc skill bắt AI tự phê bình
- [ ] Giọng nói tiếng Việt **thật**
- [ ] Upload YouTube **Unlisted**, dán link vào `README.md`
