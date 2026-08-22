// Đếm số từ phần nội dung của AI_Critique.md (bỏ tiêu đề, ghi chú, dòng phân cách)
// và ghi kết quả thật vào cuối file. Yêu cầu đề bài: 200–300 từ.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, '..', 'ai', 'AI_Critique.md');

const raw = readFileSync(FILE, 'utf8');

// Nội dung tính điểm = phần giữa hai dòng '---' đầu tiên và cuối cùng.
const parts = raw.split(/^---$/m);
const body = parts.length >= 3 ? parts.slice(1, -1).join('\n') : raw;

const words = body
  .replace(/`[^`]*`/g, ' ') // bỏ inline code
  .replace(/[#*_>|]/g, ' ')
  .split(/\s+/)
  .filter((w) => /[\p{L}\p{N}]/u.test(w));

const count = words.length;
const ok = count >= 200 && count <= 300;

const line = `**Số từ (đếm tự động bởi \`scripts/count-words.mjs\`):** **${count} từ** — ${
  ok ? '✅ nằm trong khoảng 200–300 từ theo yêu cầu' : '❌ NGOÀI khoảng 200–300 từ, cần sửa'
}`;

const updated = raw.replace(
  /\*\*Số từ.*$/ms,
  `${line}\n\n<sub>Đếm lúc ${new Date().toISOString()}. Bỏ qua tiêu đề, ghi chú và inline code.</sub>\n`,
);
writeFileSync(FILE, updated, 'utf8');

console.log(`AI_Critique.md: ${count} từ — ${ok ? 'ĐẠT (200–300)' : 'KHÔNG ĐẠT'}`);
if (!ok) process.exit(1);
