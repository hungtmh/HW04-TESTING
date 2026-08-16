const { test, expect } = require('@playwright/test');
const { AdminCategoryPage } = require('./pages/AdminCategoryPage');
const { readCsv, readJson } = require('./utils/csv');
const { stampRun } = require('./utils/env');
const {
  createCustomer,
  loginAdmin,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  listProducts,
} = require('./utils/api');

/**
 * ============================================================================
 * HW04 - Automation Testing | FR-14: Quản lý danh mục (Category CRUD)
 * Student: 23127195
 * ============================================================================
 *
 * DATA-DRIVEN: tests/data/fr14-category-names.csv + fr14-category-cases.json.
 *
 * ASSERTION PATTERNS (>= 3 required; six used, tagged [P1]..[P6]):
 *   [P1] Navigation / view assertion - heading + tab visible
 *   [P2] Web-first element/text      - toBeVisible() / toContainText()
 *   [P3] Collection assertion        - toContain() / not.toContain() on the rendered list
 *   [P4] Back-end API assertion      - HTTP status + body via toMatchObject()
 *   [P5] Element-count assertion     - toHaveCount()
 *   [P6] Cross-layer consistency     - the UI table must equal GET /api/categories
 *
 * Tests tagged @bug assert the SPECIFIED behaviour and currently fail; each
 * maps to a defect in 23127195/bug-report/BUG_REPORT.md.
 *
 * ISOLATION: every test invents its own category name (suffixed with a run-unique
 * token) and deletes what it created, so the shared SQLite file never carries
 * state from one test into the next.
 */

const nameCases = readCsv('fr14-category-names.csv');
const data = readJson('fr14-category-cases.json');

// The two blank-name rows assert validation the SUT does not perform (BUG-10).
const BUGGY_NAME_CASES = new Set(['TC-05', 'TC-06']);

const runToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const scoped = base => `${base} [${runToken}]`;

/** Resolves the CSV placeholder for the length-boundary case. */
function resolveName(raw) {
  if (raw === 'GENERATE_255') return 'C'.repeat(255);
  return raw;
}

/**
 * Removes whatever a test added, comparing the category list before and after.
 *
 * Human review finding R-11: the first version only cleaned up on the happy
 * path. The tests that assert "this must be refused" leave a row behind
 * precisely when they catch a bug, so every buggy case silently grew the
 * table and a later cross-layer test started failing on the accumulated
 * rubbish rather than on anything it was written to check.
 */
async function cleanupAdded(request, token, before, after) {
  const knownIds = new Set(before.map(c => c.id));
  for (const row of after) {
    if (!knownIds.has(row.id)) await deleteCategory(request, token, row.id);
  }
}

