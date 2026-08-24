class LoginPage {
  constructor(page) {
    this.page = page;
    this.form = page.locator('form');
    this.emailInput = this.form.locator('input').nth(0);
    this.passwordInput = this.form.locator('input').nth(1);
    this.emailLabel = this.form.locator('label').nth(0);
    this.passwordLabel = this.form.locator('label').nth(1);
    this.submitButton = this.form.locator('button[type="submit"]');
    this.errorMessage = page.locator('.bg-red-100.text-red-700');
    this.heading = page.locator('h1, h2').first();
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    if (email !== '') {
      await this.emailInput.fill(email);
    }
    if (password !== '') {
      await this.passwordInput.fill(password);
    }
    await this.submitButton.click();
  }

  async isErrorAboveSubmit() {
    const errorBox = await this.errorMessage.boundingBox();
    const submitBox = await this.submitButton.boundingBox();
    return Boolean(errorBox && submitBox && errorBox.y < submitBox.y);
  }
}

module.exports = { LoginPage };
