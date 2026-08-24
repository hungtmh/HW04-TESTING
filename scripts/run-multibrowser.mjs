#!/usr/bin/env node
/**
 * Runs the suite once per browser engine so that EVERY browser run produces its
 * own standalone HTML report, as HW04 requires.
 *
 * Usage:  node scripts/run-multibrowser.mjs [specFile]
 * Example: node scripts/run-multibrowser.mjs tests/fr01-register.spec.js
 *
 * Known SUT defects remain red and are classified as @bug failures. The runner
 * exits non-zero only for infrastructure failures or non-@bug test failures.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BROWSERS = ['chromium', 'firefox', 'webkit'];
const spec = process.argv[2] || 'tests/fr01-register.spec.js';
const feature = path.basename(spec).replace(/\.spec\.js$/, '');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const summary = [];
let runnerFailure = false;

for (const browser of BROWSERS) {
  const reportDir = `playwright-report/${feature}-${browser}`;
  console.log(`\n=== Running ${spec} on ${browser} -> ${reportDir} ===`);

  const run = spawnSync(npx, ['playwright', 'test', spec, `--project=${browser}`], {
    stdio: 'inherit',
    env: { ...process.env, PW_REPORT_DIR: reportDir },
    shell: process.platform === 'win32',
  });

  const resultsFile = path.join(reportDir, 'results.json');
  let passed = 0, bugFailures = 0, unexpectedFailures = 0, skipped = 0;

  if (existsSync(resultsFile)) {
    const json = JSON.parse(readFileSync(resultsFile, 'utf8'));
    const walk = (suites = []) => {
      for (const s of suites) {
        for (const spec of s.specs ?? []) {
          for (const t of spec.tests ?? []) {
            const status = t.results?.at(-1)?.status ?? 'unknown';
            const isBug = (spec.tags ?? []).includes('@bug') || spec.title.includes('@bug');
            if (status === 'passed') passed++;
            else if (status === 'skipped') skipped++;
            else if (isBug) bugFailures++;
            else unexpectedFailures++;
          }
        }
        walk(s.suites);
      }
    };
    walk(json.suites);
  }

  if (!existsSync(resultsFile) || unexpectedFailures > 0 || run.error) runnerFailure = true;
  summary.push({
    browser,
    reportDir,
    passed,
    bugFailures,
    unexpectedFailures,
    skipped,
    total: passed + bugFailures + unexpectedFailures + skipped,
  });
}

console.log('\n================ MULTI-BROWSER SUMMARY ================');
console.table(summary);

mkdirSync('playwright-report', { recursive: true });
const out = {
  feature,
  spec,
  runBy: '23127259',
  executedAtISO: new Date().toISOString(),
  browserRuns: summary.length,
  perBrowser: summary,
  totals: summary.reduce(
    (acc, r) => ({
      passed: acc.passed + r.passed,
      bugFailures: acc.bugFailures + r.bugFailures,
      unexpectedFailures: acc.unexpectedFailures + r.unexpectedFailures,
      skipped: acc.skipped + r.skipped,
      total: acc.total + r.total,
    }),
    { passed: 0, bugFailures: 0, unexpectedFailures: 0, skipped: 0, total: 0 },
  ),
};
const outFile = `playwright-report/${feature}-summary.json`;
writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(`Summary written to ${outFile}`);
process.exitCode = runnerFailure ? 1 : 0;
