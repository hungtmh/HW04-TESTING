// Chụp ảnh minh chứng bug bằng Playwright THẬT (không vẽ, không ghép).
// Mỗi hàm dưới đây tái hiện đúng các bước ghi trong BUG_REPORT.md rồi chụp màn hình
// tại đúng thời điểm triệu chứng lộ ra, kèm in ra log JSON của response thật.
//
// Chạy:  node scripts/capture-bug-evidence.mjs [bug-id ...]
// Ảnh ra: ../evidence/bugs/<BUG-ID>.png
import { chromium, request as pwRequest } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, '..', 'evidence', 'bugs');
mkdirSync(OUT_DIR, { recursive: true });

const API = process.env.API_BASE_URL || 'http://localhost:3000/api';
const WEB = process.env.WEB_BASE_URL || 'http://localhost:5173';
const ADMIN = process.env.ADMIN_BASE_URL || 'http://localhost:5174';

const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const email = (p) => `evi-${p}-${stamp()}@eshop.test`;
const PASSWORD = 'Evi Dence 123';

const log = [];
function note(bugId, line) {
  const entry = `[${bugId}] ${line}`;
  log.push(entry);
  console.log(entry);
}

async function shot(page, bugId, label = '') {
  const file = resolve(OUT_DIR, `${bugId}.png`);
  await page.screenshot({ path: file, fullPage: true });
  note(bugId, `📸 ${file}${label ? ` — ${label}` : ''}`);
}

async function newUser(api, prefix) {
  const mail = email(prefix);
  await api.post(`${API}/register`, { data: { name: 'Evidence', email: mail, password: PASSWORD } });
  const res = await api.post(`${API}/login`, { data: { email: mail, password: PASSWORD } });
  const body = await res.json();
  return { email: mail, token: body.token, user: body.user };
}

// ─────────────────────────────────────────────────────── FR-03
async function bug0301(browser) {
  // FE chặn mật khẩu MẠNH vì regex đòi khoảng trắng và cấm ký tự đặc biệt.
  const id = 'BUG-03-01';
  const api = await pwRequest.newContext();
  const u = await newUser(api, 'b0301');
  const page = await browser.newPage();

  await page.goto(`${WEB}/forgot-password`);
  await page.getByRole('textbox').first().fill(u.email);
  await page.getByRole('button', { name: 'Lấy mã OTP' }).click();
  const banner = page.getByText(/Mã OTP của bạn là:/);
  await banner.waitFor();
  const otp = (await banner.textContent()).match(/(\d{4})/)[1];

  await page.getByRole('textbox').first().fill(otp);
  await page.locator('input[type="password"]').fill('NewPass123!');

  // Chụp TRƯỚC khi bấm: form đã điền OTP đúng + mật khẩu mạnh 'NewPass123!'.
  await shot(page, id, "form đã điền OTP đúng và mật khẩu mạnh 'NewPass123!'");

  // TUYỆT ĐỐI KHÔNG chụp màn hình bên trong dialog handler: alert() chặn renderer,
  // page.screenshot() sẽ treo 30s rồi timeout (đã gặp thật ở lần chạy đầu).
  // Chỉ lấy nội dung alert ra làm log rồi accept ngay.
  const message = await new Promise((res) => {
    page.once('dialog', async (d) => {
      const m = d.message();
      await d.accept();
      res(m);
    });
    page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
  });
  note(id, `alert: ${message}`);

  // Sau khi đóng alert: vẫn kẹt ở bước 2, mật khẩu chưa hề được đổi.
  await page.locator('input[type="password"]').waitFor();
  await page.screenshot({ path: resolve(OUT_DIR, `${id}-after.png`), fullPage: true });
  note(id, `📸 ${resolve(OUT_DIR, `${id}-after.png`)} — vẫn ở bước 2, mật khẩu KHÔNG được đổi`);

  const login = await api.post(`${API}/login`, {
    data: { email: u.email, password: 'NewPass123!' },
  });
  note(id, `POST /api/login bằng 'NewPass123!' ⇒ ${login.status()} (mật khẩu mạnh bị FE chặn nên không hề được đặt)`);
  await api.dispose();
  await page.close();
}

