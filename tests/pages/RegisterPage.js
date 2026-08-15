const { expect } = require('@playwright/test');

/**
 * Page Object for FR-01 - Account registration (frontend-web /register).
 *
 * SELECTOR NOTE (human review finding R-01):
 * The AI-generated draft used `page.getByLabel('Họ Tên')` etc. That resolves to
 * ZERO elements on this SUT: Register.jsx renders <label> without htmlFor and
 * <input> without id/name, so the accessible-name association never exists.
 * We therefore anchor on the field's wrapper <div> — which does contain the
 * label text — and take the <input> inside it. This keeps the locator readable
 * and still breaks loudly if the markup is restructured, unlike nth-child
 * indexing which would silently target the wrong field.
 */
class RegisterPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Đăng Ký Tài Khoản' });
    this.submitButton = page.getByRole('button', { name: 'Đăng Ký' });
    this.errorBox = page.locator('div.bg-red-100');
    this.loginLink = page.getByRole('link', { name: 'Đăng nhập' });
    this.passwordHint = page.getByText(/Yêu cầu: Tối thiểu 8 ký tự/);

    this.nameInput = this._fieldByLabel('Họ Tên');
    this.emailInput = this._fieldByLabel('Email');
    this.passwordInput = this._fieldByLabel('Mật khẩu');
  }

  _fieldByLabel(labelText) {
    return this.page
      .locator('form > div')
      .filter({ has: this.page.getByText(labelText, { exact: true }) })
      .locator('input');
  }

  async goto() {
    await this.page.goto('/register');
    // Wait on a rendered element rather than a networkidle/timeout guess:
    // Vite serves the shell instantly but React mounts a tick later, and a
    // fixed waitForTimeout was the flakiest part of the AI draft (finding R-04).
    await expect(this.heading).toBeVisible();
  }

  /** Fills the form. `undefined` leaves a field untouched (for required-field tests). */
  async fillForm({ name, email, password }) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async register(data) {
    await this.fillForm(data);
    await this.submit();
  }

  /** Native HTML5 constraint state of a field - used for the required-field cases. */
  async validity(field) {
    return this[`${field}Input`].evaluate(el => ({
      valueMissing: el.validity.valueMissing,
      valid: el.validity.valid,
      type: el.type,
    }));
  }
}

module.exports = { RegisterPage };
