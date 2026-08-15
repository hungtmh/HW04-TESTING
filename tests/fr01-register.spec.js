const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('./pages/RegisterPage');
const { readCsv, readJson } = require('./utils/csv');
const { API_BASE_URL, uniqueEmail } = require('./utils/env');

/**
 * ============================================================================
 * HW04 - Automation Testing | FR-01: Account registration
 * Student: 23127195
 * ============================================================================
 *
 * DATA-DRIVEN: every input value comes from tests/data/*.csv and *.json.
 * No inline test-data arrays live in this file.
 *
 * ASSERTION PATTERNS USED (the assignment requires at least three distinct
 * patterns; six are used here, tagged [P1]..[P6] at each call site):
 *   [P1] Navigation assertion       - expect(page).toHaveURL(...)
 *   [P2] Web-first element/text     - expect(locator).toBeVisible()/toContainText()
 *   [P3] DOM-property assertion     - HTML5 constraint validity via evaluate()
 *   [P4] Back-end API assertion     - expect(response.ok()) + body shape via toMatchObject()
 *   [P5] Element-count assertion    - expect(locator).toHaveCount(...)
 *   [P6] Runtime side-effect        - expect(await page.evaluate(...)) for XSS execution
 *
 * TESTS TAGGED @bug ASSERT THE *SPECIFIED* BEHAVIOUR AND CURRENTLY FAIL.
 * Each failure is a genuine defect logged in 23127195/bug-report/BUG_REPORT.md
 * and on GitHub Issues. They are deliberately not weakened to green.
 */

const csvCases = readCsv('fr01-password-rules.csv');
const data = readJson('fr01-register-cases.json');

/** Registers via the public API - used to arrange preconditions without the UI. */
async function apiRegister(request, { name, email, password }) {
  return request.post(`${API_BASE_URL}/api/register`, {
    data: { name, email, password },
  });
}

/**
 * Counts the user rows holding a given e-mail address.
 *
 * Human review finding R-03: the AI draft proved "the account was not created"
 * by asserting the URL had not changed to /login. That assertion passes
 * INSTANTLY - right after the click the SPA has not resolved its POST yet, so
 * the URL is still /register no matter what the server decides. Four
 * email-format tests went green against a SUT that in fact accepts garbage
 * addresses. Asking the back end how many rows exist removes the race entirely.
 */
let cachedAdminToken = null;

/**
 * Logs in as the seeded admin ONCE per run.
 *
 * Human review finding R-08: the first version logged in on every call. The
 * SUT locks an account after two wrong passwords (FR-02 adds 2 per failure
 * against a threshold of 3) and, while locked, rejects even the correct
 * password. Because the credentials were initially taken from setup_guide.md -
 * which documents `admin123` while the seed actually writes `Admin123!`
 * (BUG-06) - the repeated failures locked the admin account and five tests
 * reported a red that had nothing to do with the defect they were written for.
 */
async function getAdminToken(request) {
  if (cachedAdminToken) return cachedAdminToken;

  const { email, password } = data.adminAccount;
  const auth = await request.post(`${API_BASE_URL}/api/login`, { data: { email, password } });
  expect(
    auth.ok(),
    `admin login must succeed to inspect user rows (status ${auth.status()}: ${await auth.text()})`,
  ).toBeTruthy();

  cachedAdminToken = (await auth.json()).token;
  return cachedAdminToken;
}