test.describe('FR-14 | Quản lý danh mục', () => {
  // The `request` fixture is test-scoped, so the token cannot be fetched in a
  // beforeAll hook. Caching it in module scope gives the same "log in once"
  // behaviour while keeping the admin account away from the lockout described
  // in BUG-06.
  let cachedAdminToken = null;
  let adminToken;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-14 Quản lý danh mục');
    if (!cachedAdminToken) cachedAdminToken = await loginAdmin(request, data.adminAccount);
    adminToken = cachedAdminToken;
  });

  // ==========================================================================
  // GROUP 1 - Create through the admin UI (CSV) : TC-01 .. TC-06
  // ==========================================================================
  test.describe('Nhóm 1 - Tạo danh mục trên giao diện (CSV)', () => {
    for (const row of nameCases) {
      const isBug = BUGGY_NAME_CASES.has(row.tc_id);
      const title = `${row.tc_id} - ${row.label} -> ${row.expected}${isBug ? ' @bug' : ''}`;

      test(title, async ({ page, request }) => {
        test.info().annotations.push(
          { type: 'test-case', description: row.tc_id },
          { type: 'rule', description: row.rule },
          { type: 'note', description: row.note },
        );
        if (isBug) {
          test.info().annotations.push({
            type: 'bug',
            description: 'BUG-10 - tên danh mục rỗng/khoảng trắng vẫn tạo được',
          });
        }

        const admin = new AdminCategoryPage(page, data.adminBaseUrl);
        await admin.loginAsAdmin(data.adminAccount);
        await admin.openCategoriesTab();

        const before = await listCategories(request);
        const rawName = resolveName(row.name);
        const name = row.expected === 'accepted' ? scoped(rawName) : rawName;

        await admin.addCategory(name);

        const after = await listCategories(request);
        let uiNames = null;
        if (row.expected === 'accepted') {
          // Wait for the SPA to actually render the new row before reading the
          // table. Without this a slow re-render (seen on Firefox) lets the read
          // race the create and the row is missed - a false red on a test that
          // is meant to pass. Ask the DOM to settle; never sleep.
          await expect(admin.rowByName(name)).toBeVisible();
          uiNames = await admin.visibleCategoryNames();
        }

        // Always restore the table, including when the assertion below is about
        // to fail: a refused-but-actually-created row would otherwise persist.
        await cleanupAdded(request, adminToken, before, after);

        if (row.expected === 'accepted') {
          // [P4] the row really exists in the back end
          expect(after.length, 'a valid name must create exactly one row').toBe(before.length + 1);
          // [P3] and it is rendered in the table
          expect(uiNames).toContain(name);
        } else {
          // [P4] Specified behaviour: a blank name is not a category name, so
          // no row may be created. The SUT stores "" and even null -> BUG-10.
          expect(
            after.length,
            `blank name "${JSON.stringify(row.name)}" must not create a category row`,
          ).toBe(before.length);
        }
      });
    }
  });

  // ==========================================================================
  // GROUP 2 - Read : TC-07
  // ==========================================================================
  test(`${data.read.tc_id} - ${data.read.label}`, async ({ page, request }) => {
    test.info().annotations.push({ type: 'test-case', description: data.read.tc_id });

    // Plant a row this test owns rather than relying on the seeded names: the
    // delete tests legitimately remove categories, so asserting on "Điện thoại"
    // would make this test depend on execution order (human review finding R-11).
    const marker = scoped('Danh muc kiem tra hien thi');
    const created = await createCategory(request, adminToken, marker);
    expect(created.status).toBe(200);

    const admin = new AdminCategoryPage(page, data.adminBaseUrl);
    await admin.loginAsAdmin(data.adminAccount);
    await admin.openCategoriesTab();

    const fromApi = (await listCategories(request)).map(c => (c.name ?? '').trim());
    const fromUi = await admin.visibleCategoryNames();

    await deleteCategory(request, adminToken, created.body.id);

    // [P5] the table shows one row per stored category
    expect(fromUi.length).toBe(fromApi.length);
    // [P6] cross-layer consistency: what the admin sees is what is stored
    expect(fromUi).toEqual(fromApi);
    // [P2] including the row planted for this test
    expect(fromUi).toContain(marker);
  });

  // ==========================================================================
  // GROUP 3 - Update : TC-08 (UI) [@bug], TC-09 (API), TC-10 [@bug]
  // ==========================================================================
  test(`${data.update.uiControl.tc_id} - ${data.update.uiControl.label} @bug`, async ({ page, request }) => {
    const c = data.update.uiControl;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-14 - giao diện quản lý danh mục thiếu hoàn toàn chức năng Sửa' },
    );

    const name = scoped('Danh muc kiem tra nut sua');
    const created = await createCategory(request, adminToken, name);
    expect(created.status).toBe(200);

    const admin = new AdminCategoryPage(page, data.adminBaseUrl);
    await admin.loginAsAdmin(data.adminAccount);
    await admin.openCategoriesTab();

    const actions = await admin.rowActionLabels(name);
    await deleteCategory(request, adminToken, created.body.id);

    // [P3] FR-14 is specified as full CRUD and PUT /api/categories/:id exists,
    // so the admin screen must expose a way to rename a category. It offers
    // only "Xóa" -> the Update operation is unreachable from the UI.
    expect(
      actions.join(' | '),
      `row actions offered by the UI: ${JSON.stringify(actions)}`,
    ).toMatch(new RegExp(c.expectedControlPattern));
  });

  test(`${data.update.viaApi.tc_id} - ${data.update.viaApi.label}`, async ({ request }) => {
    const c = data.update.viaApi;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    const original = scoped(c.originalName);
    const renamed = scoped(c.newName);

    const created = await createCategory(request, adminToken, original);
    expect(created.status).toBe(200);

    const res = await updateCategory(request, adminToken, created.body.id, renamed);
    // [P4] status + body shape
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Category updated' });

    const after = await listCategories(request);
    const row = after.find(x => x.id === created.body.id);
    expect(row.name).toBe(renamed);
    expect(after.map(x => x.name)).not.toContain(original);

    await deleteCategory(request, adminToken, created.body.id);
  });

  test(`${data.update.nonExistent.tc_id} - ${data.update.nonExistent.label} @bug`, async ({ request }) => {
    const c = data.update.nonExistent;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-12 - thao tác trên id không tồn tại vẫn báo thành công' },
    );

    const res = await updateCategory(request, adminToken, c.id, c.name);
    // [P4] Updating something that does not exist must not report success.
    // The handler never inspects this.changes, so it always answers 200.
    expect(
      res.status,
      `PUT /api/categories/${c.id} on a non-existent row must not return success`,
    ).toBe(c.expectedStatus);
  });

  // ==========================================================================
  // GROUP 4 - Delete : TC-11 (UI), TC-12 [@bug], TC-13 [@bug]
  // ==========================================================================
  test(`${data.delete.viaUi.tc_id} - ${data.delete.viaUi.label}`, async ({ page, request }) => {
    const c = data.delete.viaUi;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    const name = scoped(c.name);
    const created = await createCategory(request, adminToken, name);
    expect(created.status).toBe(200);

    const admin = new AdminCategoryPage(page, data.adminBaseUrl);
    await admin.loginAsAdmin(data.adminAccount);
    await admin.openCategoriesTab();

    // [P3] present before the action
    expect(await admin.visibleCategoryNames()).toContain(name);

    await admin.deleteCategoryRow(name);

    // [P5] the row disappears from the table
    await expect(admin.rowByName(name)).toHaveCount(0);
    // [P4] and from the back end
    expect((await listCategories(request)).map(x => x.id)).not.toContain(created.body.id);
  });

  test(`${data.delete.nonExistent.tc_id} - ${data.delete.nonExistent.label} @bug`, async ({ request }) => {
    const c = data.delete.nonExistent;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-12 - thao tác trên id không tồn tại vẫn báo thành công' },
    );

    const res = await deleteCategory(request, adminToken, c.id);
    // [P4]
    expect(
      res.status,
      `DELETE /api/categories/${c.id} on a non-existent row must not return success`,
    ).toBe(c.expectedStatus);
  });

  test(`${data.delete.withProducts.tc_id} - ${data.delete.withProducts.label} @bug`, async ({ request }) => {
    const c = data.delete.withProducts;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-13 - xoá danh mục đang có sản phẩm làm sản phẩm mồ côi' },
    );

    const catName = scoped(c.categoryName);
    const prodName = scoped(c.productName);

    const cat = await createCategory(request, adminToken, catName);
    expect(cat.status).toBe(200);
    const categoryId = cat.body.id;

    const prod = await createProduct(request, adminToken, {
      name: prodName,
      price: c.productPrice,
      description: 'Created by FR-14 automated test',
      imageUrl: '',
      category_id: categoryId,
    });
    expect(prod.status).toBe(200);

    const res = await deleteCategory(request, adminToken, categoryId);
    const orphans = (await listProducts(request)).filter(p => p.category_id === categoryId);

    // [P4] Referential integrity: a category still referenced by products must
    // not be removable. The SUT deletes it and leaves the products pointing at
    // a category id that no longer exists.
    expect(
      { status: res.status, orphanedProducts: orphans.length },
      'deleting a category in use must be refused and must not orphan products',
    ).toMatchObject({ status: c.expectedStatus, orphanedProducts: 0 });
  });

  // ==========================================================================
  // GROUP 5 - Access control : TC-14 .. TC-16 [@bug], TC-17
  // ==========================================================================
  test.describe('Nhóm 5 - Phân quyền', () => {
    for (const c of data.accessControl) {
      test(`${c.tc_id} - ${c.label} @bug`, async ({ request }) => {
        test.info().annotations.push(
          { type: 'test-case', description: c.tc_id },
          { type: 'bug', description: 'BUG-11 - người dùng thường toàn quyền CRUD danh mục' },
        );

        const customer = await createCustomer(request);
        expect(customer.token).toBeTruthy();
        const before = await listCategories(request);

        let res;
        if (c.action === 'create') {
          res = await createCategory(request, customer.token, scoped(c.name));
        } else {
          // Arrange a target row with admin rights, then attack it as a customer.
          const target = await createCategory(request, adminToken, scoped(`Target ${c.tc_id}`));
          expect(target.status).toBe(200);
          res = c.action === 'update'
            ? await updateCategory(request, customer.token, target.body.id, scoped(c.name))
            : await deleteCategory(request, customer.token, target.body.id);
          await deleteCategory(request, adminToken, target.body.id);
        }

        // A successful attack leaves a row behind; remove it before asserting.
        await cleanupAdded(request, adminToken, before, await listCategories(request));

        // [P4] authenticateToken only verifies the JWT signature and never
        // inspects req.user.role, so every logged-in customer is an admin
        // as far as category management is concerned.
        expect(
          res.status,
          `a role="user" account must not be able to ${c.action} a category`,
        ).toBe(c.expectedStatus);
      });
    }
  });

  test(`${data.unauthenticated.tc_id} - ${data.unauthenticated.label}`, async ({ request }) => {
    const c = data.unauthenticated;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    const before = await listCategories(request);
    const res = await createCategory(request, undefined, scoped(c.name));
    const after = await listCategories(request);

    // [P4] no token at all must be rejected outright
    expect(res.status).toBe(c.expectedStatus);
    // [P5] and nothing may be written
    expect(after.length).toBe(before.length);
  });
});
