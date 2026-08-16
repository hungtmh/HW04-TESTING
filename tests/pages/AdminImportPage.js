const { expect } = require('@playwright/test');
const { ADMIN_BASE_URL } = require('../utils/env');

class AdminImportPage {
  constructor(page) {
    this.page = page;
    
    // Login form elements (admin login)
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button', { hasText: 'Đăng Nhập' });
    
    // Admin dashboard - Import section
    this.fileInput = page.locator('input[type="file"]');
    this.importButton = page.locator('button', { hasText: /Import .* sản phẩm/ });
    this.previewTableRows = page.locator('table.bg-white tbody tr');
    
    // Messages
    this.successMessage = page.locator('.bg-green-100');
    this.errorMessage = page.locator('.bg-red-100');
    
    // Template link
    this.templateLink = page.locator('a', { hasText: 'Tải file mẫu' });
  }

  async goto() {
    await this.page.goto(ADMIN_BASE_URL);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for dashboard to load (CSV import section should be visible)
    await expect(page.locator('h3', { hasText: 'Import sản phẩm từ CSV' })).toBeVisible();
  }

  async selectFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }
}

module.exports = { AdminImportPage };
