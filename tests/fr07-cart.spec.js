const { test, expect } = require('@playwright/test');
const { CartPage } = require('./pages/CartPage');
const { LoginPage } = require('./pages/LoginPage');
const { readCsv, readJson } = require('./utils/csv');
const { stampRun } = require('./utils/env');
const { createCustomer } = require('./utils/api');

const products = readCsv('fr07-cart-products.csv');
const data = readJson('fr07-cart-cases.json');
const parseMoney = text => Number(text.replace(/[^0-9]/g, ''));

test.describe('FR-07: Shopping Cart', () => {
  let customer;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-07 Shopping Cart');
    customer = await createCustomer(request);
  });

  test('TC01: Empty cart shows a friendly message and shopping link', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await expect(cart.emptyStateHeading).toHaveText(data.messages.emptyState);
    await expect(cart.continueShoppingLink).toBeVisible();
  });

  test('TC02: Empty-cart shopping link returns to home', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.continueShoppingLink.click();
    await expect(page).toHaveURL('/');
  });

  for (const [index, product] of products.entries()) {
    test(`TC${String(index + 3).padStart(2, '0')}: CSV product ${product.productName} has correct quantity and subtotal`, async ({ page }) => {
      const cart = new CartPage(page);
      await page.goto('/');
      await cart.addProductByName(product.productName, Number(product.quantity));
      await cart.openFromHeader();
      await expect(cart.tableRows).toHaveCount(1);
      const row = cart.getProductRow(0);
      await expect(row.name).toContainText(product.productName);
      await expect(row.quantity).toHaveText(product.quantity);
      expect(parseMoney(await row.subtotal.innerText())).toBe(Number(product.expectedSubtotal));
    });
  }

  test('TC07: Multiple products produce the exact total', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addProductByName(products[0].productName, 1);
    await cart.addProductByName(products[1].productName, 1);
    await cart.openFromHeader();
    const expectedTotal = Number(products[0].price) + Number(products[1].price);
    expect(parseMoney(await cart.totalAmount.innerText())).toBe(expectedTotal);
  });

  test('TC08: Removing one item updates the cart', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(2);
    await cart.openFromHeader();
    await expect(cart.tableRows).toHaveCount(2);
    page.on('dialog', dialog => dialog.accept());
    await cart.getProductRow(0).removeBtn.click();
    await expect(cart.tableRows).toHaveCount(1);
  });

  test('TC09: Removing the last item returns to empty state', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    page.on('dialog', dialog => dialog.accept());
    await cart.getProductRow(0).removeBtn.click();
    await expect(cart.emptyStateHeading).toHaveText(data.messages.emptyState);
  });

  test('TC10: Unauthenticated checkout shows warning and redirects to login', async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe(data.messages.loginRequired);
      await dialog.accept();
    });
    await cart.checkoutButton.click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC11: Authenticated checkout opens the checkout page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(customer.email, customer.password);
    const cart = new CartPage(page);
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    await cart.checkoutButton.click();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('TC12: @bug Re-adding a product increases quantity without a duplicate row', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addProductByName(products[0].productName, 1);
    await cart.addProductByName(products[0].productName, 1);
    await cart.openFromHeader();
    await expect(cart.tableRows).toHaveCount(1);
    await expect(cart.getProductRow(0).quantity).toHaveText('2');
  });

  test('TC13: @bug Removing an item requires confirmation', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    const dialogPromise = page.waitForEvent('dialog', { timeout: 2_000 });
    await cart.getProductRow(0).removeBtn.click();
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('confirm');
    await dialog.dismiss();
    await expect(cart.tableRows).toHaveCount(1);
  });

  test('TC14: @bug Cart total uses the required label', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    await expect(cart.totalLabel).toContainText(data.expected.totalLabel);
  });

  test('TC15: @bug Every item has plus and minus quantity controls', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    await expect(cart.getProductRow(0).quantity.locator('button')).toHaveCount(data.expected.quantityButtonCount);
  });

  test('TC16: @bug Empty state includes an illustration', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await expect(page.locator('.text-center img, .text-center svg')).toHaveCount(1);
  });

  test('TC17: @bug Non-empty cart uses the exact continue-shopping label', { tag: '@bug' }, async ({ page }) => {
    const cart = new CartPage(page);
    await page.goto('/');
    await cart.addFirstProducts(1);
    await cart.openFromHeader();
    await expect(cart.continueShoppingLink).toHaveText(data.expected.continueShopping);
  });
});
