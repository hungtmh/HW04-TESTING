const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { readCsv, readJson } = require('./utils/csv');
const { API_BASE_URL, stampRun } = require('./utils/env');
const { createCustomer } = require('./utils/api');

const csvCases = readCsv('fr02-login-credentials.csv');
const data = readJson('fr02-login-cases.json');

test.describe('FR-02: Login and Account Lockout', () => {
  let customer;

  test.beforeEach(async ({ request, page }, testInfo) => {
    stampRun(testInfo, 'FR-02 Login');
    // Create a fresh customer for most tests to avoid lockout state carrying over
    customer = await createCustomer(request);
  });

  // TC01: Valid login
  test('TC01: Valid login should redirect to home', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);
    
    // [P1] Navigation assertion
    await expect(page).toHaveURL('/');
  });

  // TC02: Wrong password
  test('TC02: Wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, 'WrongPass123!');
    
    // [P2] Element visibility & text
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(data.messages.invalidCredentials);
  });

  // TC03: Non-existent email
  test('TC03: Non-existent email shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('notexist@eshop-test.local', 'SomePass123!');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(data.messages.invalidCredentials);
  });

  // TC04: Empty email (HTML5 validation)
  test('TC04: Empty email triggers HTML5 validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', 'SomePass123!');
    
    // [P3] DOM-property assertion
    const isValid = await loginPage.emailInput.evaluate(node => node.checkValidity());
    expect(isValid).toBeFalsy();
    await expect(page).toHaveURL(/.*login/);
  });

  // TC05: Empty password (HTML5 validation)
  test('TC05: Empty password triggers HTML5 validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, '');
    
    // [P3] DOM-property assertion
    const isValid = await loginPage.passwordInput.evaluate(node => node.checkValidity());
    expect(isValid).toBeFalsy();
    await expect(page).toHaveURL(/.*login/);
  });

  // TC06: Account lockout after 3 wrong attempts
  // Using API directly to bypass UI slowness and accurately trigger lock
  test('TC06: Account locked after 3 failed attempts', async ({ request }) => {
    // Attempt 1
    let res = await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    expect(res.status()).toBe(401);
    
    // Attempt 2
    res = await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    expect(res.status()).toBe(401);

    // BUG IN SUT: Each failed attempt increments by 2 (BUG-LOGIN-05). 
    // So 2 attempts = 4, which is >= 3. It will lock early!
    // However, we assert the expected behavior. If it locks early or late, we check the actual state.
    // Wait, since SUT has a bug, the test logic should trigger enough attempts to lock.
    // Let's just do 3 attempts as per SRS, even if it locks at 2.
    res = await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    
    // [P4] Back-end API assertion
    // If it locked at attempt 2, attempt 3 returns 403.
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({ error: data.messages.lockedAccount });
  });

  // TC07: Login when locked shows message
  test('TC07: Login when locked shows locked message on UI', async ({ request, page }) => {
    // Force lock
    await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, customer.password); // Even correct password fails

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(data.messages.lockedAccount);
  });

  // TC08: Login success resets counter
  test('TC08: Login success resets counter', async ({ request }) => {
    // 1 wrong attempt
    await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    
    // 1 successful attempt
    let res = await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: customer.password } });
    expect(res.status()).toBe(200);

    // The counter should be 0 now. We do 2 more wrong attempts.
    // If counter didn't reset, it would be 1 + 2 = 3 wrong attempts total and lock.
    await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    res = await request.post(`${API_BASE_URL}/api/login`, { data: { email: customer.email, password: 'W' } });
    expect(res.status()).toBe(401); // should not be 403
  });

  // TC09: @bug Login page title is correct
  test('TC09: @bug Login page title must be "Đăng Nhập"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // [P5] Element-count assertion / text check
    await expect(loginPage.heading).toHaveText('Đăng Nhập');
  });

  // TC10: @bug Email field has correct type and label
  test('TC10: @bug Email field has type="email" and label "Email"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveCount(1);
    
    const label = page.locator('label').first();
    await expect(label).toHaveText('Email');
  });

  // TC11: @bug Password field has correct type
  test('TC11: @bug Password field has type="password"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveCount(1);
  });

  // TC12: @bug Submit button text
  test('TC12: @bug Submit button text is "Đăng nhập"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await expect(loginPage.submitButton).toHaveText('Đăng nhập');
  });

});
// Minor update to FR-02
