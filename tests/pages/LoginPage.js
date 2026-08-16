const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    // Theo phân tích SUT: label là "Username", type="text"
    this.emailInput = page.locator('text=Username').locator('..').locator('input');
    
    // Theo phân tích SUT: label là "Mật khẩu", type="text" (bug)
    this.passwordInput = page.locator('text=Mật khẩu').locator('..').locator('input');
    
    // Nút submit nhãn "Sign In"
    this.submitButton = page.locator('button[type="submit"]');
    
    // Thông báo lỗi
    this.errorMessage = page.locator('.bg-red-100.text-red-700');
    
    // Heading trang
    this.heading = page.locator('h2');
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
}

module.exports = { LoginPage };
