// Đọc results.json THẬT của 9 report -> bảng markdown cho README / Main Report.
// Không có số nào được nhập tay: mọi con số đều lấy từ file do Playwright sinh ra.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS_DIR = resolve(ROOT, 'playwright-report');
const OUT = resolve(ROOT, '..', 'report', '03-RUN-SUMMARY.md');

/** Duyệt cây suite của results.json và gom mọi test. */
function collectTests(suites, acc = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) acc.push({ spec, test: t });
    }
    collectTests(suite.suites, acc);
  }
  return acc;
}

function summarize(file) {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  const tests = collectTests(json.suites);

  let passed = 0;
  let failed = 0;
  let flaky = 0;
  let skipped = 0;

  for (const { test } of tests) {
    switch (test.status) {
      case 'expected':
        passed += 1;
        break;
      case 'unexpected':
        failed += 1;
        break;
      case 'flaky':
        flaky += 1;
        break;
      default:
        skipped += 1;
    }
  }

  return {
    total: tests.length,
    passed,
    failed,
    flaky,
    skipped,
    durationMs: json.stats?.duration ?? 0,
    startedAt: json.stats?.startTime ?? '',
    runBy: json.config?.metadata?.['Run by'] ?? '',
    runAt: json.config?.metadata?.['Run at (ISO)'] ?? '',
  };
}

if (!existsSync(REPORTS_DIR)) {
  console.error('❌ Chưa có playwright-report/. Chạy run-multibrowser.mjs trước.');
  process.exit(1);
}

const dirs = readdirSync(REPORTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'local')
  .map((d) => d.name)
  .sort();

const rows = [];
for (const name of dirs) {
  const file = resolve(REPORTS_DIR, name, 'results.json');
  if (!existsSync(file)) {
    console.error(`⚠️  ${name}: thiếu results.json`);
    continue;
  }
  const [feature, browser] = [name.replace(/-(chromium|firefox|webkit)$/, ''), name.split('-').pop()];
  rows.push({ name, feature, browser, ...summarize(file) });
}

const totals = rows.reduce(
  (a, r) => ({
    total: a.total + r.total,
    passed: a.passed + r.passed,
    failed: a.failed + r.failed,
    flaky: a.flaky + r.flaky,
    skipped: a.skipped + r.skipped,
    durationMs: a.durationMs + r.durationMs,
  }),
  { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0, durationMs: 0 },
);

const lines = [];
lines.push('# 03 — KẾT QUẢ 9 LẦN CHẠY MULTI-BROWSER (Phase 5)');
lines.push('');
lines.push('- **Sinh viên:** Ninh Văn Khải — MSSV **23127060**');
lines.push(`- **Sinh tự động bởi:** \`scripts/summarize-results.mjs\` lúc ${new Date().toISOString()}`);
lines.push('- **Nguồn số liệu:** `playwright-report/<dir>/results.json` do Playwright sinh ra. Không con số nào nhập tay.');
lines.push('');
lines.push('| # | Report dir | Feature | Browser | Total | Passed | Failed | Flaky | Skipped | Duration (s) |');
lines.push('|---|---|---|---|---|---|---|---|---|---|');
rows.forEach((r, i) => {
  lines.push(
    `| ${i + 1} | \`${r.name}\` | ${r.feature} | ${r.browser} | ${r.total} | ${r.passed} | ${r.failed} | ${r.flaky} | ${r.skipped} | ${(r.durationMs / 1000).toFixed(1)} |`,
  );
});
lines.push(
  `| | **TỔNG** | | | **${totals.total}** | **${totals.passed}** | **${totals.failed}** | **${totals.flaky}** | **${totals.skipped}** | **${(totals.durationMs / 1000).toFixed(1)}** |`,
);
lines.push('');
lines.push('## Banner chống gian lận (metadata đọc từ results.json)');
lines.push('');
lines.push('| Report dir | Run by | Run at (ISO) |');
lines.push('|---|---|---|');
rows.forEach((r) => lines.push(`| \`${r.name}\` | ${r.runBy} | ${r.runAt} |`));
lines.push('');
lines.push(`Tỉ lệ pass tổng thể: **${((totals.passed / totals.total) * 100).toFixed(1)}%** (${totals.passed}/${totals.total}).`);
lines.push('');
lines.push('> Mỗi test PASS ở đây nghĩa là **hành vi thật của SUT khớp với kỳ vọng đã ghi trong test**.');
lines.push('> Với các test gắn mã `BUG-xx-xx`, kỳ vọng chính là *hành vi sai* đã được xác minh —');
lines.push('> test pass = **bug vẫn tồn tại**. Chi tiết xem `bug-report/BUG_REPORT.md`.');
lines.push('');

writeFileSync(OUT, lines.join('\n'), 'utf8');

console.log(lines.join('\n'));
console.log(`\n📄 Đã ghi: ${OUT}`);
