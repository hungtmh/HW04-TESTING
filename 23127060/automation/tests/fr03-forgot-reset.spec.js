// FR-03 — Quên mật khẩu & Đặt lại mật khẩu | 23127060 Ninh Văn Khải
// Data-driven: mọi case nạp từ tests/data/fr03-reset-cases.json và fr03-token-variants.csv.
// Assertion pattern dùng ở đây: A1 (UI text) · A2 (URL) · A3 (API state) · A4 (boundary) · A5 (dialog).
import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { loadJson, loadCsv, uniqueEmail } from './utils/data.js';
import { API_BASE_URL, FE_VALID_PASSWORD } from './utils/env.js';
import { annotate, freshUser as makeUser } from './utils/fixtures.js';
import {
  createAndLoginUser,
  loginUser,
  requestResetToken,
  resetPassword,
} from './utils/api.js';

const cases = loadJson('fr03-reset-cases.json');
const variants = loadCsv('fr03-token-variants.csv');

/** Mật khẩu ban đầu của user tiền đề — hợp lệ với regex FE để không nhiễu kết quả. */
const ORIGINAL_PASSWORD = 'Old Pass 123';

const byId = (id) => {
  const c = cases.find((x) => x.id === id);
  if (!c) throw new Error(`Không có case ${id} trong fr03-reset-cases.json`);
  return c;
};

/**
 * Gắn mã bug + dòng source vào test để HTML report truy vết được test <-> bug.
 * Dữ liệu lấy thẳng từ file data, không viết lại bằng tay ở spec.
 */
const trace = (info, c, patterns) =>
  annotate(info, { bug: c.bug, source: c.source, patterns });

/**
 * Tạo 1 user riêng cho mỗi test và chỉ trả về email (FR-03 chủ yếu thao tác qua UI, chưa cần token).
 * Dùng helper chung ở utils/fixtures.js để 3 spec có cùng một cách tạo dữ liệu tiền đề.
 */
async function freshUser(request, prefix = 'fr03') {
  const { email } = await makeUser(request, {
    prefix,
    password: ORIGINAL_PASSWORD,
    login: false,
  });
  return email;
}

/** Đổi __VALID__/__EMPTY__ trong CSV thành giá trị thật. */
function materialize(value, validValue) {
  if (value === '__VALID__') return validValue;
  if (value === '__EMPTY__') return '';
  return value;
}

