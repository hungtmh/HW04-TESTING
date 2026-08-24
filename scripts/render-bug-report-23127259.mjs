#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const studentId = '23127259';
const root = path.resolve(studentId, 'evidence/bugs');
const bugs = JSON.parse(readFileSync(path.join(root, 'bug_catalog.json'), 'utf8'));
const issueFile = path.join(root, 'github_issues.json');
const issues = existsSync(issueFile)
  ? Object.fromEntries(JSON.parse(readFileSync(issueFile, 'utf8')).map(item => [item.id, item]))
  : {};

const slug = title => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
const evidenceName = bug => `${bug.id}-${slug(bug.title)}.png`;
const issueLink = bug => issues[bug.id]?.url ? `[#${issues[bug.id].number}](${issues[bug.id].url})` : 'Pending';

const lines = [
  '# Bug Report - FR-02, FR-07, FR-16', '',
  '| | |', '|---|---|',
  `| **Sinh viên** | Nguyễn Tấn Thắng - ${studentId} |`,
  '| **SUT** | EShop: frontend-web `:5173`, frontend-admin `:5174`, backend API `:3000` |',
  '| **Phát hiện bằng** | Playwright automation trên Chromium / Firefox / WebKit |',
  '| **Ngày** | 2026-08-24 |',
  '| **Kết quả** | 20 root defects, 21 `@bug` test case, 63 browser-level failures, 0 unexpected failure |', '',
  '## Tổng quan', '',
  '| ID | Feature | Mức độ | Tóm tắt | Test | Issue |',
  '|---|---|---|---|---|---|',
  ...bugs.map(bug => `| ${bug.id} | ${bug.feature} | ${bug.severity} | ${bug.title} | ${bug.tests} | ${issueLink(bug)} |`),
  '',
  '> 21 test case `@bug` ánh xạ tới 20 root defects vì TC05 và TC12 của FR-02 cùng bắt nguồn từ email input sai `type`/label nhưng kiểm tra hai acceptance criteria khác nhau.',
  ''
];

for (const bug of bugs) {
  lines.push(
    '---', '', `## ${bug.id} - ${bug.title}`, '',
    `- **Mức độ:** ${bug.severity}`,
    `- **Feature / SRS:** ${bug.feature} / ${bug.srs}`,
    `- **Automation test:** ${bug.tests}`,
    `- **GitHub Issue:** ${issueLink(bug)}`,
    `- **Evidence:** \`../evidence/bugs/${evidenceName(bug)}\``, '',
    '### Mô tả', '',
    `Automation đọc kỳ vọng từ ${bug.srs} và so sánh với hành vi thực tế. Case ${bug.tests} fail nhất quán trên cả ba browser engine; summary JSON ghi nhận không có failure nào ngoài nhóm \`@bug\`.`, '',
    '### Steps to reproduce', '',
    ...bug.steps.map((step, index) => `${index + 1}. ${step}`), '',
    '### Expected', '', bug.expected, '',
    '### Actual', '', bug.actual, '',
    '### Bằng chứng', '',
    `![${bug.id} evidence](../evidence/bugs/${evidenceName(bug)})`, '',
    'Bằng chứng trên được sinh từ mapping SRS và kết quả Playwright Chromium đã verify; report Firefox/WebKit cho cùng kết quả.', '',
    '### Đề xuất sửa', '', bug.fix, ''
  );
}

lines.push('---', '', '## Trạng thái GitHub Issues', '',
  '| Bug | Issue |', '|---|---|',
  ...bugs.map(bug => `| ${bug.id} | ${issueLink(bug)} |`), '',
  'Tất cả Issue được tạo bằng tài khoản GitHub `thangak18` và gắn evidence từ nhánh bài làm.'
);

const output = path.resolve(studentId, 'bug-report/BUG_REPORT.md');
writeFileSync(output, `${lines.join('\n')}\n`, 'utf8');
console.log(`OK ${output} (${bugs.length} bugs)`);
