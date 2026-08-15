#!/usr/bin/env node
/**
 * Captures a clean screenshot for each FR-01 defect, for attaching to GitHub
 * Issues. Kept separate from the suite's own failure screenshots because
 * test-results/ is wiped on every run and is not committed.
 *
 * Usage: node scripts/capture-bug-evidence.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const WEB = process.env.WEB_BASE_URL || 'http://localhost:5173';
const API = process.env.API_BASE_URL || 'http://localhost:3000';
const outDir = path.join('23127195', 'evidence', 'bugs');
mkdirSync(outDir, { recursive: true });

const stamp = Date.now().toString(36);
const email = p => `${p}.${stamp}.${Math.random().toString(36).slice(2, 7)}@eshop-test.local`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

const field = label =>
  page.locator('form > div').filter({ has: page.getByText(label, { exact: true }) }).locator('input');

async function fillRegister({ name, email: em, password }) {
  await page.goto(`${WEB}/register`);
  await page.getByRole('heading', { name: 'Đăng Ký Tài Khoản' }).waitFor();
  await field('Họ Tên').fill(name);
  await field('Email').fill(em);
  await field('Mật khẩu').fill(password);
}

const notes = [];

// ---------------------------------------------------------------- BUG-01
// The on-screen hint demands a special character, but the enforced regex
// rejects the very password that satisfies it.
await fillRegister({ name: 'Nguyen Van A', email: email('bug01'), password: 'Password123!' });
await page.getByRole('button', { name: 'Đăng Ký' }).click();
await page.locator('div.bg-red-100').waitFor();
await page.screenshot({ path: path.join(outDir, 'BUG-01-special-char-rejected.png') });
notes.push(`BUG-01 error text: ${await page.locator('div.bg-red-100').innerText()}`);

// ---------------------------------------------------------------- BUG-02
// A malformed address is accepted and redirects to /login.
const badEmail = 'abc';
await fillRegister({ name: 'Nguyen Van A', email: badEmail, password: 'Password 123' });
await page.getByRole('button', { name: 'Đăng Ký' }).click();
await page.waitForURL(/\/login$/, { timeout: 10_000 });
await page.screenshot({ path: path.join(outDir, 'BUG-02-invalid-email-accepted.png') });
notes.push(`BUG-02: email "${badEmail}" accepted, landed on ${page.url()}`);

// ---------------------------------------------------------------- BUG-03
// The same address registers twice; the admin listing shows two rows.
const dupEmail = email('bug03');
for (const who of ['Nguoi Dung Goc', 'Nguoi Dung Trung']) {
  await fillRegister({ name: who, email: dupEmail, password: 'Password 123' });
  await page.getByRole('button', { name: 'Đăng Ký' }).click();
  await page.waitForURL(/\/login$/, { timeout: 10_000 });
}
const auth = await page.request.post(`${API}/api/login`, {
  // Password per the seed script, not per setup_guide.md - see BUG-06.
  data: { email: 'admin@eshop.com', password: 'Admin123!' },
});
const { token } = await auth.json();
const list = await page.request.get(`${API}/api/admin/users`, {
  headers: { Authorization: `Bearer ${token}` },
});
const dupRows = (await list.json()).filter(u => u.email === dupEmail);
notes.push(`BUG-03: ${dupRows.length} rows share e-mail ${dupEmail} -> ${JSON.stringify(dupRows)}`);

// Render the raw evidence as a readable page so the screenshot is legible.
await page.setContent(`<pre style="font:14px/1.6 monospace;padding:24px;white-space:pre-wrap">
BUG-03 — Duplicate e-mail creates multiple accounts
GET ${API}/api/admin/users  (filtered on "${dupEmail}")

${JSON.stringify(dupRows, null, 2)}

Rows found: ${dupRows.length}   (expected: 1)
</pre>`);
await page.screenshot({ path: path.join(outDir, 'BUG-03-duplicate-email-rows.png'), fullPage: true });

// ---------------------------------------------------------------- BUG-04
// The login response echoes the stored password verbatim.
const plainEmail = email('bug04');
const plainPassword = 'Password 123';
await page.request.post(`${API}/api/register`, {
  data: { name: 'Plain Text', email: plainEmail, password: plainPassword },
});
const loginRes = await page.request.post(`${API}/api/login`, {
  data: { email: plainEmail, password: plainPassword },
});
const loginBody = await loginRes.json();
notes.push(`BUG-04: login response user.password = "${loginBody.user.password}" (sent "${plainPassword}")`);
await page.setContent(`<pre style="font:14px/1.6 monospace;padding:24px;white-space:pre-wrap">
BUG-04 — Password stored and returned in plaintext
POST ${API}/api/login

${JSON.stringify(loginBody, null, 2)}

Password sent at registration : "${plainPassword}"
Password echoed by the API    : "${loginBody.user.password}"
Identical                     : ${loginBody.user.password === plainPassword}
</pre>`);
await page.screenshot({ path: path.join(outDir, 'BUG-04-plaintext-password.png'), fullPage: true });

await browser.close();

writeFileSync(path.join(outDir, 'evidence-notes.txt'),
  `Captured ${new Date().toISOString()} by 23127195\n\n${notes.join('\n')}\n`);
console.log(notes.join('\n'));
console.log(`\nScreenshots written to ${outDir}`);
