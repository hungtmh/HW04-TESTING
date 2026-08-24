#!/usr/bin/env node
/**
 * Captures raw Playwright HTML-report detail pages for BUG-01..BUG-20.
 *
 * No title, Expected/Actual text, border, or annotation is drawn onto the
 * screenshots. Captions and interpretation belong in BUG_REPORT.md and the
 * GitHub Issue body, outside the image.
 */
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const studentId = '23127259';
const catalogPath = path.resolve(studentId, 'evidence/bugs/bug_catalog.json');
const outputDir = path.resolve(studentId, 'evidence/bugs');
const bugs = JSON.parse(readFileSync(catalogPath, 'utf8'));
mkdirSync(outputDir, { recursive: true });

const captureMap = {
  'BUG-01': { report: 'fr02-login-chromium', tc: 'TC05' },
  'BUG-02': { report: 'fr02-login-chromium', tc: 'TC07' },
  'BUG-03': { report: 'fr02-login-chromium', tc: 'TC08' },
  'BUG-04': { report: 'fr02-login-chromium', tc: 'TC09' },
  'BUG-05': { report: 'fr02-login-chromium', tc: 'TC11' },
  'BUG-06': { report: 'fr02-login-chromium', tc: 'TC13' },
  'BUG-07': { report: 'fr02-login-chromium', tc: 'TC14' },
  'BUG-08': { report: 'fr02-login-chromium', tc: 'TC15' },
  'BUG-09': { report: 'fr02-login-chromium', tc: 'TC16' },
  'BUG-10': { report: 'fr07-cart-chromium', tc: 'TC12' },
  'BUG-11': { report: 'fr07-cart-chromium', tc: 'TC13' },
  'BUG-12': { report: 'fr07-cart-chromium', tc: 'TC14' },
  'BUG-13': { report: 'fr07-cart-chromium', tc: 'TC15' },
  'BUG-14': { report: 'fr07-cart-chromium', tc: 'TC16' },
  'BUG-15': { report: 'fr07-cart-chromium', tc: 'TC17' },
  'BUG-16': { report: 'fr16-import-csv-chromium', tc: 'TC06' },
  'BUG-17': { report: 'fr16-import-csv-chromium', tc: 'TC09' },
  'BUG-18': { report: 'fr16-import-csv-chromium', tc: 'TC10' },
  'BUG-19': { report: 'fr16-import-csv-chromium', tc: 'TC11' },
  'BUG-20': { report: 'fr16-import-csv-chromium', tc: 'TC12' },
};

const slug = title => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 1 });

for (const bug of bugs) {
  const target = captureMap[bug.id];
  if (!target) throw new Error(`No report mapping for ${bug.id}`);

  const reportFile = path.resolve('playwright-report', target.report, 'index.html');
  await page.goto(pathToFileURL(reportFile).href, { waitUntil: 'load' });

  const testLink = page.getByRole('link', { name: new RegExp(`${target.tc}: @bug`) }).first();
  await testLink.waitFor({ state: 'visible', timeout: 20_000 });
  await testLink.click();
  await page.getByText('Errors', { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(300);

  const body = await page.locator('body').innerText();
  if (!body.includes('run-by: 23127259') || !body.includes(target.tc)) {
    throw new Error(`Unexpected report detail for ${bug.id}`);
  }

  const output = path.join(outputDir, `${bug.id}-${slug(bug.title)}.png`);
  // Capture the raw report viewport: header, annotations, assertion error and,
  // for UI cases, the beginning of Playwright's own SUT screenshot section.
  await page.screenshot({ path: output, fullPage: false });
  console.log(`OK ${bug.id} ${target.tc} -> ${path.relative(process.cwd(), output)}`);
}

await browser.close();