test.describe('FR-03 Forgot & Reset password', () => {
  // ---------------------------------------------------------------- luồng UI
  test(`FR03-${byId('TC01').id} ${byId('TC01').title} @fr03`, async ({ page, request }) => {
    const c = byId('TC01');
    trace(test.info(), c, ['A3','A5','A2']);
    const email = await freshUser(request, 'fr03-tc01');
    const fp = new ForgotPasswordPage(page);

    await fp.goto();
    const res = await fp.requestOtp(email);
    expect(res.status(), 'A3: forgot-password phải trả 200').toBe(200);

    const otp = await fp.readOtpFromScreen();
    expect(otp, 'A4: OTP phải là 4 chữ số').toMatch(/^\d{4}$/);

    const dialogPromise = fp.captureNextDialog();
    await fp.submitReset(otp, c.newPassword);
    // A5 — SUT báo kết quả bằng alert(), không có toast trong DOM
    expect(await dialogPromise).toContain(c.expect.dialog);

    // A2 — điều hướng sang /login sau khi đổi mật khẩu thành công
    await expect(page).toHaveURL(/\/login$/);

    // A3 — mật khẩu mới thực sự có hiệu lực ở backend
    const login = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: c.newPassword },
    });
    expect(login.status(), 'A3: đăng nhập bằng mật khẩu mới').toBe(c.expect.loginWithNewPassword);
  });

  test(`FR03-${byId('TC02').id} ${byId('TC02').title} @fr03`, async ({ page }) => {
    const c = byId('TC02');
    trace(test.info(), c, ['A5','A1']);
    const fp = new ForgotPasswordPage(page);
    await fp.goto();

    const dialogPromise = fp.captureNextDialog();
    await fp.requestOtp(uniqueEmail('khong-ton-tai'));
    expect(await dialogPromise, 'A5').toContain(c.expect.dialog);

    // A1 — vẫn kẹt ở bước 1, không được chuyển sang bước nhập OTP
    expect(await fp.isOnStep1(), 'A1: phải ở lại bước 1').toBe(true);
  });

  test(`FR03-${byId('TC03').id} ${byId('TC03').title} @fr03`, async ({ page, request }) => {
    const c = byId('TC03');
    trace(test.info(), c, ['A5','A3']);
    const email = await freshUser(request, 'fr03-tc03');
    const fp = new ForgotPasswordPage(page);

    await fp.goto();
    await fp.requestOtp(email);
    const realOtp = await fp.readOtpFromScreen();
    // Sinh OTP sai nhưng vẫn đúng định dạng 4 số
    const wrongOtp = String((Number(realOtp) + 1) % 10000).padStart(4, '0');

    const dialogPromise = fp.captureNextDialog();
    await fp.submitReset(wrongOtp, c.newPassword);
    expect(await dialogPromise, 'A5').toContain(c.expect.dialog);

    // A3 — mật khẩu CŨ vẫn còn hiệu lực => reset thật sự đã bị chặn
    const login = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: ORIGINAL_PASSWORD },
    });
    expect(login.status(), 'A3: mật khẩu cũ vẫn dùng được').toBe(c.expect.loginWithOldPassword);
  });

  test(`FR03-${byId('TC04').id} ${byId('TC04').title} @fr03`, async ({ page, request }) => {
    const c = byId('TC04'); // BUG-03-01
    trace(test.info(), c, ['A5','A3']);
    const email = await freshUser(request, 'fr03-tc04');
    const fp = new ForgotPasswordPage(page);

    await fp.goto();
    await fp.requestOtp(email);
    const otp = await fp.readOtpFromScreen();

    const dialogPromise = fp.captureNextDialog();
    await fp.submitReset(otp, c.newPassword); // 'NewPass123!' — mạnh, CÓ ký tự đặc biệt
    // A5 — FE chặn dù mật khẩu mạnh hơn hẳn mật khẩu nó chấp nhận ("New Pass 123")
    expect(await dialogPromise, 'A5: FE từ chối mật khẩu mạnh').toContain(c.expect.dialog);

    // A3 — request tới backend không hề được gửi => mật khẩu mới không có tác dụng
    const login = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: c.newPassword },
    });
    expect(login.status(), 'A3').toBe(c.expect.loginWithNewPassword);
  });

  // TC05 — bảng boundary cho regex mật khẩu của FE (CSV, layer=ui)
  for (const v of variants.filter((r) => r.layer === 'ui')) {
    test(`FR03-${v.id} ${v.label} @fr03`, async ({ page, request }) => {
      trace(test.info(), v, ['A5', 'A4']);
      const email = await freshUser(request, `fr03-${v.id.toLowerCase()}`);
      const fp = new ForgotPasswordPage(page);

      await fp.goto();
      await fp.requestOtp(email);
      const otp = await fp.readOtpFromScreen();

      const dialogPromise = fp.captureNextDialog();
      await fp.submitReset(otp, materialize(v.password_value, FE_VALID_PASSWORD));
      // A5 + A4 — boundary độ dài / thành phần ký tự theo regex ForgotPassword.jsx:26
      expect(await dialogPromise, `A5: ${v.source}`).toContain(v.expected_dialog);
    });
  }

  // --------------------------------------------------------------- luồng API
  test(`FR03-${byId('TC06').id} ${byId('TC06').title} @fr03`, async ({ request }) => {
    const c = byId('TC06'); // BUG-03-02
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc06');

    const { status, body } = await requestResetToken(request, email);
    expect(status, 'A3').toBe(c.expect.status);
    // A3 — mã bí mật nằm ngay trong response body của một endpoint KHÔNG cần xác thực
    expect(body, 'A3: resetToken bị lộ trong response').toHaveProperty('resetToken');
    expect(String(body.resetToken).length, 'A4').toBeGreaterThan(0);
  });

  test(`FR03-${byId('TC07').id} ${byId('TC07').title} @fr03`, async ({ request }) => {
    const c = byId('TC07'); // BUG-03-03
    trace(test.info(), c, ['A3','A4']);
    const email = await freshUser(request, 'fr03-tc07');

    const { body } = await requestResetToken(request, email);
    // A4 — không gian khoá chỉ 1000..9999 => 9000 khả năng, brute-force trong vài giây
    expect(String(body.resetToken), 'A4').toMatch(new RegExp(c.expect.tokenPattern));
    expect(9999 - 1000 + 1, 'A4: keyspace').toBeLessThanOrEqual(c.expect.maxKeyspace);
  });

  test(`FR03-${byId('TC08').id} ${byId('TC08').title} @fr03`, async ({ request }) => {
    const c = byId('TC08'); // BUG-03-04
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc08');

    const statuses = [];
    for (let i = 0; i < c.repeat; i += 1) {
      const { status } = await requestResetToken(request, email);
      statuses.push(status);
    }
    // A3 — không có 429 nào xuất hiện dù bắn liên tục
    expect(statuses, `A3: ${c.repeat} request liên tiếp`).toEqual(
      Array(c.repeat).fill(c.expect.allStatuses),
    );
  });

  test(`FR03-${byId('TC09').id} ${byId('TC09').title} @fr03`, async ({ request }) => {
    const c = byId('TC09'); // BUG-03-05
    trace(test.info(), c, ['A3']);
    const known = await freshUser(request, 'fr03-tc09');

    const hit = await requestResetToken(request, known);
    const miss = await requestResetToken(request, uniqueEmail('khong-co'));

    // A3 — hai mã trạng thái khác nhau => kẻ tấn công dò được email nào đã đăng ký
    expect(hit.status, 'A3: email có thật').toBe(c.expect.registeredStatus);
    expect(miss.status, 'A3: email không có').toBe(c.expect.unregisteredStatus);
    expect(hit.status).not.toBe(miss.status);
  });

  test(`FR03-${byId('TC10').id} ${byId('TC10').title} @fr03`, async ({ request }) => {
    const c = byId('TC10'); // BUG-03-06
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc10');
    const { body } = await requestResetToken(request, email);

    const reset = await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: c.newPassword, // "1"
    });
    expect(reset.status, 'A3: backend chấp nhận mật khẩu 1 ký tự').toBe(c.expect.status);

    const login = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: c.newPassword },
    });
    expect(login.status(), 'A3: đăng nhập được bằng mật khẩu "1"').toBe(
      c.expect.loginWithNewPassword,
    );
  });

  test(`FR03-${byId('TC11').id} ${byId('TC11').title} @fr03`, async ({ request }) => {
    const c = byId('TC11'); // BUG-03-07
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc11');
    const { body } = await requestResetToken(request, email);
    await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: c.newPassword,
    });

    const { token } = await loginUser(request, { email, password: c.newPassword });
    const me = await request.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = await me.json();
    // A3 — mật khẩu đọc lại được nguyên văn => lưu plaintext, không hash
    expect(profile.password, 'A3: password trả về plaintext').toBe(c.newPassword);
  });

  test(`FR03-${byId('TC12').id} ${byId('TC12').title} @fr03`, async ({ request }) => {
    const c = byId('TC12');
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc12');

    const first = await requestResetToken(request, email);
    const second = await requestResetToken(request, email);
    expect(first.body.resetToken, 'tiền đề: 2 token phải khác nhau').not.toBe(
      second.body.resetToken,
    );

    const withOld = await resetPassword(request, {
      email,
      resetToken: first.body.resetToken,
      newPassword: c.newPassword,
    });
    expect(withOld.status, 'A3: token cũ đã bị vô hiệu').toBe(c.expect.statusWithFirstToken);

    const withNew = await resetPassword(request, {
      email,
      resetToken: second.body.resetToken,
      newPassword: c.newPassword,
    });
    expect(withNew.status, 'A3: token mới vẫn dùng được').toBe(c.expect.statusWithSecondToken);
  });

  test(`FR03-${byId('TC13').id} ${byId('TC13').title} @fr03`, async ({ request }) => {
    const c = byId('TC13');
    trace(test.info(), c, ['A3']);
    const email = await freshUser(request, 'fr03-tc13');
    const { body } = await requestResetToken(request, email);

    const first = await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: c.newPassword,
    });
    const second = await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: 'Second Try 1',
    });

    expect(first.status, 'A3: lần 1 thành công').toBe(c.expect.firstResetStatus);
    // A3 — token dùng một lần: server.js:87 set reset_token = NULL
    expect(second.status, 'A3: dùng lại token đã tiêu thụ').toBe(c.expect.secondResetStatus);
  });

  test(`FR03-${byId('TC14').id} ${byId('TC14').title} @fr03`, async ({ request }) => {
    const c = byId('TC14'); // BUG-03-08
    trace(test.info(), c, ['A3','A1']);
    const email = await freshUser(request, 'fr03-tc14');

    // Khoá tài khoản: mỗi lần sai, login_attempts += 2 (server.js:53) -> 2 lần là đủ ngưỡng 3.
    for (let i = 0; i < c.failedLoginAttempts; i += 1) {
      await request.post(`${API_BASE_URL}/login`, { data: { email, password: 'sai-mat-khau' } });
    }
    const lockedCheck = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: ORIGINAL_PASSWORD },
    });
    expect(lockedCheck.status(), 'tiền đề: tài khoản phải đang bị khoá').toBe(403);

    const { body } = await requestResetToken(request, email);
    const reset = await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: c.newPassword,
    });
    expect(reset.status, 'A3: reset báo thành công').toBe(c.expect.resetStatus);

    const login = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: c.newPassword },
    });
    // A3 — người dùng đã làm đúng mọi bước khôi phục nhưng vẫn không vào được
    expect(login.status(), 'A3: vẫn bị khoá sau khi đổi mật khẩu').toBe(
      c.expect.loginAfterResetStatus,
    );
    expect(JSON.stringify(await login.json()), 'A1').toContain(c.expect.loginError);
  });

  // TC15 + TC10 (biến thể token) — bảng boundary từ CSV, layer=api
  for (const v of variants.filter((r) => r.layer === 'api')) {
    test(`FR03-${v.id} ${v.label} @fr03`, async ({ request }) => {
      trace(test.info(), v, ['A3', 'A4']);
      const email = await freshUser(request, `fr03-${v.id.toLowerCase()}`);
      let { body } = await requestResetToken(request, email);

      // Token thật là 4 số ngẫu nhiên 1000..9999. Một vài biến thể trong CSV cũng là 4 số
      // (ví dụ TC15e = "9999") nên có xác suất 1/9000 trùng token thật -> test sẽ flaky.
      // Xin token mới cho tới khi khác hẳn giá trị biến thể. Đây là chống flaky, không phải retry che lỗi.
      while (Number(v.expected_status) === 400 && String(body.resetToken) === v.token_value) {
        ({ body } = await requestResetToken(request, email));
      }

      const token = materialize(v.token_value, body.resetToken);
      const password = materialize(v.password_value, FE_VALID_PASSWORD);

      const res = await resetPassword(request, {
        email,
        resetToken: token,
        newPassword: password,
      });
      // A3 + A4 — biến thể độ dài / kiểu ký tự / SQL injection của token
      expect(res.status, `A3: ${v.source}`).toBe(Number(v.expected_status));
    });
  }

  test(`FR03-${byId('TC16').id} ${byId('TC16').title} @fr03`, async ({ request }) => {
    const c = byId('TC16');
    trace(test.info(), c, ['A3','A1']);
    const emailA = await freshUser(request, 'fr03-tc16a');
    const emailB = await freshUser(request, 'fr03-tc16b');

    const tokenA = (await requestResetToken(request, emailA)).body.resetToken;
    const res = await resetPassword(request, {
      email: emailB,
      resetToken: tokenA,
      newPassword: c.newPassword,
    });

    // A3 — mệnh đề WHERE email = ? AND reset_token = ? chặn được cross-user
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.error, 'A1').toContain(c.expect.error);

    // A3 — mật khẩu của B không bị đổi
    const loginB = await loginUser(request, { email: emailB, password: ORIGINAL_PASSWORD });
    expect(loginB.token, 'A3: B vẫn đăng nhập bằng mật khẩu cũ').toBeTruthy();
  });

  test('FR03-TC17 forgot password link on login page reaches the reset flow @fr03', async ({
    page,
    request,
  }) => {
    // Test liên kết luồng: từ /login bấm "Quên mật khẩu?" phải tới đúng /forgot-password.
    const email = await freshUser(request, 'fr03-tc17');
    await page.goto('/login');
    await page.getByRole('link', { name: 'Quên mật khẩu?' }).click();

    // A2 — URL đích
    await expect(page).toHaveURL(/\/forgot-password$/);
    // A1 — màn hình đúng
    await expect(page.getByRole('heading', { name: 'Quên Mật Khẩu' })).toBeVisible();

    const fp = new ForgotPasswordPage(page);
    const res = await fp.requestOtp(email);
    expect(res.status(), 'A3').toBe(200);
  });

  test('FR03-TC18 reset flow works end to end for a user created moments earlier @fr03', async ({
    request,
  }) => {
    // Test độc lập hoàn toàn ở tầng API — dùng để chạy nhanh trên cả 3 browser mà không phụ thuộc render.
    const email = uniqueEmail('fr03-tc18');
    const user = await createAndLoginUser(request, { email, password: ORIGINAL_PASSWORD });
    expect(user.token, 'tiền đề: đăng nhập được bằng mật khẩu ban đầu').toBeTruthy();

    const { body } = await requestResetToken(request, email);
    const reset = await resetPassword(request, {
      email,
      resetToken: body.resetToken,
      newPassword: FE_VALID_PASSWORD,
    });
    expect(reset.status, 'A3').toBe(200);

    const after = await loginUser(request, { email, password: FE_VALID_PASSWORD });
    expect(after.user.email, 'A3: token mới thuộc đúng user').toBe(email);

    const old = await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: ORIGINAL_PASSWORD },
    });
    expect(old.status(), 'A3: mật khẩu cũ đã bị vô hiệu').toBe(401);
  });
});