async function countAccountsByEmail(request, email) {
  const token = await getAdminToken(request);

  const list = await request.get(`${API_BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(list.ok()).toBeTruthy();
  const users = await list.json();
  return users.filter(u => u.email === email).length;
}

test.describe('FR-01 | Đăng ký tài khoản', () => {
  let registerPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // ==========================================================================
  // GROUP 1 - Password rule matrix (data-driven from CSV) : TC-01 .. TC-10
  // ==========================================================================
  test.describe('Nhóm 1 - Ma trận quy tắc mật khẩu (CSV)', () => {
    for (const row of csvCases) {
      const isBug = row.tc_id === 'TC-02';
      const title = `${row.tc_id} - ${row.label} -> ${row.expected}${isBug ? ' @bug' : ''}`;

      test(title, async ({ page }) => {
        test.info().annotations.push(
          { type: 'test-case', description: row.tc_id },
          { type: 'rule', description: row.rule_violated },
          { type: 'note', description: row.note },
        );
        if (isBug) {
          test.info().annotations.push({
            type: 'bug',
            description: 'BUG-01 - mật khẩu đúng đặc tả bị từ chối',
          });
        }

        await registerPage.register({
          name: 'Nguyen Van A',
          email: uniqueEmail('pwd'),
          password: row.password,
        });

        if (row.expected === 'accepted') {
          // [P1] navigation assertion: a successful registration redirects to /login
          await expect(page).toHaveURL(/\/login$/);
          // [P5] element-count assertion: the error banner must not exist at all
          await expect(registerPage.errorBox).toHaveCount(0);
        } else {
          // [P2] Assert the error banner FIRST. `toHaveURL(/\/register$/)` would
          // match instantly on the pre-submit URL and could go green before the
          // app had decided anything (human review finding R-03); waiting for
          // the banner forces the client-side rule to have actually run.
          await expect(registerPage.errorBox).toBeVisible();
          await expect(registerPage.errorBox).toContainText(
            data.expectedMessages.weakPassword,
          );
          // [P1] only then is "still on /register" a meaningful statement
          await expect(page).toHaveURL(/\/register$/);
        }
      });
    }
  });

  // ==========================================================================
  // GROUP 2 - Happy paths (data-driven from JSON) : TC-11 .. TC-13
  // ==========================================================================
  test.describe('Nhóm 2 - Đăng ký thành công', () => {
    for (const c of data.happyPath) {
      test(`${c.tc_id} - ${c.label}`, async ({ page, request }) => {
        test.info().annotations.push({ type: 'test-case', description: c.tc_id });
        const email = uniqueEmail(c.emailPrefix);

        await registerPage.register({
          name: c.name,
          email,
          password: data.validPasswordForSut,
        });

        // [P1] redirected to the login page
        await expect(page).toHaveURL(/\/login$/);

        // [P4] back-end assertion: the account really exists and can authenticate
        const res = await request.post(`${API_BASE_URL}/api/login`, {
          data: { email, password: data.validPasswordForSut },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body).toMatchObject({
          message: 'Login successful',
          user: { name: c.name, email },
        });
        expect(body.token).toBeTruthy();
      });
    }
  });

  // ==========================================================================
  // GROUP 3 - Required-field constraints (JSON) : TC-14 .. TC-17
  // ==========================================================================
  test.describe('Nhóm 3 - Trường bắt buộc', () => {
    for (const c of data.requiredFields) {
      test(`${c.tc_id} - ${c.label}`, async ({ page }) => {
        test.info().annotations.push({ type: 'test-case', description: c.tc_id });

        const payload = {
          name: 'Nguyen Van A',
          email: uniqueEmail('required'),
          password: data.validPasswordForSut,
        };
        if (c.omit === 'all') {
          payload.name = '';
          payload.email = '';
          payload.password = '';
        } else {
          payload[c.omit] = '';
        }

        await registerPage.register(payload);

        // [P1] the browser blocks submission, so the route never changes
        await expect(page).toHaveURL(/\/register$/);

        // [P3] DOM-property assertion on the HTML5 constraint API.
        // We assert validity state rather than the browser's validation
        // message, because that message is localised differently in
        // Chromium / Firefox / WebKit (human review finding R-02).
        const validity = await registerPage.validity(c.expectInvalidField);
        expect(validity).toMatchObject({ valueMissing: true, valid: false });
      });
    }
  });

  // ==========================================================================
  // GROUP 4 - Email format validation (JSON) : TC-18 .. TC-21  [@bug]
  // ==========================================================================
  test.describe('Nhóm 4 - Định dạng email', () => {
    for (const c of data.invalidEmails) {
      test(`${c.tc_id} - ${c.label} @bug`, async ({ page, request }) => {
        test.info().annotations.push(
          { type: 'test-case', description: c.tc_id },
          { type: 'bug', description: 'BUG-02 - email sai định dạng vẫn đăng ký được' },
        );

        // Observe the network directly instead of guessing from the URL: if the
        // form posts at all, the client accepted the address.
        const registerCall = page
          .waitForResponse(r => r.url().includes('/api/register'), { timeout: 5_000 })
          .catch(() => null);

        await registerPage.register({
          name: 'Nguyen Van A',
          email: c.email,
          password: data.validPasswordForSut,
        });
        await registerCall;

        // [P4] Specified behaviour: a malformed address must never create an
        // account row. This is the race-free form of the check - it asks the
        // database, not the address bar.
        const rows = await countAccountsByEmail(request, c.email);
        expect(rows, `email "${c.email}" must not create a user row`).toBe(0);
      });
    }
  });

  // ==========================================================================
  // GROUP 5 - Duplicate email : TC-22  [@bug]
  // ==========================================================================
  test('TC-22 - Email đã tồn tại phải bị từ chối @bug', async ({ page, request }) => {
    test.info().annotations.push(
      { type: 'test-case', description: 'TC-22' },
      { type: 'bug', description: 'BUG-03 - email trùng tạo được nhiều tài khoản' },
    );

    const email = uniqueEmail('dup');
    const password = data.validPasswordForSut;

    // Arrange the precondition through the API so the UI step under test is
    // unambiguously the *second* registration.
    const seed = await apiRegister(request, { name: 'Nguoi Dung Goc', email, password });
    expect(seed.ok()).toBeTruthy();
    expect(await countAccountsByEmail(request, email)).toBe(1);

    const registerCall = page
      .waitForResponse(r => r.url().includes('/api/register'), { timeout: 5_000 })
      .catch(() => null);
    await registerPage.register({ name: 'Nguoi Dung Trung', email, password });
    await registerCall;

    // [P4] specified behaviour: the address is already taken, so the row count
    // must stay at 1. The SUT creates a second row -> BUG-03.
    const rows = await countAccountsByEmail(request, email);
    expect(rows, 'a duplicate e-mail must not create a second account').toBe(1);
  });

  // ==========================================================================
  // GROUP 6 - Security payloads (JSON) : TC-23 .. TC-24
  // ==========================================================================
  test.describe('Nhóm 6 - Payload bảo mật', () => {
    for (const c of data.securityPayloads) {
      test(`${c.tc_id} - ${c.label}`, async ({ page, request }) => {
        test.info().annotations.push({ type: 'test-case', description: c.tc_id });
        const email = uniqueEmail(c.emailPrefix);

        await registerPage.register({
          name: c.name,
          email,
          password: data.validPasswordForSut,
        });

        // [P1] Wait for the SPA to finish its POST before querying the API.
        // Human review finding R-05: without this the API call could outrun the
        // registration request. TC-23 masked the race because its extra
        // page.evaluate() added just enough delay, while TC-24 skipped that step
        // and failed on WebKit only - a genuine flake in the TEST, not the SUT.
        await expect(page).toHaveURL(/\/login$/);

        if (c.flag) {
          // [P6] runtime side-effect assertion: the payload must never execute.
          const executed = await page.evaluate(f => window[f], c.flag);
          expect(executed).toBeUndefined();
        }

        // [P4] the back end must still be alive and the payload stored as inert
        // text, i.e. the SQL injection did not drop the users table.
        const res = await request.post(`${API_BASE_URL}/api/login`, {
          data: { email, password: data.validPasswordForSut },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.user.name).toBe(c.name);
      });
    }
  });

  // ==========================================================================
  // GROUP 7 - Boundary : TC-25
  // ==========================================================================
  test('TC-25 - Họ Tên dài 255 ký tự vẫn đăng ký được', async ({ page, request }) => {
    test.info().annotations.push({ type: 'test-case', description: data.boundary.tc_id });

    const longName = 'A'.repeat(data.boundary.nameLength);
    const email = uniqueEmail(data.boundary.emailPrefix);

    await registerPage.register({
      name: longName,
      email,
      password: data.validPasswordForSut,
    });

    // [P1]
    await expect(page).toHaveURL(/\/login$/);
    // [P4] the full 255 characters survive the round trip without truncation
    const res = await request.post(`${API_BASE_URL}/api/login`, {
      data: { email, password: data.validPasswordForSut },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.user.name).toHaveLength(data.boundary.nameLength);
  });

  // ==========================================================================
  // GROUP 8 - Credential storage : TC-26  [@bug]
  // ==========================================================================
  test('TC-26 - Mật khẩu không được lưu/trả về dạng plaintext @bug', async ({ request }) => {
    test.info().annotations.push(
      { type: 'test-case', description: 'TC-26' },
      { type: 'bug', description: 'BUG-04 - mật khẩu lưu và trả về dạng plaintext' },
    );

    const email = uniqueEmail('plain');
    const password = data.validPasswordForSut;

    const created = await apiRegister(request, { name: 'Plain Text', email, password });
    expect(created.ok()).toBeTruthy();

    const res = await request.post(`${API_BASE_URL}/api/login`, {
      data: { email, password },
    });
    const body = await res.json();

    // [P4] The login response must never echo the credential back, and whatever
    // is persisted must not equal the raw password.
    expect(body.user.password).not.toBe(password);
  });

  // ==========================================================================
  // GROUP 9 - UI/spec consistency : TC-27  [@bug]
  // ==========================================================================
  test('TC-27 - Hint mật khẩu trên UI phải khớp luật thực thi @bug', async ({ page }) => {
    test.info().annotations.push(
      { type: 'test-case', description: 'TC-27' },
      { type: 'bug', description: 'BUG-01 - hint yêu cầu ký tự đặc biệt nhưng luật lại cấm' },
    );

    // [P2] the UI promises that a special character is required...
    await expect(registerPage.passwordHint).toContainText(
      data.expectedMessages.passwordHintFragment,
    );

    // ...so a password satisfying exactly that hint must be accepted. [P1]
    await registerPage.register({
      name: 'Nguyen Van A',
      email: uniqueEmail('hint'),
      password: data.specCompliantPassword,
    });
    await expect(page).toHaveURL(/\/login$/);
  });
});
