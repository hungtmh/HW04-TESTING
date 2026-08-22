// FR-15 — Quản lý sản phẩm (Admin CRUD) | 23127060 Ninh Văn Khải
// Data-driven: tests/data/fr15-product-cases.json + fr15-product-fields.csv.
// Assertion pattern: A1 (UI text) · A3 (API state) · A4 (boundary/số học) · A5 (dialog).
// Lưu ý: frontend-admin là SPA 1 file không có router => không assert URL (A2 không áp dụng ở đây).
import { test, expect } from '@playwright/test';
import { AdminProductPage } from './pages/AdminProductPage.js';
import { loadJson, loadCsv, uniqueEmail, uniqueProductName } from './utils/data.js';
import { API_BASE_URL, SEED_ACCOUNTS, SEED_PRODUCT_COUNT } from './utils/env.js';
import { annotate, freshUser as makeUser } from './utils/fixtures.js';
import {
  cleanupProduct,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  loginUser,
  updateProduct,
} from './utils/api.js';

const cases = loadJson('fr15-product-cases.json');
const fieldRows = loadCsv('fr15-product-fields.csv');

const byId = (id) => {
  const c = cases.find((x) => x.id === id);
  if (!c) throw new Error(`Không có case ${id} trong fr15-product-cases.json`);
  return c;
};

/** Gắn mã bug + dòng source vào test để HTML report truy vết được test <-> bug. */
const trace = (info, c, patterns) =>
  annotate(info, { bug: c.bug, source: c.source, patterns });

/** Token admin — lấy qua API để bơm thẳng vào localStorage, tránh login UI lặp lại 10 lần. */
async function adminToken(request) {
  const { token } = await loginUser(request, SEED_ACCOUNTS.admin);
  return token;
}

/** Đổi sentinel trong CSV thành giá trị thật. */
function materializeName(value) {
  if (value === '__UNIQUE__') return uniqueProductName('CSV');
  if (value === '__EMPTY__') return '';
  if (value === '__SPACES__') return '   ';
  if (value === '__MISSING__') return undefined;
  return value;
}

function materializePrice(value) {
  if (value === undefined || value === '') return undefined;
  return /^-?\d+$/.test(value) ? Number(value) : value;
}