async function bug0302(browser) {
  // resetToken lộ nguyên văn trên màn hình + trong response body.
  const id = 'BUG-03-02';
  const api = await pwRequest.newContext();
  const u = await newUser(api, 'b0302');

  const res = await api.post(`${API}/forgot-password`, { data: { email: u.email } });
  note(id, `POST /api/forgot-password ⇒ ${res.status()} ${JSON.stringify(await res.json())}`);

  const page = await browser.newPage();
  await page.goto(`${WEB}/forgot-password`);
  await page.getByRole('textbox').first().fill(u.email);
  await page.getByRole('button', { name: 'Lấy mã OTP' }).click();
  await page.getByText(/Mã OTP của bạn là:/).waitFor();
  await shot(page, id, 'OTP hiện thẳng trên UI');
  await api.dispose();
  await page.close();
}

async function bug0308(browser) {
  // Đổi mật khẩu thành công nhưng tài khoản vẫn bị khoá.
  const id = 'BUG-03-08';
  const api = await pwRequest.newContext();
  const u = await newUser(api, 'b0308');

  for (let i = 0; i < 2; i += 1) {
    await api.post(`${API}/login`, { data: { email: u.email, password: 'sai-mat-khau' } });
  }
  const tok = await api.post(`${API}/forgot-password`, { data: { email: u.email } });
  const { resetToken } = await tok.json();
  const reset = await api.post(`${API}/reset-password`, {
    data: { email: u.email, resetToken, newPassword: 'Unlock Me 12' },
  });
  note(id, `POST /api/reset-password ⇒ ${reset.status()} ${JSON.stringify(await reset.json())}`);

  const page = await browser.newPage();
  await page.goto(`${WEB}/login`);
  const boxes = page.getByRole('textbox');
  await boxes.first().fill(u.email);
  await boxes.nth(1).fill('Unlock Me 12');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByText('Đăng nhập thất bại').waitFor();
  await shot(page, id, 'đổi mật khẩu xong vẫn không đăng nhập được');

  const login = await api.post(`${API}/login`, {
    data: { email: u.email, password: 'Unlock Me 12' },
  });
  note(id, `POST /api/login (mật khẩu MỚI) ⇒ ${login.status()} ${JSON.stringify(await login.json())}`);
  await api.dispose();
  await page.close();
}

// ─────────────────────────────────────────────────────── FR-08
async function bug0801(browser) {
  // Sửa ô tổng tiền xuống 1 ₫ rồi thanh toán thành công.
  const id = 'BUG-08-01';
  const api = await pwRequest.newContext();
  const u = await newUser(api, 'b0801');
  const page = await browser.newPage();
  await page.addInitScript((t) => window.localStorage.setItem('token', t), u.token);

  await page.goto(`${WEB}/`);
  await page.getByRole('button', { name: 'Thoát' }).waitFor();
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

  const spin = page.getByRole('spinbutton');
  await spin.waitFor();
  note(id, `Tổng tiền FE tính: ${await spin.inputValue()} ₫`);
  await spin.fill('1');
  await shot(page, id, 'ô tổng tiền bị sửa xuống 1 ₫ trước khi bấm xác nhận');

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/checkout')),
    page.getByRole('button', { name: 'Xác Nhận Thanh Toán' }).click(),
  ]);
  await page.getByRole('heading', { name: 'Thanh toán thành công!' }).waitFor();
  await page.screenshot({ path: resolve(OUT_DIR, `${id}-success.png`), fullPage: true });
  note(id, `📸 ${resolve(OUT_DIR, `${id}-success.png`)} — màn hình thanh toán thành công`);

  const orders = await api
    .get(`${API}/orders/my-orders`, { headers: { Authorization: `Bearer ${u.token}` } })
    .then((r) => r.json());
  note(id, `Đơn hàng trong CSDL: ${JSON.stringify(orders[0])}`);
  await api.dispose();
  await page.close();
}

