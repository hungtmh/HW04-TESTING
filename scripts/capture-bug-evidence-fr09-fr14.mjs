#!/usr/bin/env node
/**
 * Captures screenshot evidence for the FR-09 and FR-14 defects, for attaching
 * to GitHub Issues. Companion to capture-bug-evidence.mjs, which covers FR-01.
 *
 * Usage: node scripts/capture-bug-evidence-fr09-fr14.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const WEB = process.env.WEB_BASE_URL || 'http://localhost:5173';
const ADMIN = process.env.ADMIN_BASE_URL || 'http://localhost:5174';
const API = process.env.API_BASE_URL || 'http://localhost:3000';
const outDir = path.join('23127195', 'evidence', 'bugs');
mkdirSync(outDir, { recursive: true });

const stamp = Date.now().toString(36);
const uniq = p => `${p}.${stamp}.${Math.random().toString(36).slice(2, 7)}@eshop-test.local`;
const notes = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

/** Renders arbitrary text as a legible page so a screenshot can carry API data. */
async function shotText(file, title, body) {
  await page.setContent(
    `<pre style="font:14px/1.6 ui-monospace,monospace;padding:24px;white-space:pre-wrap">${title}\n\n${body}</pre>`,
  );
  await page.screenshot({ path: path.join(outDir, file), fullPage: true });
}