test.describe('FR-15 Admin product CRUD', () => {
  // ---------------------------------------------------------------- luồng UI
  test(`FR15-${byId('TC01').id} ${byId('TC01').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC01');
    trace(test.info(), c, ['A1','A3','A4']);
    const admin = new AdminProductPage(page);
    await admin.goto();

    // Đăng nhập bằng UI THẬT (yêu cầu §2.1 SKILL)
    const dialog = await admin.loginUi(SEED_ACCOUNTS.admin.email, SEED_ACCOUNTS.admin.password);
    expect(dialog, 'A5: admin hợp lệ thì không có alert nào').toBeNull();

    await admin.openProductsTab();
    // A1 — vào đúng màn hình
    await expect(page.getByRole('heading', { name: c.expect.heading })).toBeVisible();
    // A4 — bảng có ít nhất số sản phẩm seed (trừ 1 dòng header)
    const uiRows = await admin.visibleRowCount();
    expect(uiRows, 'A4').toBeGreaterThanOrEqual(c.expect.minRows);
    expect(c.expect.minRows, 'kiểm tra dữ liệu test khớp seed của SUT').toBe(SEED_PRODUCT_COUNT);

    // GAP-01 (Phase 4): assertion cũ chỉ so hằng số với hằng số nên không kiểm thử gì cả.
    // A3 — bảng trên UI phải khớp đúng dữ liệu backend trả về.
    const apiProducts = await getProducts(request);
    expect(uiRows, 'A3: số dòng UI khớp số sản phẩm backend').toBe(apiProducts.length);
  });

  test(`FR15-${byId('TC02').id} ${byId('TC02').title} @fr15`, async ({ page }) => {
    const c = byId('TC02');
    trace(test.info(), c, ['A5','A1']);
    const admin = new AdminProductPage(page);
    await admin.goto();

    const dialog = await admin.loginUi(SEED_ACCOUNTS.user.email, SEED_ACCOUNTS.user.password);
    // A5 — FE chặn tài khoản không phải admin
    expect(dialog, 'A5').toContain(c.expect.dialog);
    // A1 — vẫn ở màn đăng nhập, không lọt vào console
    await expect(admin.loginHeading, 'A1').toBeVisible();
    await expect(admin.productsTab, 'A1: không thấy sidebar').toBeHidden();
  });

  test(`FR15-${byId('TC03').id} ${byId('TC03').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC03');
    trace(test.info(), c, ['A1','A3','A4']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));
    await admin.goto();
    await admin.openProductsTab();

    const name = uniqueProductName('TC03');
    await expect(admin.addFormTitle, 'tiền đề: form đang ở chế độ thêm mới').toBeVisible();
    const res = await admin.fillAndSave({ ...c.product, name }, 'POST');
    expect(res.status(), 'A3').toBe(200);

    // A1 — sản phẩm xuất hiện trong bảng
    await expect(admin.rowByName(name), 'A1').toHaveCount(1);
    // A3 — và thực sự nằm trong CSDL với đúng giá
    const products = await getProducts(request);
    const created = products.find((p) => p.name === name);
    expect(created, 'A3').toBeTruthy();
    expect(Number(created.price), 'A4').toBe(Number(c.product.price));

    await cleanupProduct(request, created.id);
  });

  test(`FR15-${byId('TC04').id} ${byId('TC04').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC04');
    trace(test.info(), c, ['A5','A3']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));

    const originalName = uniqueProductName('TC04');
    const created = await createProduct(
      request,
      { ...c.product, name: originalName, category_id: 1 },
      undefined,
    );

    await admin.goto();
    await admin.openProductsTab();
    await admin.startEditing(originalName);

    const newName = `${originalName}-DASUA`;
    const dialogPromise = admin.captureNextDialog();
    const res = await admin.fillAndSave({ name: newName }, 'PUT');
    expect(res.status(), 'A3').toBe(200);
    // A5 — SUT báo bằng alert
    expect(await dialogPromise, 'A5').toContain(c.expect.dialog);

    // A3 — CSDL đã đổi đúng sản phẩm đó
    const after = await getProductById(request, created.body.id);
    expect(after.body.name, 'A3').toBe(newName);

    await cleanupProduct(request, created.body.id);
  });

  test(`FR15-${byId('TC05').id} ${byId('TC05').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC05'); // BUG-15-01 — fake mass update
    trace(test.info(), c, ['A1','A3','A4']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));

    const targetName = uniqueProductName('TC05');
    const created = await createProduct(
      request,
      { ...c.product, name: targetName, category_id: 1 },
      undefined,
    );

    await admin.goto();
    await admin.openProductsTab();
    await expect(admin.rowByName(targetName), 'tiền đề: bảng đã nạp xong sản phẩm mục tiêu').toHaveCount(1);

    await admin.startEditing(targetName);
    // GAP-02 (Phase 4): đếm số dòng NGAY TRƯỚC khi bấm Lưu. Bản trước đếm sớm hơn nhiều thao tác,
    // nếu một worker song song thêm/xoá sản phẩm ở giữa thì mốc so sánh sẽ lệch => flaky.
    const totalRows = await admin.visibleRowCount();
    expect(totalRows, 'tiền đề: cần ≥3 sản phẩm để thấy hiệu ứng lan').toBeGreaterThanOrEqual(3);

    const newName = `${targetName}-LAN`;
    const dialogPromise = admin.captureNextDialog();
    await admin.fillAndSave({ name: newName }, 'PUT');
    await dialogPromise;

    // 🔴 A1 + A4 — sau khi sửa 1 sản phẩm, CẢ BẢNG mang cùng một tên
    const rowsWithNewName = await admin.countRowsWithName(newName);
    expect(rowsWithNewName, 'A4: số dòng bị đổi tên oan').toBeGreaterThan(
      c.expect.rowsWithNewNameGreaterThan,
    );
    expect(rowsWithNewName, 'A4: đúng bằng toàn bộ số dòng đang hiển thị').toBe(totalRows);

    // A3 — CSDL chỉ đổi đúng 1 bản ghi => khẳng định đây là lỗi FE, không phải lỗi backend
    const products = await getProducts(request);
    expect(
      products.filter((p) => p.name === newName).length,
      'A3: backend chỉ đổi 1 sản phẩm',
    ).toBe(c.expect.apiRowsWithNewName);

    await cleanupProduct(request, created.body.id);
  });

  test(`FR15-${byId('TC06').id} ${byId('TC06').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC06');
    trace(test.info(), c, ['A1','A3']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));

    const name = uniqueProductName('TC06');
    const created = await createProduct(
      request,
      { ...c.product, name, category_id: 1 },
      undefined,
    );

    await admin.goto();
    await admin.openProductsTab();
    await expect(admin.rowByName(name), 'tiền đề').toHaveCount(1);

    const res = await admin.deleteByName(name);
    expect(res.status(), 'A3').toBe(200);

    // A1 — biến mất khỏi bảng
    await expect(admin.rowByName(name), 'A1').toHaveCount(0);
    // A3 — và mất khỏi CSDL
    const products = await getProducts(request);
    expect(products.some((p) => p.id === created.body.id), 'A3').toBe(false);
  });

  test(`FR15-${byId('TC19').id} ${byId('TC19').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC19'); // BUG-15-11
    trace(test.info(), c, ['A1','A3']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));

    const marker = uniqueProductName('TC19');
    const payloadName = `${marker} ${c.payload}`;
    const created = await createProduct(
      request,
      { name: payloadName, price: 1000, description: '', imageUrl: '', category_id: 1 },
      undefined,
    );
    expect(created.status, 'A3: payload XSS được backend chấp nhận nguyên vẹn').toBe(200);

    await admin.goto();
    await admin.openProductsTab();

    // A3 — payload lưu y nguyên trong CSDL (rủi ro tồn đọng cho mọi màn hình render thô)
    const stored = await getProductById(request, created.body.id);
    expect(stored.body.name, 'A3: lưu verbatim').toBe(payloadName);

    // A1 — bảng admin render bằng {p.name} nên React escape, script KHÔNG chạy
    await expect(admin.rowByName(marker), 'A1: hiển thị dưới dạng văn bản').toHaveCount(1);
    // GAP-03 (Phase 4): bản trước viết `.toBe(!c.expect.scriptDidNotExecute)` — phủ định kép,
    // rất dễ đọc nhầm thành khẳng định ngược khi review. Viết thẳng ý nghĩa ra.
    const xssExecuted = await page.evaluate(() => window.__xss15 === 1);
    expect(xssExecuted, 'A1: script KHÔNG được thực thi ở bảng admin (React escape)').toBe(false);
    expect(c.expect.scriptDidNotExecute, 'kỳ vọng khai báo trong data file').toBe(true);

    await cleanupProduct(request, created.body.id);
  });

  test(`FR15-${byId('TC20').id} ${byId('TC20').title} @fr15`, async ({ page, request }) => {
    const c = byId('TC20');
    trace(test.info(), c, ['A1','A3']);
    const admin = new AdminProductPage(page);
    await admin.signInViaToken(await adminToken(request));
    await admin.goto();
    await admin.openProductsTab();

    // Đếm request POST /api/products thực sự rời khỏi trình duyệt
    let postCount = 0;
    page.on('request', (r) => {
      if (r.url().includes('/api/products') && r.method() === 'POST') postCount += 1;
    });

    await admin.priceInput.fill('999000'); // để trống ô Tên sản phẩm
    await admin.saveButton.click();

    // A1 — form vẫn hiện, không chuyển trạng thái
    await expect(admin.addFormTitle, 'A1').toBeVisible();
    await expect(admin.nameInput, 'A1: ô tên vẫn rỗng').toHaveValue('');
    // A3 — không có request nào được gửi: HTML5 `required` là lớp chặn duy nhất
    expect(postCount, 'A3: số POST đã gửi').toBe(0);
  });

  // --------------------------------------------------------------- luồng API
  test(`FR15-${byId('TC07').id} ${byId('TC07').title} @fr15`, async ({ request }) => {
    const c = byId('TC07'); // BUG-15-02
    trace(test.info(), c, ['A3','A1']);
    const name = uniqueProductName('TC07');

    // KHÔNG gửi Authorization
    const res = await createProduct(
      request,
      { name, price: 111000, description: 'no auth', imageUrl: '', category_id: 1 },
      undefined,
    );
    // A3 — endpoint quản trị nhận request hoàn toàn ẩn danh
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.message, 'A1').toBe(c.expect.message);

    const products = await getProducts(request);
    expect(products.some((p) => p.name === name), 'A3: đã ghi vào CSDL').toBe(true);

    await cleanupProduct(request, res.body.id);
  });

  test(`FR15-${byId('TC08').id} ${byId('TC08').title} @fr15`, async ({ request }) => {
    const c = byId('TC08'); // BUG-15-02
    trace(test.info(), c, ['A3','A1']);
    const created = await createProduct(
      request,
      { name: uniqueProductName('TC08'), price: 222000, category_id: 1 },
      undefined,
    );
    const newName = uniqueProductName('TC08-EDIT');

    const res = await updateProduct(
      request,
      created.body.id,
      { name: newName, price: 333000, description: '', imageUrl: '', category_id: 1 },
      undefined,
    );
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.message, 'A1').toBe(c.expect.message);

    const after = await getProductById(request, created.body.id);
    // A3 — sửa dữ liệu thành công mà không cần bất kỳ thông tin xác thực nào
    expect(after.body.name, 'A3').toBe(newName);

    await cleanupProduct(request, created.body.id);
  });

  test(`FR15-${byId('TC09').id} ${byId('TC09').title} @fr15`, async ({ request }) => {
    const c = byId('TC09'); // BUG-15-02
    trace(test.info(), c, ['A3','A1']);
    const created = await createProduct(
      request,
      { name: uniqueProductName('TC09'), price: 444000, category_id: 1 },
      undefined,
    );

    const res = await deleteProduct(request, created.body.id, undefined);
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.message, 'A1').toBe(c.expect.message);

    const products = await getProducts(request);
    // A3 — dữ liệu bị xoá vĩnh viễn bởi một request ẩn danh
    expect(products.some((p) => p.id === created.body.id), 'A3').toBe(!c.expect.goneFromList);
  });

  test(`FR15-${byId('TC10').id} ${byId('TC10').title} @fr15`, async ({ request }) => {
    const c = byId('TC10'); // BUG-15-03
    trace(test.info(), c, ['A3','A1']);
    const plainUser = await makeUser(request, {
      prefix: 'fr15-tc10',
      password: 'Plain User 12',
    });
    expect(plainUser.user.role, 'tiền đề: đúng là user thường').toBe('user');

    const name = uniqueProductName('TC10');
    const res = await createProduct(
      request,
      { name, price: 555000, description: 'by plain user', imageUrl: '', category_id: 1 },
      plainUser.token,
    );
    // A3 — token role=user vẫn tạo được sản phẩm => không phân quyền theo vai trò
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.message, 'A1').toBe(c.expect.message);

    await cleanupProduct(request, res.body.id);
  });

  test('FR15-TC21 list and detail endpoints disagree on the price type of the same product @fr15', async ({
    request,
  }) => {
    // BUG-15-09 nhìn ở góc nguy hiểm hơn TC17: không chỉ "id chẵn khác id lẻ", mà CÙNG MỘT sản phẩm
    // trả về hai kiểu dữ liệu khác nhau tuỳ theo client gọi endpoint nào. Frontend gọi cả hai
    // (Home.jsx dùng danh sách, ProductDetail.jsx dùng chi tiết) nên đây là bẫy thật, không lý thuyết.
    annotate(test.info(), {
      bug: 'BUG-15-09',
      source: 'server.js:158',
      patterns: ['A3', 'A4'],
    });

    const list = await getProducts(request);
    const evenIdProduct = list.find((p) => p.id % 2 === 0);
    expect(evenIdProduct, 'tiền đề: cần ít nhất 1 sản phẩm có id chẵn').toBeTruthy();

    const detail = await getProductById(request, evenIdProduct.id);

    // A3 — cùng id, hai endpoint, hai kiểu dữ liệu
    expect(typeof evenIdProduct.price, 'A3: GET /api/products trả number').toBe('number');
    expect(typeof detail.body.price, 'A3: GET /api/products/:id trả string').toBe('string');

    // A4 — giá trị thì bằng nhau, chỉ khác kiểu => lỗi rất dễ lọt qua review bằng mắt
    expect(Number(detail.body.price), 'A4: giá trị giống nhau').toBe(evenIdProduct.price);

    // A4 — hậu quả cụ thể: phép nhân số lượng ở client biến thành nối chuỗi
    const quantity = 2;
    expect(detail.body.price * quantity, 'A4: nhân thì JS tự ép kiểu, ra đúng').toBe(
      evenIdProduct.price * quantity,
    );
    expect(detail.body.price + quantity, 'A4: nhưng CỘNG thì thành nối chuỗi').toBe(
      `${evenIdProduct.price}${quantity}`,
    );
  });

  // -------------------------------------- bảng boundary trường dữ liệu (CSV)
  for (const row of fieldRows) {
    test(`FR15-${row.id} ${row.label} @fr15`, async ({ request }) => {
      trace(test.info(), row, ['A3', 'A4']);
      const expectedStatus = Number(row.expected_status);

      if (row.check === 'created') {
        const name = materializeName(row.name_value);
        const price = materializePrice(row.price_value);
        const payload = { price, description: row.label, imageUrl: '', category_id: Number(row.category_id) };
        if (name !== undefined) payload.name = name;

        const res = await createProduct(request, payload, undefined);
        // A3 — backend chấp nhận dữ liệu mà lẽ ra phải từ chối
        expect(res.status, `A3: ${row.source}`).toBe(expectedStatus);
        expect(res.body.id, 'A3: có id nghĩa là đã INSERT').toBeGreaterThan(0);

        const stored = await getProductById(request, res.body.id);

        if (row.id === 'TC11a') expect(stored.body.name, 'A3').toBe('');
        if (row.id === 'TC11b') expect(stored.body.name, 'A3').toBeNull();
        if (row.id === 'TC11c') expect(stored.body.name, 'A3').toBe('   ');
        if (row.id === 'TC12a' || row.id === 'TC12b') {
          // A4 — giá âm / bằng 0 vẫn nằm trong CSDL
          expect(Number(stored.body.price), 'A4').toBe(Number(row.price_value));
        }
        if (row.id === 'TC13') {
          // A3 — cột khai báo INTEGER nhưng chứa chuỗi chữ
          expect(Number.isFinite(Number(stored.body.price)), 'A3: price không phải số').toBe(false);
        }
        if (row.id === 'TC14a') {
          // A4 — vượt MAX_SAFE_INTEGER thì giá trị đọc lại KHÁC giá trị gửi lên
          expect(String(stored.body.price), 'A4: mất chính xác số nguyên').not.toBe(
            row.price_value,
          );
        }
        if (row.id === 'TC14b') {
          expect(String(stored.body.price), 'A4: đúng tại mốc MAX_SAFE_INTEGER').toBe(
            row.price_value,
          );
        }
        if (row.id === 'TC18') {
          // A3 — category_id trỏ vào danh mục không tồn tại vẫn được lưu
          expect(Number(stored.body.category_id), 'A3').toBe(Number(row.category_id));
          const categories = await request
            .get(`${API_BASE_URL}/categories`)
            .then((r) => r.json());
          expect(
            categories.some((cat) => cat.id === Number(row.category_id)),
            'A3: danh mục này không hề tồn tại',
          ).toBe(false);
        }

        await cleanupProduct(request, res.body.id);
        return;
      }

      if (row.check === 'delete_missing') {
        const res = await deleteProduct(request, row.probe_id, undefined);
        // A3 — xoá một id không tồn tại vẫn báo thành công
        expect(res.status, `A3: ${row.source}`).toBe(expectedStatus);
        expect(res.body.message, 'A1').toBe('Product deleted');
        return;
      }

      if (row.check === 'get_missing') {
        const res = await getProductById(request, row.probe_id);
        // A3 — đáng lẽ 404, thực tế 200 với body rỗng
        expect(res.status, `A3: ${row.source}`).toBe(expectedStatus);
        expect(res.body, 'A3: body rỗng thay vì lỗi 404').toEqual({});
        return;
      }

      if (row.check === 'get_even') {
        const res = await getProductById(request, row.probe_id);
        expect(res.status, `A3: ${row.source}`).toBe(expectedStatus);
        const isEven = Number(row.probe_id) % 2 === 0;
        // A3 — kiểu dữ liệu của cùng một trường phụ thuộc vào id chẵn/lẻ
        expect(typeof res.body.price, `A3: id ${row.probe_id} ${isEven ? 'chẵn' : 'lẻ'}`).toBe(
          isEven ? 'string' : 'number',
        );
      }
    });
  }
});