async function bug0807(browser) {
  // Coupon percent làm TĂNG tổng tiền gấp 10.
  const id = 'BUG-08-07';
  const api = await pwRequest.newContext();
  const u = await newUser(api, 'b0807');
  const page = await browser.newPage();
  await page.addInitScript((t) => window.localStorage.setItem('token', t), u.token);

  await page.goto(`${WEB}/`);
  await page.getByRole('button', { name: 'Thoát' }).waitFor();
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();

  const spin = page.getByRole('spinbutton');
  await spin.waitFor();
  const before = await spin.inputValue();
  await page.getByPlaceholder('Nhập mã giảm giá...').fill('SAVE10');
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/apply-coupon')),
    page.getByRole('button', { name: 'Áp dụng' }).click(),
  ]);
  const body = await res.json();
  note(id, `Tổng trước khi áp mã: ${before} ₫`);
  note(id, `POST /api/apply-coupon ⇒ ${res.status()} ${JSON.stringify(body)}`);
  note(id, `⇒ giảm 10% nhưng thành tiền GẤP ${Number(body.final_amount) / Number(before)} LẦN`);
  await page.getByText(/Thành tiền:/).waitFor();
  await shot(page, id, 'UI báo "Áp dụng thành công! Giảm 10%" nhưng thành tiền tăng 10 lần');
  await api.dispose();
  await page.close();
}

async function bug0804(browser) {
  // IDOR: đọc đơn hàng người khác không cần token.
  const id = 'BUG-08-04';
  const api = await pwRequest.newContext();
  const victim = await newUser(api, 'b0804v');
  const order = await api
    .post(`${API}/checkout`, {
      data: { total_amount: 777777, shipping_address: 'Địa chỉ riêng tư của nạn nhân' },
      headers: { Authorization: `Bearer ${victim.token}` },
    })
    .then((r) => r.json());
  note(id, `Nạn nhân (user_id=${victim.user.id}) tạo đơn #${order.orderId}`);

  const anon = await pwRequest.newContext(); // context sạch, KHÔNG có token nào
  const res = await anon.get(`${API}/orders/${order.orderId}`);
  note(id, `GET /api/orders/${order.orderId} KHÔNG token ⇒ ${res.status()} ${JSON.stringify(await res.json())}`);

  // Chụp bằng cách mở thẳng URL API trong trình duyệt sạch => ảnh chứng minh không cần đăng nhập.
  const page = await browser.newPage();
  await page.goto(`${API}/orders/${order.orderId}`);
  await shot(page, id, 'mở API trong trình duyệt chưa đăng nhập vẫn thấy đơn của người khác');
  await api.dispose();
  await anon.dispose();
  await page.close();
}

