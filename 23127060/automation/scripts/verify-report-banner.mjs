// Anti-AI-Cheat §11: FAIL CỨNG nếu index.html của bất kỳ report nào thiếu
// banner "Run by: 23127060" hoặc thiếu ISO timestamp.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS_DIR = resolve(ROOT, 'playwright-report');

const STUDENT_ID = '23127060';
const BANNER = `Run by: ${STUDENT_ID}`;
const ISO_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/;

if (!existsSync(REPORTS_DIR)) {
  console.error(`❌ Không có thư mục ${REPORTS_DIR}. Chạy scripts/run-multibrowser.mjs trước.`);
  process.exit(1);
}

const dirs = readdirSync(REPORTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'local')
  .map((d) => d.name)
  .sort();

if (dirs.length === 0) {
  console.error('❌ Chưa có report nào (ngoài "local"). Chạy run-multibrowser.mjs trước.');
  process.exit(1);
}

let failures = 0;

for (const name of dirs) {
  const indexPath = resolve(REPORTS_DIR, name, 'index.html');
  if (!existsSync(indexPath)) {
    console.error(`❌ ${name.padEnd(24)} thiếu index.html`);
    failures += 1;
    continue;
  }

  const html = readFileSync(indexPath, 'utf8');
  const hasBanner = html.includes(BANNER);
  const isoMatch = html.match(ISO_RE);

  if (hasBanner && isoMatch) {
    console.log(`✅ ${name.padEnd(24)} banner OK · timestamp ${isoMatch[0]}`);
  } else {
    console.error(
      `❌ ${name.padEnd(24)} ${hasBanner ? '' : 'THIẾU BANNER '}${isoMatch ? '' : 'THIẾU ISO TIMESTAMP'}`,
    );
    failures += 1;
  }
}

console.log(`\n${dirs.length - failures}/${dirs.length} report hợp lệ.`);

if (failures > 0) {
  console.error(`❌ ${failures} report KHÔNG đạt yêu cầu banner chống gian lận.`);
  process.exit(1);
}
console.log(`✅ Tất cả report đều mang banner "${BANNER}" và ISO timestamp thật.`);
