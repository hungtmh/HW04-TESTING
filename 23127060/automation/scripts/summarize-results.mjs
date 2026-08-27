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
lines.push('- **Nguồn số liệu:** `playwright-report/<dir>/results.json` do Playwright sinh ra');
lines.push('');
lines.push('Ở tài liệu này em tổng hợp lại kết quả của cả 9 lần chạy, tương ứng 3 feature nhân với 3 trình duyệt.');
lines.push('Em xin nói rõ là em không tự gõ bảng này: em viết script `summarize-results.mjs` để đọc thẳng file');
lines.push('`results.json` mà Playwright sinh ra sau mỗi lần chạy, rồi tự dựng bảng. Nhờ vậy em chắc chắn là');
lines.push('**không có con số nào trong đây do em nhập tay**, và nếu chạy lại thì bảng sẽ tự cập nhật theo.');
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
lines.push('## Banner chống gian lận (metadata em đọc từ results.json)');
lines.push('');
lines.push('Đề bài yêu cầu mỗi report phải có banner ghi rõ người chạy để chống gian lận. Em kiểm tra lại bằng');
lines.push('cách đọc phần metadata trong chính `results.json` của từng lần chạy, và xin liệt kê ra đây để');
lines.push('thầy/cô đối chiếu với ảnh chụp màn hình mà em nộp kèm:');
lines.push('');
lines.push('| Report dir | Run by | Run at (ISO) |');
lines.push('|---|---|---|');
rows.forEach((r) => lines.push(`| \`${r.name}\` | ${r.runBy} | ${r.runAt} |`));
lines.push('');
lines.push(`Tính chung cả 9 lần chạy, tỉ lệ pass em đạt được là **${((totals.passed / totals.total) * 100).toFixed(1)}%**, tức ${totals.passed} trên tổng số ${totals.total} lượt chạy test.`);
lines.push('');
lines.push('> **Em xin giải thích rõ con số này nên được hiểu như thế nào.** Một test PASS ở đây có nghĩa là');
lines.push('> **hành vi thật của SUT khớp với kỳ vọng mà em đã ghi trong test**. Riêng với những test em gắn mã');
lines.push('> `BUG-xx-xx`, kỳ vọng mà em ghi vào chính là *hành vi sai* mà em đã xác minh được từ trước. Cho nên');
lines.push('> với các test đó, pass đồng nghĩa với việc **bug vẫn còn tồn tại trong hệ thống**, chứ không phải là');
lines.push('> hệ thống chạy đúng. Chi tiết từng lỗi em trình bày ở `bug-report/BUG_REPORT.md`.');
lines.push('');

writeFileSync(OUT, lines.join('\n'), 'utf8');

console.log(lines.join('\n'));
console.log(`\n📄 Đã ghi: ${OUT}`);
