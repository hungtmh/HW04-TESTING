const { expect } = require('@playwright/test');
const { ADMIN_BASE_URL } = require('../utils/env');

class AdminImportPage {
  constructor(page) {
    this.page = page;
    
    // Login form elements (admin login)
    this.emailInput = page.locator('input[placeholder="Email"]');
    this.passwordInput = page.locator('input[placeholder="Password"]');
    this.loginButton = page.locator('button', { hasText: /^Login$/ });
    
    // Admin dashboard - Import section
    this.importSection = page.locator('h3', { hasText: 'Import sản phẩm từ CSV' }).locator('xpath=../..');
    this.fileInput = this.importSection.locator('input[type="file"]');
    this.importButton = this.importSection.locator('button', { hasText: /Import .* sản phẩm/ });
    this.previewTableRows = this.importSection.locator('table tbody tr');
    
    // Messages
    this.successMessage = this.importSection.locator('.bg-green-100');
    this.errorMessage = this.importSection.locator('.bg-red-100');
    
    // Template link
    this.templateLink = this.importSection.locator('a', { hasText: 'Tải file mẫu' });
  }

  async goto() {
    await this.page.goto(ADMIN_BASE_URL);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.page.locator('text=EShop Admin')).toBeVisible();
    await this.page.locator('li', { hasText: /^Sản phẩm$/ }).click();
    await expect(this.page.locator('h3', { hasText: 'Import sản phẩm từ CSV' })).toBeVisible();
  }

  async selectFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }
}

module.exports = { AdminImportPage };
