const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { readCsv, readJson } = require('./utils/csv');
const { API_BASE_URL, stampRun } = require('./utils/env');
const { createCustomer, loginAdmin, listAdminUsers } = require('./utils/api');

const credentialCases = readCsv('fr02-login-credentials.csv');
const data = readJson('fr02-login-cases.json');

test.describe('FR-02: Login and Account Lockout', () => {
  let customer;

  test.beforeEach(async ({ request }, testInfo) => {
    stampRun(testInfo, 'FR-02 Login');
    customer = await createCustomer(request);
  });

  for (const row of credentialCases) {
    test(`${row.id}: ${row.tag ? `${row.tag} ` : ''}${row.description}`, row.tag ? { tag: row.tag } : {}, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      const email = row.email === '__CUSTOMER__' ? customer.email : row.email;
      const password = row.password === '__PASSWORD__' ? customer.password : row.password;
      await loginPage.login(email, password);

      if (row.expectedResult === 'success') {
        await expect(page).toHaveURL('/');
      } else if (row.expectedResult === 'failure') {
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toContainText(data.messages.invalidCredentials);
      } else {
        const input = row.email === '' || row.email === 'invalid-email'
          ? loginPage.emailInput
          : loginPage.passwordInput;
        expect(await input.evaluate(node => node.checkValidity())).toBeFalsy();
        await expect(page).toHaveURL(/\/login$/);
      }
    });
  }

  test('TC07: @bug A failed login increments the counter by exactly one', { tag: '@bug' }, async ({ request }) => {
    await request.post(`${API_BASE_URL}/api/login`, {
      data: { email: customer.email, password: data.wrongPassword },
    });
    const adminToken = await loginAdmin(request, data.adminAccount);
    const users = await listAdminUsers(request, adminToken);
    expect(users.find(user => user.email === customer.email).login_attempts).toBe(1);
  });

  test('TC08: @bug Account is not locked before the third failed attempt', { tag: '@bug' }, async ({ request }) => {
    const statuses = [];
    for (let attempt = 0; attempt < data.expected.lockThreshold; attempt += 1) {
      const response = await request.post(`${API_BASE_URL}/api/login`, {
        data: { email: customer.email, password: data.wrongPassword },
      });
      statuses.push(response.status());
    }
    expect(statuses).toEqual([401, 401, 401]);
  });

  test('TC09: @bug Temporary lock duration is 30 seconds', { tag: '@bug' }, async ({ request }) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await request.post(`${API_BASE_URL}/api/login`, {
        data: { email: customer.email, password: data.wrongPassword },
      });
    }
    const adminToken = await loginAdmin(request, data.adminAccount);
    const users = await listAdminUsers(request, adminToken);
    const current = users.find(user => user.email === customer.email);
    const remainingSeconds = (new Date(current.locked_until).getTime() - Date.now()) / 1000;
    expect(remainingSeconds).toBeGreaterThan(25);
    expect(remainingSeconds).toBeLessThanOrEqual(data.expected.lockDurationSeconds + 5);
  });

  test('TC10: Successful login resets attempts and lock state', async ({ request }) => {
    await request.post(`${API_BASE_URL}/api/login`, {
      data: { email: customer.email, password: data.wrongPassword },
    });
    const response = await request.post(`${API_BASE_URL}/api/login`, {
      data: { email: customer.email, password: customer.password },
    });
    expect(response.status()).toBe(200);
    const adminToken = await loginAdmin(request, data.adminAccount);
    const users = await listAdminUsers(request, adminToken);
    expect(users.find(user => user.email === customer.email))
      .toMatchObject({ login_attempts: 0, locked_until: null });
  });

  test('TC11: @bug Login page has one H1 with the correct Vietnamese title', { tag: '@bug' }, async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(data.expected.loginHeading);
  });

  test('TC12: @bug Email field uses type email and label Email', { tag: '@bug' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.emailLabel).toHaveText(data.expected.emailLabel);
  });

  test('TC13: @bug Password field masks its value', { tag: '@bug' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC14: @bug Submit button is Vietnamese', { tag: '@bug' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.submitButton).toHaveText(data.expected.submitLabel);
  });

  test('TC15: @bug Login error is rendered above the submit button', { tag: '@bug' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(customer.email, data.wrongPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.isErrorAboveSubmit()).toBeTruthy();
  });

  test('TC16: @bug Login response must not expose the stored password', { tag: '@bug' }, async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/login`, {
      data: { email: customer.email, password: customer.password },
    });
    expect((await response.json()).user).not.toHaveProperty('password');
  });
});
