// Captures evidence PNGs for the three FR-05 defects. For API-level defects the
// JSON/HTML response is rendered onto the page so a single screenshot shows the
// proof. Output goes to 23127195/evidence/bugs/.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const WEB = 'http://localhost:5173';
const API = 'http://localhost:3000';
const OUT = '23127195/evidence/bugs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// ---- BUG-16: reflected XSS in the search-result banner --------------------
{
  const page = await browser.newPage();
  await page.goto(WEB);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Tìm kiếm...').fill('<img src=x onerror="window.__xss_fr05=1">');
  await page.getByRole('button', { name: 'Tìm' }).click();
  await page.waitForTimeout(600);
  const fired = await page.evaluate(() => window.__xss_fr05 === 1);
  await page.evaluate((fired) => {
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;z-index:9999;'
      + 'font:14px monospace;background:' + (fired ? '#c53030' : '#2f855a') + ';color:#fff';
    b.textContent = 'BUG-16  window.__xss_fr05 === 1  ->  ' + fired
      + '   (payload người dùng nhập đã THỰC THI như script)';
    document.body.prepend(b);
  }, fired);
  await page.screenshot({ path: `${OUT}/BUG-16-search-reflected-xss.png`, fullPage: true });
  await page.close();
  console.log(`BUG-16  xss fired = ${fired}`);
}

// ---- BUG-17: SQL injection tautology returns the whole table ---------------
{
  const page = await browser.newPage();
  const inj = await (await fetch(`${API}/api/products?search=${encodeURIComponent("' OR '1'='1")}`)).json();
  const legit = await (await fetch(`${API}/api/products?search=${encodeURIComponent('zzz-khong-ton-tai')}`)).json();
  await page.setContent(`
    <div style="font:14px/1.5 monospace;padding:20px;color:#16181d">
      <h2 style="color:#c53030">BUG-17 — SQL injection trong GET /api/products?search=</h2>
      <p>Từ khoá <b>' OR '1'='1</b> không phải tên sản phẩm nào, đúng ra phải trả 0.</p>
      <p style="color:#c53030;font-size:18px"><b>Thực tế trả về ${inj.length} sản phẩm</b> (toàn bộ bảng):</p>
      <pre style="background:#f7f8fa;padding:12px;border-left:4px solid #c53030">${
        inj.map((p) => `#${p.id}  ${p.name}`).join('\n')}</pre>
      <p>Đối chứng — từ khoá vô hại không khớp trả về đúng ${legit.length}:</p>
      <pre style="background:#f0fff4;padding:12px;border-left:4px solid #2f855a">${JSON.stringify(legit)}</pre>
      <p style="color:#555">Nguồn: server.js — <code>WHERE name LIKE '%${'${searchQuery}'}%'</code> nối chuỗi trực tiếp.</p>
    </div>`);
  await page.screenshot({ path: `${OUT}/BUG-17-search-sql-injection.png`, fullPage: true });
  await page.close();
  console.log(`BUG-17  tautology returned ${inj.length} rows (expected 0)`);
}

// ---- BUG-18: special char -> 500 + raw SQL error leaked --------------------
{
  const page = await browser.newPage();
  const res = await fetch(`${API}/api/products?search=${encodeURIComponent("%'")}`);
  const body = await res.text();
  await page.setContent(`
    <div style="font:14px/1.5 monospace;padding:20px;color:#16181d">
      <h2 style="color:#c53030">BUG-18 — Ký tự đặc biệt làm vỡ truy vấn, rò rỉ lỗi SQL</h2>
      <p>Yêu cầu: <code>GET /api/products?search=%'</code></p>
      <p><b>HTTP status:</b> <span style="color:#c53030;font-size:18px">${res.status}</span>
         &nbsp; <b>content-type:</b> ${res.headers.get('content-type')}</p>
      <p><b>Body trả về (rò rỉ chi tiết SQL nội bộ ra client):</b></p>
      <pre style="background:#f7f8fa;padding:12px;border-left:4px solid #c53030">${
        body.replace(/</g, '&lt;')}</pre>
    </div>`);
  await page.screenshot({ path: `${OUT}/BUG-18-search-sql-error-leak.png`, fullPage: true });
  await page.close();
  console.log(`BUG-18  status=${res.status}`);
}

await browser.close();
console.log('FR-05 evidence captured.');
