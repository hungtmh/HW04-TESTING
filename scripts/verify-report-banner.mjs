#!/usr/bin/env node
/**
 * Anti-AI-cheat verification helper.
 *
 * HW04 requires each HTML report to *visibly* display "Run by: {StudentID}"
 * together with an ISO timestamp. The Playwright HTML reporter stores its data
 * as a base64 zip inside index.html, so a plain text search of the file finds
 * nothing even when the rendered page shows the string. This script opens each
 * report the way a TA would - in a real browser - and proves the text is on
 * screen, saving a screenshot as evidence.
 */
import { chromium } from '@playwright/test';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const STUDENT_ID = process.env.STUDENT_ID || '23127259';
const reportRoot = 'playwright-report';
const shotDir = process.env.REPORT_SCREENSHOT_DIR
  || path.join(STUDENT_ID, 'evidence', 'report-screenshots');
const reportPattern = process.env.REPORT_FILTER
  ? new RegExp(process.env.REPORT_FILTER)
  : /^(fr02-login|fr07-cart|fr16-import-csv)-(chromium|firefox|webkit)$/;
mkdirSync(shotDir, { recursive: true });

const dirs = readdirSync(reportRoot, { withFileTypes: true })
  .filter(d => d.isDirectory()
    && reportPattern.test(d.name)
    && existsSync(path.join(reportRoot, d.name, 'index.html')))
  .map(d => d.name);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let allOk = true;

for (const dir of dirs) {
  const file = path.resolve(reportRoot, dir, 'index.html');
  await page.goto(pathToFileURL(file).href);
  await page.waitForSelector('text=Run by:', { timeout: 20_000 });

  const bodyText = await page.locator('body').innerText();
  const hasId = bodyText.includes(`Run by: ${STUDENT_ID}`);
  const iso = bodyText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)?.[0] ?? null;

  const shot = path.join(shotDir, `${dir}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  const ok = hasId && !!iso;
  allOk = allOk && ok;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${dir}  runBy=${hasId}  iso=${iso}  -> ${shot}`);
}

await browser.close();
console.log(allOk ? '\nAll reports display the required attribution.' : '\nSome reports are missing attribution.');
process.exit(allOk ? 0 : 1);
