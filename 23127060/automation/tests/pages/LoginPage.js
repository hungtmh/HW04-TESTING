// Page Object — /login của frontend-web (frontend-web/src/pages/Login.jsx).
// Chỉ dùng làm TIỀN ĐỀ cho FR-03 / FR-08, không phải feature tính điểm của 23127060.
//
// ⚠️ Trang này có nhiều lỗi hiển thị (heading ghi "Đăng Ký", label ghi "Username",
//    ô mật khẩu là type="text" chứ không phải type="password").
//    => KHÔNG dùng input[type=password] ở đây, và nút submit tên là "Sign In".
import { expect } from '@playwright/test';
import { WEB_BASE_URL } from '../utils/env.js';

export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Cả 2 ô đều là <input type="text"> -> phân biệt bằng thứ tự (Login.jsx:28-45).
    this.textboxes = page.getByRole('textbox');
    this.emailInput = this.textboxes.first();
    this.passwordInput = this.textboxes.nth(1);
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.forgotLink = page.getByRole('link', { name: 'Quên mật khẩu?' });
    this.errorBox = page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.');
  }

  async goto() {
    await this.page.goto(`${WEB_BASE_URL}/login`);
    await expect(this.submitButton).toBeVisible();
  }

  /** Đăng nhập và chờ AuthContext nạp xong user (header đổi sang nút "Thoát"). */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/login')),
      this.submitButton.click(),
    ]);
    await expect(this.page.getByRole('button', { name: 'Thoát' })).toBeVisible();
  }
}
