const { test, expect } = require('@playwright/test');
const path = require('path');
const { AdminImportPage } = require('./pages/AdminImportPage');
const { readJson } = require('./utils/csv');
const { stampRun } = require('./utils/env');
const { createCustomer, loginAdmin, importProductsCSV, listProducts } = require('./utils/api');

const data = readJson('fr16-import-cases.json');
const dataFile = filename => path.resolve(__dirname, 'data', filename);

test.describe('FR-16: Product Import from CSV', () => {
  let adminToken;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-16 CSV Import');
    adminToken = await loginAdmin(request, data.adminAccount);
  });

  test('TC01: Valid CSV imports every previewed row', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await importPage.selectFile(dataFile('fr16-valid-products.csv'));
    await expect(importPage.previewTableRows).toHaveCount(3);
    await importPage.importButton.click();
    await expect(importPage.successMessage).toContainText(data.messages.successPrefix);
    await expect(importPage.successMessage).toContainText('3/3');
  });

  test('TC02: Preview renders CSV data before import', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await importPage.selectFile(dataFile('fr16-valid-products.csv'));
    await expect(importPage.previewTableRows.first()).toContainText('Imported Product 1');
  });

  test('TC03: Download template exposes the required CSV filename', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await expect(importPage.templateLink).toHaveAttribute('download', data.expected.templateDownload);
    await expect(importPage.templateLink).toHaveAttribute('href', /data:text\/csv/);
  });

  test('TC04: Selecting a CSV enables the import action', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await expect(importPage.importButton).toBeDisabled();
    await importPage.selectFile(dataFile('fr16-valid-products.csv'));
    await expect(importPage.importButton).toBeEnabled();
  });

  test('TC05: Invalid CSV reports the row-level reason', async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await importPage.selectFile(dataFile('fr16-invalid-products.csv'));
    await importPage.importButton.click();
    await expect(importPage.successMessage).toContainText('Thiếu tên sản phẩm');
  });

  test('TC06: @bug Non-admin token cannot call the admin import API', { tag: '@bug' }, async ({ request }) => {
    const customer = await createCustomer(request);
    const response = await importProductsCSV(request, customer.token, data.apiPayloads.nonAdmin);
    expect(response.status).toBe(403);
  });

  test('TC07: Missing token is rejected', async ({ request }) => {
    const response = await importProductsCSV(request, null, data.apiPayloads.nonAdmin);
    expect(response.status).toBe(401);
  });

  test('TC08: Empty product array is rejected', async ({ request }) => {
    const response = await importProductsCSV(request, adminToken, []);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: data.messages.noData });
  });

  test('TC09: @bug Any invalid row rolls back the complete import', { tag: '@bug' }, async ({ request }) => {
    const before = (await listProducts(request)).length;
    await importProductsCSV(request, adminToken, data.apiPayloads.mixedRows);
    const after = (await listProducts(request)).length;
    expect(after).toBe(before);
  });

  test('TC10: @bug Price must be strictly positive', { tag: '@bug' }, async ({ request }) => {
    const response = await importProductsCSV(request, adminToken, data.apiPayloads.negativePrice);
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
  });

  test('TC11: @bug RFC 4180 quoted commas remain in one field', { tag: '@bug' }, async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await importPage.selectFile(dataFile('fr16-rfc4180-quoted.csv'));
    const cells = importPage.previewTableRows.first().locator('td');
    await expect(cells.nth(0)).toHaveText(data.expected.quotedName);
    await expect(cells.nth(1)).toHaveText(data.expected.quotedPrice);
  });

  test('TC12: @bug File picker restricts selection to CSV', { tag: '@bug' }, async ({ page }) => {
    const importPage = new AdminImportPage(page);
    await importPage.goto();
    await importPage.login(data.adminAccount.email, data.adminAccount.password);
    await expect(importPage.fileInput).toHaveAttribute('accept', data.expected.acceptAttribute);
  });
});
