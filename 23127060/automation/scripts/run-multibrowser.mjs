// Chạy 3 feature × 3 browser = 9 lần, mỗi lần ghi vào 1 thư mục report riêng.
// Mỗi run set PW_REPORT_DIR + PW_FEATURE để playwright.config.js đặt đúng banner và outputFolder.
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PW_CLI = resolve(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');

const FEATURES = [
  { tag: '@fr03', slug: 'fr03-reset' },
  { tag: '@fr08', slug: 'fr08-checkout' },
  { tag: '@fr15', slug: 'fr15-product' },
];
const BROWSERS = ['chromium', 'firefox', 'webkit'];

const only = process.argv.slice(2);
const wanted = (slug) => only.length === 0 || only.some((a) => slug.includes(a));

const results = [];

for (const feature of FEATURES) {
  for (const browser of BROWSERS) {
    const dir = `playwright-report/${feature.slug}-${browser}`;
    if (!wanted(`${feature.slug}-${browser}`)) continue;

    // Xoá report cũ để số liệu không lẫn giữa các lần chạy.
    const abs = resolve(ROOT, dir);
    if (existsSync(abs)) rmSync(abs, { recursive: true, force: true });

    console.log(`\n=== RUN ${feature.slug} × ${browser} -> ${dir} ===`);
    const started = Date.now();
    // Gọi thẳng CLI của Playwright bằng chính node đang chạy.
    // KHÔNG dùng 'npx'/'npx.cmd': trên Windows spawnSync không phân giải được file .cmd
    // nếu thiếu shell:true (đã kiểm chứng — mọi run trả về exit=null trong 0.0s).
    const run = spawnSync(
      process.execPath,
      [PW_CLI, 'test', `--project=${browser}`, '--grep', feature.tag],
      {
        cwd: ROOT,
        stdio: 'inherit',
        env: { ...process.env, PW_REPORT_DIR: dir, PW_FEATURE: feature.slug },
      },
    );

    results.push({
      feature: feature.slug,
      browser,
      dir,
      exitCode: run.status,
      wallClockMs: Date.now() - started,
    });
  }
}

console.log('\n================ TỔNG KẾT 9 RUN ================');
for (const r of results) {
  console.log(
    `${r.feature.padEnd(14)} ${r.browser.padEnd(9)} exit=${String(r.exitCode).padEnd(3)} ${(
      r.wallClockMs / 1000
    ).toFixed(1)}s  ${r.dir}`,
  );
}

const failed = results.filter((r) => r.exitCode !== 0);
if (failed.length > 0) {
  console.log(`\n⚠️  ${failed.length}/${results.length} run có test FAIL (xem chi tiết ở trên).`);
} else {
  console.log(`\n✅ ${results.length}/${results.length} run PASS toàn bộ.`);
}
// Không exit(1) khi có fail: fail của SUT là kết quả hợp lệ cần được báo cáo, không phải lỗi script.
