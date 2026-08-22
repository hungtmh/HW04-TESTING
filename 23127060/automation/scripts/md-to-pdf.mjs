// Xuất PDF cho các file .md bắt buộc nộp, dùng chính Chromium của Playwright (không thêm dependency).
// Markdown -> HTML bằng bộ chuyển đổi tối giản tự viết (đủ cho cú pháp đang dùng: heading, bảng,
// code block, list, blockquote, bold/italic/inline-code, link), rồi in ra PDF khổ A4.
//
// Chạy: node scripts/md-to-pdf.mjs
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = resolve(ROOT, '..');

/** Các file bắt buộc nộp kèm PDF (§14 đề bài). */
const TARGETS = [
  'report/HW04_Main_Report.md',
  'report/00-SUT-RECON.md',
  'report/01-TEST-CASES.md',
  'report/02-AI-GAP-ANALYSIS.md',
  'report/03-RUN-SUMMARY.md',
  'bug-report/BUG_REPORT.md',
  'ai/AI_Audit_Report.md',
  'ai/AI_Critique.md',
  'README.md',
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Chuyển inline markdown (bold, italic, code, link) — chạy SAU khi đã escape HTML. */
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function mdToHtml(md) {
  const out = [];
  const lines = md.split(/\r?\n/);
  let inCode = false;
  let inTable = false;
  let listType = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeList();
      closeTable();
      out.push(inCode ? '</code></pre>' : '<pre><code>');
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push(esc(line));
      continue;
    }

    // Bảng: | a | b |  theo sau bởi |---|---|
    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      closeList();
      closeTable();
      const cells = line.split('|').slice(1, -1).map((c) => inline(esc(c.trim())));
      out.push(`<table><thead><tr>${cells.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>`);
      inTable = true;
      i += 1; // bỏ dòng phân cách
      continue;
    }
    if (inTable) {
      if (/^\s*\|/.test(line)) {
        const cells = line.split('|').slice(1, -1).map((c) => inline(esc(c.trim())));
        out.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`);
        continue;
      }
      closeTable();
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      out.push(`<h${heading[1].length}>${inline(esc(heading[2]))}</h${heading[1].length}>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      out.push(`<li>${inline(esc(line.replace(/^\s*[-*]\s+/, '')))}</li>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      out.push(`<li>${inline(esc(line.replace(/^\s*\d+\.\s+/, '')))}</li>`);
      continue;
    }
    closeList();

    if (/^>\s?/.test(line)) {
      out.push(`<blockquote>${inline(esc(line.replace(/^>\s?/, '')))}</blockquote>`);
      continue;
    }
    if (/^---+$/.test(line)) {
      out.push('<hr>');
      continue;
    }
    if (line.trim() === '') {
      out.push('');
      continue;
    }
    out.push(`<p>${inline(esc(line))}</p>`);
  }

  closeList();
  closeTable();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

const CSS = `
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: "Segoe UI", system-ui, sans-serif; font-size: 10.5pt; line-height: 1.55; color: #111827; }
  h1 { font-size: 19pt; border-bottom: 3px solid #2563eb; padding-bottom: 6px; }
  h2 { font-size: 14.5pt; margin-top: 20px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
  h3 { font-size: 12pt; margin-top: 15px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 8.8pt; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 4px 7px; text-align: left; vertical-align: top; }
  th { background: #eff6ff; font-weight: 600; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 9pt; }
  pre { background: #0f172a; color: #e2e8f0; padding: 10px 12px; border-radius: 5px; overflow-x: auto;
        font-size: 8.5pt; page-break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #f59e0b; background: #fffbeb; margin: 10px 0; padding: 7px 12px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
  a { color: #2563eb; }
`;

const browser = await chromium.launch();
const page = await browser.newPage();
let ok = 0;

for (const rel of TARGETS) {
  const src = resolve(BASE, rel);
  if (!existsSync(src)) {
    console.warn(`⚠️  bỏ qua (không tồn tại): ${rel}`);
    continue;
  }
  const outPath = src.replace(/\.md$/, '.pdf');
  mkdirSync(dirname(outPath), { recursive: true });

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
    <title>${basename(rel)}</title><style>${CSS}</style></head>
    <body>${mdToHtml(readFileSync(src, 'utf8'))}</body></html>`;

  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="font-size:8pt;width:100%;padding:0 14mm;color:#6b7280;display:flex;justify-content:space-between">' +
      '<span>23127060 — Ninh Văn Khải · HW04 Automation Testing</span>' +
      '<span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
  });

  console.log(`✅ ${rel} → ${basename(outPath)}`);
  ok += 1;
}

await browser.close();
console.log(`\nĐã xuất ${ok}/${TARGETS.length} file PDF.`);
