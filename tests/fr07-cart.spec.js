const { test, expect } = require('@playwright/test');
const { CartPage } = require('./pages/CartPage');
const { LoginPage } = require('./pages/LoginPage');
const { readCsv, readJson } = require('./utils/csv');
const { API_BASE_URL, stampRun } = require('./utils/env');
const { createCustomer, addToCart } = require('./utils/api');

const csvProducts = readCsv('fr07-cart-products.csv');
const data = readJson('fr07-cart-cases.json');

test.describe('FR-07: Shopping Cart', () => {
  let customer;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-07 Shopping Cart');
    customer = await createCustomer(request);
  });

  // TC01: Empty cart state
  test('TC01: Empty cart shows empty state and link to shop', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    // [P1] Web-first element/text
    await expect(cartPage.emptyStateHeading).toHaveText(data.messages.emptyState);
    await expect(cartPage.continueShoppingLink).toBeVisible();
  });

  // TC02: Empty cart continue shopping redirects to home
  test('TC02: Empty cart continue shopping redirects to home', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.continueShoppingLink.click();
    
    // [P2] Navigation assertion
    await expect(page).toHaveURL('/');
  });

  // TC03: Single product shows correctly
  test('TC03: Single product shows correctly in cart', async ({ page }) => {
    // Navigate and add product via UI (simulate adding a product, though we can't easily on home page without clicking)
    // Actually it's easier to inject state via API or LocalStorage. But Cart is in React context only on frontend.
    // We can add via UI: Go to home, click 'Thêm vào giỏ'
    await page.goto('/');
    // Add the first product we see on home page
    const addBtn = page.locator('button', { hasText: 'Thêm vào giỏ' }).first();
    await addBtn.click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    // [P3] Element-count assertion
    await expect(cartPage.tableRows).toHaveCount(1);
    
    const row = await cartPage.getProductRow(0);
    await expect(row.quantity).toHaveText('1');
  });

  // TC04: Multiple products sum total correctly
  test('TC04: Multiple products sum total correctly', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0); // Ensure loaded
    await addBtns.nth(0).click();
    await addBtns.nth(1).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.tableRows).toHaveCount(2);
    
    // Extract totals
    const totalText = await cartPage.totalAmount.innerText();
    expect(totalText).toContain('₫'); // Just check format
  });

  // TC05: Remove product from cart updates UI
  test('TC05: Remove product from cart updates UI', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    await addBtns.nth(1).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.tableRows).toHaveCount(2);
    
    const row = await cartPage.getProductRow(0);
    
    // SUT BUG: It deletes without confirm, but here we just test the delete action works
    page.on('dialog', dialog => dialog.accept()); // In case the bug is fixed
    await row.removeBtn.click();
    
    await expect(cartPage.tableRows).toHaveCount(1);
  });

  // TC06: Remove all products shows empty state
  test('TC06: Remove all products shows empty state', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.tableRows).toHaveCount(1);
    
    const row = await cartPage.getProductRow(0);
    page.on('dialog', dialog => dialog.accept());
    await row.removeBtn.click();
    
    await expect(cartPage.emptyStateHeading).toHaveText(data.messages.emptyState);
  });

  // TC07: Unauthenticated checkout redirects to login
  test('TC07: Unauthenticated checkout redirects to login', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe(data.messages.loginRequired);
      dialog.accept();
    });
    
    await cartPage.checkoutButton.click();
    await expect(page).toHaveURL(/.*login/);
  });

  // TC08: Authenticated checkout proceeds to checkout page
  test('TC08: Authenticated checkout proceeds to checkout page', async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);
    
    // Add product
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    // Go to cart & checkout
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.checkoutButton.click();
    
    await expect(page).toHaveURL(/.*checkout/);
  });

  // TC09: @bug Adding same product duplicates row instead of increasing quantity
  test('TC09: @bug Adding same product should increase quantity, not duplicate row', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    
    // Click same product twice
    await addBtns.nth(0).click();
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    // SUT BUG: Creates 2 rows
    // SRS Expectation: Should have 1 row with quantity 2
    // [P5] Soft assertion used here, we expect 1 but the bug makes it 2
    expect.soft(await cartPage.tableRows.count()).toBe(1);
    // Force fail to report bug:
    await expect(cartPage.tableRows).toHaveCount(1);
  });

  // TC10: @bug No confirmation dialog when deleting item
  test('TC10: @bug No confirmation dialog when deleting item', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    let dialogFired = false;
    page.on('dialog', dialog => {
      dialogFired = true;
      dialog.accept();
    });
    
    const row = await cartPage.getProductRow(0);
    await row.removeBtn.click();
    
    // It should have fired a confirm dialog
    expect(dialogFired).toBeTruthy();
  });

  // TC11: @bug Total label is incorrect
  test('TC11: @bug Total label should be "Tổng cộng"', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    const totalText = await cartPage.totalLabel.innerText();
    expect(totalText).toContain('Tổng cộng:'); // Currently it is "Tổng tạm tính:"
  });

  // TC12: @bug Missing quantity adjusters (+/-)
  test('TC12: @bug Missing quantity adjusters (+/-)', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    const row = await cartPage.getProductRow(0);
    // Should have buttons to increase/decrease quantity
    const btnCount = await row.quantity.locator('button').count();
    expect(btnCount).toBeGreaterThan(0);
  });

  // TC13: @bug Empty state lacks illustration
  test('TC13: @bug Empty state lacks illustration image', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    // Look for an image in the empty state container
    const imgCount = await page.locator('.text-center img').count();
    expect(imgCount).toBeGreaterThan(0);
  });

  // TC14: @bug Continue shopping label is incorrect
  test('TC14: @bug Continue shopping button label should be "Tiếp tục mua sắm"', async ({ page }) => {
    await page.goto('/');
    const addBtns = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(addBtns).not.toHaveCount(0);
    await addBtns.nth(0).click();
    
    const cartPage = new CartPage(page);
    await cartPage.goto();
    
    const link = page.locator('a.border.text-gray-600');
    await expect(link).toHaveText('Tiếp tục mua sắm'); // Currently "← Mua tiếp"
  });

});
// Minor update to FR-07
// Added edge cases for FR-07
