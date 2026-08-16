const { test, expect } = require('@playwright/test');
const { AdminImportPage } = require('./pages/AdminImportPage');
const { readJson } = require('./utils/csv');
const { API_BASE_URL, ADMIN_BASE_URL, stampRun } = require('./utils/env');
const { createCustomer, loginAdmin, importProductsCSV, listProducts } = require('./utils/api');
const path = require('path');
const fs = require('fs');

const data = readJson('fr16-import-cases.json');

test.describe('FR-16: Product Import from CSV', () => {
  let adminToken;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-16 CSV Import');
    adminToken = await loginAdmin(request, data.adminAccount);
  });

  // TC01: Valid CSV import success
  test('TC01: Valid CSV import success', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    const filePath = path.resolve(__dirname, 'data/fr16-valid-products.csv');
    await importPage.selectFile(filePath);
    
    // [P1] Element count (Preview rows)
    await expect(importPage.previewTableRows).toHaveCount(3);
    
    await importPage.importButton.click();
    
    // [P2] Element text visibility
    await expect(importPage.successMessage).toBeVisible();
    await expect(importPage.successMessage).toContainText(data.messages.successPrefix);
    await expect(importPage.successMessage).toContainText('3/3');
  });

  // TC02: Preview shows data before import
  test('TC02: Preview shows data before import', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    const filePath = path.resolve(__dirname, 'data/fr16-valid-products.csv');
    await importPage.selectFile(filePath);
    
    // Check first row preview
    const firstRowText = await importPage.previewTableRows.nth(0).innerText();
    expect(firstRowText).toContain('Imported Product 1');
  });

  // TC03: Download template works
  test('TC03: Download template link has correct format', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    // [P3] DOM-property assertion
    await expect(importPage.templateLink).toHaveAttribute('download', 'template_import.csv');
    await expect(importPage.templateLink).toHaveAttribute('href', /data:text\/csv/);
  });

  // TC04: File input accepts file
  test('TC04: Select file enables import button', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    await expect(importPage.importButton).toBeDisabled();
    
    const filePath = path.resolve(__dirname, 'data/fr16-valid-products.csv');
    await importPage.selectFile(filePath);
    
    await expect(importPage.importButton).toBeEnabled();
  });

  // TC05: Invalid CSV missing name
  test('TC05: Invalid CSV (missing name) reports error', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    const filePath = path.resolve(__dirname, 'data/fr16-invalid-products.csv');
    await importPage.selectFile(filePath);
    await importPage.importButton.click();
    
    await expect(importPage.successMessage).toBeVisible();
    // It says "inserted 2/3" but with errors listed
    const text = await importPage.successMessage.innerText();
    expect(text).toContain('Thiếu tên sản phẩm');
  });

  // TC06: Only admin can import via API
  test('TC06: Non-admin users cannot import products via API', async ({ request }) => {
    const customer = await createCustomer(request);
    
    const res = await importProductsCSV(request, customer.token, [{
      name: 'Hack', price: 100, category_id: 1
    }]);
    
    // [P4] API Assertion
    // Currently SUT doesn't check role, so it might return 200 (BUG-CSV-04)
    // We expect 403 Forbidden. Soft assert to let it fail without stopping test.
    expect.soft(res.status).toBe(403);
  });

  // TC07: Unauthenticated users cannot import
  test('TC07: Unauthenticated users cannot import products', async ({ request }) => {
    const res = await importProductsCSV(request, null, [{
      name: 'Hack', price: 100, category_id: 1
    }]);
    
    expect(res.status).toBe(401);
  });

  // TC08: Empty data array API
  test('TC08: Empty products array returns 400', async ({ request }) => {
    const res = await importProductsCSV(request, adminToken, []);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: data.messages.noData });
  });

  // TC09: @bug Import fails should rollback entire transaction
  test('TC09: @bug Import with errors should rollback all rows (all-or-nothing)', async ({ request }) => {
    // Record current count
    const beforeCount = (await listProducts(request)).length;
    
    // Import mixed valid/invalid
    await importProductsCSV(request, adminToken, [
      { name: 'Rollback 1', price: 1000, category_id: 1 },
      { name: '', price: 1000, category_id: 1 } // error
    ]);
    
    const afterCount = (await listProducts(request)).length;
    
    // [P5] Backend side-effect / Database state assertion
    // SUT BUG: It inserts "Rollback 1" and ignores the second, leaving count = beforeCount + 1.
    // SRS Expectation: Should rollback, so count = beforeCount
    expect.soft(afterCount).toBe(beforeCount);
    await expect(afterCount).toBe(beforeCount); // Force fail
  });

  // TC10: @bug Price must be positive
  test('TC10: @bug Price must be positive (validation)', async ({ request }) => {
    const res = await importProductsCSV(request, adminToken, [
      { name: 'Negative Price Prod', price: -500, category_id: 1 }
    ]);
    
    // SUT BUG: It accepts negative price and returns 200
    // SRS Expectation: Price must be > 0.
    expect.soft(res.status).not.toBe(200);
    expect(res.body.errors || []).not.toHaveLength(0); // Force fail
  });

  // TC11: @bug RFC4180 CSV with quotes containing commas
  test('TC11: @bug CSV parser should handle commas inside quotes', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    const filePath = path.resolve(__dirname, 'data/fr16-rfc4180-quoted.csv');
    await importPage.selectFile(filePath);
    
    // SUT BUG: frontend uses .split(',') which breaks the row into too many columns.
    // The "Product, with comma" will be split into "Product" and " with comma".
    const firstRowCells = importPage.previewTableRows.nth(0).locator('td');
    
    // SRS Expectation: cell 1 is "Product, with comma", cell 2 is "100000"
    const cell1 = await firstRowCells.nth(0).innerText();
    const cell2 = await firstRowCells.nth(1).innerText();
    
    expect.soft(cell1).toBe('Product, with comma');
    expect.soft(cell2).toBe('100000');
    // It will actually be cell1="Product", cell2=" with comma"
    expect(cell1).toBe('Product, with comma');
  });

  // TC12: @bug Input should filter .csv only
  test('TC12: @bug File input should only accept .csv files', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    
    // [P3] DOM-property
    await expect(importPage.fileInput).toHaveAttribute('accept', '.csv');
  });

});
// Minor update to FR-16
