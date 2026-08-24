#!/usr/bin/env node
/**
 * Converts Markdown files to PDF, which HW04 requires for the report, the AI
 * audit and the AI critique (Markdown + PDF for each).
 *
 * Rendering goes through Chromium, which Playwright already provides, so no
 * LaTeX or pandoc toolchain is needed.
 *
 * Usage:
 *   node scripts/md-to-pdf.mjs <file.md> [more.md ...]
 *   STUDENT_ID=23127259 node scripts/md-to-pdf.mjs --all
 */
import { chromium } from '@playwright/test';
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const CSS = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Times New Roman", serif;
    font-size: 12.5pt; line-height: 1.55; color: #16181d; margin: 0;
  }
  h1 { font-size: 21pt; margin: 0 0 .5em; padding-bottom: .25em;
       border-bottom: 2.5px solid #2b6cb0; color: #1a365d; }
  h2 { font-size: 15.5pt; margin: 1.3em 0 .45em; color: #1a365d;
       border-bottom: 1px solid #cbd5e0; padding-bottom: .15em; page-break-after: avoid; }
  h3 { font-size: 13pt; margin: 1.1em 0 .35em; color: #2c5282; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  ul, ol { padding-left: 1.4em; margin: .45em 0; }
  li { margin: .22em 0; }
  code { font-family: Consolas, "Courier New", monospace; font-size: .87em;
         background: #f0f2f5; padding: .1em .35em; border-radius: 3px; }
  pre { background: #f7f8fa; border: 1px solid #dde1e6; border-left: 3.5px solid #2b6cb0;
        border-radius: 4px; padding: .7em .9em; overflow-x: auto;
        page-break-inside: avoid; margin: .6em 0; }
  pre code { background: none; padding: 0; font-size: .82em; line-height: 1.4; }
  table { border-collapse: collapse; width: 100%; margin: .7em 0;
          font-size: .9em; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e0; padding: .35em .55em; text-align: left; vertical-align: top; }
  th { background: #edf2f7; font-weight: 600; }
  blockquote { border-left: 3.5px solid #f6ad55; background: #fffaf0;
               margin: .7em 0; padding: .5em .9em; page-break-inside: avoid; }
  blockquote p { margin: .3em 0; }
  hr { border: none; border-top: 1px solid #cbd5e0; margin: 1.4em 0; }
  a { color: #2b6cb0; text-decoration: none; word-break: break-all; }
  img { max-width: 100%; }
  strong { color: #1a202c; }
  /* Keep a heading with the block that follows it. */
  h2 + p, h2 + ul, h2 + table, h3 + p, h3 + ul, h3 + blockquote { page-break-before: avoid; }
`;

const STUDENT_ID = process.env.STUDENT_ID || '23127259';
const SUBMISSION_DIR = process.env.SUBMISSION_DIR || STUDENT_ID;

function collectMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectMarkdown(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

const args = process.argv.slice(2);
const files = args.includes('--all') ? collectMarkdown(SUBMISSION_DIR) : args;

if (!files.length) {
  console.error('Usage: node scripts/md-to-pdf.mjs <file.md> [...] | --all');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const file of files) {
  const md = readFileSync(file, 'utf8');
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
    <title>${path.basename(file, '.md')}</title><style>${CSS}</style></head>
    <body>${marked.parse(md)}</body></html>`;

  // A temporary sibling .html keeps relative image paths resolvable.
  const tmpHtml = file.replace(/\.md$/, '.__tmp.html');
  writeFileSync(tmpHtml, html, 'utf8');

  const pdfPath = file.replace(/\.md$/, '.pdf');
  mkdirSync(path.dirname(pdfPath), { recursive: true });

  await page.goto(`file://${path.resolve(tmpHtml).replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font-size:8pt;color:#718096;padding:0 14mm;' +
      'display:flex;justify-content:space-between;">' +
      `<span>${STUDENT_ID} - HW04 Automation Testing</span>` +
      '<span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
  });

  writeFileSync(tmpHtml, '');
  const { unlinkSync } = await import('node:fs');
  unlinkSync(tmpHtml);

  console.log(`OK  ${file}  ->  ${pdfPath}`);
}

await browser.close();