// ─────────────────────────────────────────────────────── FR-15
async function bug1501(browser) {
  // Fake mass update: sửa 1 sản phẩm, cả bảng đổi tên.
  const id = 'BUG-15-01';
  const api = await pwRequest.newContext();
  const admin = await api
    .post(`${API}/login`, { data: { email: 'admin@eshop.com', password: 'Admin123!' } })
    .then((r) => r.json());

  const target = `EVIDENCE-${stamp()}`;
  const created = await api
    .post(`${API}/products`, {
      data: { name: target, price: 1000000, description: 'evidence', imageUrl: '', category_id: 1 },
    })
    .then((r) => r.json());

  const page = await browser.newPage();
  await page.addInitScript((t) => window.localStorage.setItem('adminToken', t), admin.token);
  await page.goto(ADMIN);
  await page.getByText('Sản phẩm', { exact: true }).click();
  await page.getByRole('button', { name: 'Sửa' }).first().waitFor();

  const beforeRows = (await page.getByRole('row').count()) - 1;
  await page.screenshot({ path: resolve(OUT_DIR, `${id}-before.png`), fullPage: true });
  note(id, `📸 ${resolve(OUT_DIR, `${id}-before.png`)} — bảng TRƯỚC khi sửa (${beforeRows} sản phẩm, tên khác nhau)`);

  await page.getByRole('row').filter({ hasText: target }).getByRole('button', { name: 'Sửa' }).click();
  const newName = `${target}-DOI-TEN`;
  await page.getByPlaceholder('Tên sản phẩm').fill(newName);
  page.on('dialog', (d) => d.accept());
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/products') && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Lưu sản phẩm' }).click(),
  ]);
  await page.getByRole('row').filter({ hasText: newName }).first().waitFor();

  const affected = await page.getByRole('row').filter({ hasText: newName }).count();
  await shot(page, id, `bảng SAU khi sửa: ${affected}/${beforeRows} dòng cùng mang tên "${newName}"`);

  const inDb = await api.get(`${API}/products`).then((r) => r.json());
  note(id, `UI: ${affected} dòng mang tên mới · CSDL: ${inDb.filter((p) => p.name === newName).length} bản ghi ⇒ lỗi nằm ở FRONTEND`);

  await api.delete(`${API}/products/${created.id}`);
  await api.dispose();
  await page.close();
}

async function bug1502(browser) {
  // CRUD sản phẩm không cần bất kỳ xác thực nào.
  const id = 'BUG-15-02';
  const anon = await pwRequest.newContext(); // KHÔNG có token
  const name = `NOAUTH-${stamp()}`;

  const create = await anon.post(`${API}/products`, {
    data: { name, price: 99000, description: 'tạo bởi request ẩn danh', imageUrl: '', category_id: 1 },
  });
  const created = await create.json();
  note(id, `POST /api/products KHÔNG token ⇒ ${create.status()} ${JSON.stringify(created)}`);

  const update = await anon.put(`${API}/products/${created.id}`, {
    data: { name: `${name}-DASUA`, price: 1, description: 'sửa bởi request ẩn danh', imageUrl: '', category_id: 1 },
  });
  note(id, `PUT  /api/products/${created.id} KHÔNG token ⇒ ${update.status()} ${JSON.stringify(await update.json())}`);

  const page = await browser.newPage();
  await page.goto(`${API}/products`);
  await shot(page, id, 'sản phẩm do request ẩn danh tạo/sửa đã nằm trong danh sách công khai');

  const del = await anon.delete(`${API}/products/${created.id}`);
  note(id, `DELETE /api/products/${created.id} KHÔNG token ⇒ ${del.status()} ${JSON.stringify(await del.json())}`);

  const ghost = await anon.delete(`${API}/products/99999999`);
  note(id, `DELETE /api/products/99999999 (id không tồn tại) ⇒ ${ghost.status()} ${JSON.stringify(await ghost.json())} — BUG-15-07`);

  await anon.dispose();
  await page.close();
}

const CAPTURES = {
  'BUG-03-01': bug0301,
  'BUG-03-02': bug0302,
  'BUG-03-08': bug0308,
  'BUG-08-01': bug0801,
  'BUG-08-04': bug0804,
  'BUG-08-07': bug0807,
  'BUG-15-01': bug1501,
  'BUG-15-02': bug1502,
};

const wanted = process.argv.slice(2);
const todo = Object.entries(CAPTURES).filter(([id]) => wanted.length === 0 || wanted.includes(id));

const browser = await chromium.launch();
for (const [id, fn] of todo) {
  console.log(`\n──────── ${id} ────────`);
  try {
    await fn(browser);
  } catch (err) {
    console.error(`[${id}] ❌ LỖI KHI CHỤP: ${err.message}`);
    log.push(`[${id}] ❌ LỖI KHI CHỤP: ${err.message}`);
  }
}
await browser.close();

const logFile = resolve(OUT_DIR, 'capture-log.txt');
writeFileSync(logFile, `${new Date().toISOString()}\n\n${log.join('\n')}\n`, 'utf8');
console.log(`\n📄 Log minh chứng: ${logFile}`);