const api = {
  post: async (p, body, token) => {
    const res = await page.request.post(`${API}${p}`, {
      data: body, headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { status: res.status(), body: await res.json().catch(() => null) };
  },
  put: async (p, body, token) => {
    const res = await page.request.put(`${API}${p}`, {
      data: body, headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { status: res.status(), body: await res.json().catch(() => null) };
  },
  del: async (p, token) => {
    const res = await page.request.delete(`${API}${p}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { status: res.status(), body: await res.json().catch(() => null) };
  },
  get: async p => (await page.request.get(`${API}${p}`)).json(),
};

const adminLogin = await api.post('/api/login', { email: 'admin@eshop.com', password: 'Admin123!' });
const adminToken = adminLogin.body.token;

// A logged-in customer, needed to reach /checkout.
const custEmail = uniq('coupon');
await api.post('/api/register', { name: 'Coupon Evidence', email: custEmail, password: 'Password 123' });
const cust = await api.post('/api/login', { email: custEmail, password: 'Password 123' });

// ---------------------------------------------------------------- BUG-07
// The percent formula is total*(1-value) instead of total*value/100.
await page.addInitScript(t => window.localStorage.setItem('token', t), cust.body.token);
await page.goto(`${WEB}/checkout`);
await page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' }).waitFor();
await page.locator('input[type="number"]').fill('500000');
await page.getByPlaceholder('Nhập mã giảm giá...').fill('SAVE10');
await page.getByRole('button', { name: 'Áp dụng' }).click();
await page.locator('div.text-green-700').waitFor();
await page.screenshot({ path: path.join(outDir, 'BUG-07-percent-coupon-overcharge.png') });
notes.push(`BUG-07 UI: ${(await page.locator('div.text-green-700').innerText()).replace(/\n/g, ' | ')}`);

const b07 = await api.post('/api/apply-coupon', { code: 'SAVE10', total_amount: 500000 });
await shotText('BUG-07-percent-coupon-api.png',
  'BUG-07 - Percent coupon inverts the discount formula',
  `POST ${API}/api/apply-coupon  {"code":"SAVE10","total_amount":500000}\n\n` +
  `${JSON.stringify(b07.body, null, 2)}\n\n` +
  `Expected discount : 50000   (10% of 500000)\n` +
  `Actual discount   : ${b07.body.discount_amount}\n` +
  `Expected payable  : 450000\n` +
  `Actual payable    : ${b07.body.final_amount}   <-- customer is charged 10x`);
notes.push(`BUG-07 API: discount=${b07.body.discount_amount} final=${b07.body.final_amount}`);

// ---------------------------------------------------------------- BUG-08
const atMin = await api.post('/api/apply-coupon', { code: 'BIGBUY', total_amount: 500000 });
const above = await api.post('/api/apply-coupon', { code: 'BIGBUY', total_amount: 500001 });
await shotText('BUG-08-min-order-boundary.png',
  'BUG-08 - Minimum-order threshold excludes the boundary value',
  `Coupon BIGBUY has min_order_amount = 500000, advertised as "tối thiểu 500,000 đ".\n\n` +
  `total_amount = 500000  ->  HTTP ${atMin.status}  ${JSON.stringify(atMin.body)}\n` +
  `total_amount = 500001  ->  HTTP ${above.status}  ${JSON.stringify(above.body)}\n\n` +
  `An order of exactly the stated minimum is refused: server.js uses\n` +
  `  if (total_amount > coupon.min_order_amount)\n` +
  `where the advertised rule is ">=".`);
notes.push(`BUG-08: total=500000 -> ${atMin.status}; total=500001 -> ${above.status}`);

// ---------------------------------------------------------------- BUG-09
const seed = await api.post('/api/apply-coupon', { code: 'VIP100', total_amount: 800000, user_id: cust.body.user.id });
for (let i = 0; i < 2; i++) {
  await api.post('/api/coupon-usage', { coupon_id: seed.body.coupon_id }, cust.body.token);
}
const withId = await api.post('/api/apply-coupon', { code: 'VIP100', total_amount: 800000, user_id: cust.body.user.id });
const withoutId = await api.post('/api/apply-coupon', { code: 'VIP100', total_amount: 800000 });
await shotText('BUG-09-usage-limit-bypass.png',
  'BUG-09 - Per-user usage limit is skipped when user_id is omitted',
  `VIP100 allows max_uses_per_user = 2. The customer below has already used it twice.\n\n` +
  `WITH user_id     -> HTTP ${withId.status}  ${JSON.stringify(withId.body)}\n` +
  `WITHOUT user_id  -> HTTP ${withoutId.status}  ${JSON.stringify(withoutId.body)}\n\n` +
  `The handler only checks coupon_usage inside "if (user_id)", so dropping the\n` +
  `field skips the limit entirely and the coupon can be reused without bound.`);
notes.push(`BUG-09: with user_id -> ${withId.status}, without -> ${withoutId.status}`);

// ---------------------------------------------------------------- BUG-10
const before = await api.get('/api/categories');
const blank = await api.post('/api/categories', { name: '' }, adminToken);
const missing = await api.post('/api/categories', {}, adminToken);
const afterBlank = await api.get('/api/categories');
await shotText('BUG-10-blank-category-name.png',
  'BUG-10 - Category name is not validated',
  `POST /api/categories {"name":""}  -> HTTP ${blank.status}  ${JSON.stringify(blank.body)}\n` +
  `POST /api/categories {}           -> HTTP ${missing.status}  ${JSON.stringify(missing.body)}\n\n` +
  `Rows before: ${before.length}   Rows after: ${afterBlank.length}\n\n` +
  `${JSON.stringify(afterBlank.filter(c => !c.name), null, 2)}\n\n` +
  `Both requests are accepted; the table now holds a row with an empty name and\n` +
  `a row with a NULL name, neither of which can be selected meaningfully.`);
notes.push(`BUG-10: blank -> ${blank.status}, missing -> ${missing.status}`);
for (const c of afterBlank) if (!c.name) await api.del(`/api/categories/${c.id}`, adminToken);

// ---------------------------------------------------------------- BUG-11
const userEmail = uniq('catuser');
await api.post('/api/register', { name: 'Normal User', email: userEmail, password: 'Password 123' });
const normal = await api.post('/api/login', { email: userEmail, password: 'Password 123' });
const hacked = await api.post('/api/categories', { name: 'Tao boi user thuong' }, normal.body.token);
const target = await api.post('/api/categories', { name: 'Muc tieu bi xoa' }, adminToken);
const delByUser = await api.del(`/api/categories/${target.body.id}`, normal.body.token);
await shotText('BUG-11-category-access-control.png',
  'BUG-11 - Any authenticated customer can manage categories',
  `Account role: ${normal.body.user.role}\n\n` +
  `POST   /api/categories        -> HTTP ${hacked.status}  ${JSON.stringify(hacked.body)}\n` +
  `DELETE /api/categories/${target.body.id}  -> HTTP ${delByUser.status}  ${JSON.stringify(delByUser.body)}\n\n` +
  `Expected HTTP 403 for both. authenticateToken only verifies the JWT signature\n` +
  `and never inspects req.user.role, so category management is open to every\n` +
  `logged-in customer.`);
notes.push(`BUG-11: role=${normal.body.user.role} create -> ${hacked.status}, delete -> ${delByUser.status}`);
if (hacked.body?.id) await api.del(`/api/categories/${hacked.body.id}`, adminToken);

// ---------------------------------------------------------------- BUG-12
const putGhost = await api.put('/api/categories/999999', { name: 'Ghost' }, adminToken);
const delGhost = await api.del('/api/categories/999999', adminToken);
await shotText('BUG-12-nonexistent-id-reports-success.png',
  'BUG-12 - Operations on a non-existent id report success',
  `PUT    /api/categories/999999 -> HTTP ${putGhost.status}  ${JSON.stringify(putGhost.body)}\n` +
  `DELETE /api/categories/999999 -> HTTP ${delGhost.status}  ${JSON.stringify(delGhost.body)}\n\n` +
  `Expected HTTP 404 for both. Neither handler inspects this.changes, so the API\n` +
  `confirms updates and deletions that never touched a row.`);
notes.push(`BUG-12: PUT ghost -> ${putGhost.status}, DELETE ghost -> ${delGhost.status}`);

// ---------------------------------------------------------------- BUG-13
const cat = await api.post('/api/categories', { name: `Danh muc co san pham ${stamp}` }, adminToken);
await api.post('/api/products', {
  name: `San pham mo coi ${stamp}`, price: 199000,
  description: 'evidence', imageUrl: '', category_id: cat.body.id,
}, adminToken);
const delUsed = await api.del(`/api/categories/${cat.body.id}`, adminToken);
const orphans = (await api.get('/api/products')).filter(p => p.category_id === cat.body.id);
await shotText('BUG-13-delete-category-orphans-products.png',
  'BUG-13 - Deleting a category in use orphans its products',
  `Category #${cat.body.id} was created and one product was assigned to it.\n\n` +
  `DELETE /api/categories/${cat.body.id} -> HTTP ${delUsed.status}  ${JSON.stringify(delUsed.body)}\n\n` +
  `Products still pointing at the deleted category: ${orphans.length}\n` +
  `${JSON.stringify(orphans.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })), null, 2)}\n\n` +
  `Expected HTTP 409 and no deletion. There is no foreign key and no usage check,\n` +
  `so the products keep a category_id that no longer resolves.`);
notes.push(`BUG-13: delete used category -> ${delUsed.status}, orphaned products = ${orphans.length}`);

// ---------------------------------------------------------------- BUG-14
const uiCat = await api.post('/api/categories', { name: `Danh muc kiem tra nut sua ${stamp}` }, adminToken);
await page.goto(ADMIN);
await page.getByPlaceholder('Email').fill('admin@eshop.com');
await page.getByPlaceholder('Password').fill('Admin123!');
await page.getByRole('button', { name: 'Login' }).click();
await page.locator('li').filter({ hasText: /^Danh mục$/ }).first().click();
await page.getByRole('heading', { name: 'Quản lý Danh mục' }).waitFor();
await page.screenshot({ path: path.join(outDir, 'BUG-14-no-edit-control.png') });
const actions = await page.locator('table tbody tr').first().locator('button, a').allInnerTexts();
notes.push(`BUG-14: row actions offered by the admin UI = ${JSON.stringify(actions)}`);
await api.del(`/api/categories/${uiCat.body.id}`, adminToken);

await browser.close();

writeFileSync(path.join(outDir, 'evidence-notes-fr09-fr14.txt'),
  `Captured ${new Date().toISOString()} by 23127195\n\n${notes.join('\n')}\n`);
console.log(notes.join('\n'));
console.log(`\nScreenshots written to ${outDir}`);
