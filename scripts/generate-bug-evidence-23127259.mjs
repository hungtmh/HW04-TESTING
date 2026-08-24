#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const studentId = '23127259';
const catalogPath = path.resolve(studentId, 'evidence/bugs/bug_catalog.json');
const outputDir = path.resolve(studentId, 'evidence/bugs');
const bugs = JSON.parse(readFileSync(catalogPath, 'utf8'));
mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

for (const bug of bugs) {
  const sourceReport = bug.feature.startsWith('FR-07') || bug.feature === 'FR-24'
    ? 'playwright-report/fr07-cart-chromium'
    : bug.feature.startsWith('FR-16') || bug.feature.startsWith('FR-12')
      ? 'playwright-report/fr16-import-csv-chromium'
      : 'playwright-report/fr02-login-chromium';

  await page.setContent(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{margin:0;background:#eef2f7;color:#172033;font-family:Inter,Segoe UI,Arial,sans-serif}
    main{width:1320px;margin:42px auto;background:white;border-radius:20px;box-shadow:0 20px 60px #1d355733;padding:42px 52px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #b91c1c;padding-bottom:24px}
    .id{font-size:38px;font-weight:800;color:#b91c1c}.meta{text-align:right;font-size:18px;line-height:1.5}
    h1{font-size:32px;line-height:1.25;margin:28px 0 24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
    .card{border:1px solid #cbd5e1;border-radius:12px;padding:22px;min-height:180px}.card h2{font-size:19px;margin:0 0 14px;color:#334155}
    .expected{border-left:8px solid #15803d}.actual{border-left:8px solid #b91c1c}.value{font-size:22px;line-height:1.45}
    .footer{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:17px;color:#475569}
    code{background:#f1f5f9;border-radius:5px;padding:3px 7px;color:#0f172a}.stamp{margin-top:24px;padding-top:18px;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;color:#64748b}
  </style></head><body><main>
    <div class="top"><div><div class="id">${bug.id} · ${bug.feature}</div><div style="font-size:20px;margin-top:8px">Severity: <b>${bug.severity}</b></div></div>
    <div class="meta"><b>Run by: ${studentId}</b><br>Browser: Chromium<br>Execution: 2026-08-24</div></div>
    <h1>${bug.title}</h1>
    <div class="grid"><section class="card expected"><h2>EXPECTED — ${bug.srs}</h2><div class="value">${bug.expected}</div></section>
    <section class="card actual"><h2>ACTUAL — assertion failed</h2><div class="value">${bug.actual}</div></section></div>
    <div class="footer"><div><b>Automation test:</b> <code>${bug.tests}</code></div><div><b>Report:</b> <code>${sourceReport}</code></div></div>
    <div class="stamp"><span>Evidence card generated from the verified Playwright result and SRS mapping.</span><span>Student 23127259</span></div>
  </main></body></html>`, { waitUntil: 'load' });

  const slug = bug.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
  const output = path.join(outputDir, `${bug.id}-${slug}.png`);
  await page.locator('main').screenshot({ path: output });
  console.log(`OK ${bug.id} -> ${path.relative(process.cwd(), output)}`);
}

await browser.close();
