const { expect } = require('@playwright/test');

/**
 * Page Object for FR-14 - Category management (frontend-admin, :5174).
 *
 * The admin app is a single App.jsx with tab state, not routes, so there is no
 * per-tab URL to navigate to: the test must log in and then click the sidebar
 * entry. The session token lives in localStorage under "adminToken".
 */
class AdminCategoryPage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;

    // The admin login form gives its e-mail field no type attribute at all, so
    // input[type="email"] matches nothing; the placeholder is the only stable
    // handle. The submit button reads "Login", not "Đăng nhập" (finding R-10).
    this.loginEmail = page.getByPlaceholder('Email');
    this.loginPassword = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });

    // The sidebar entry is a plain <li>. Anchoring on the exact text keeps it
    // apart from the "Quản lý Danh mục" heading and the "Tên Danh Mục" column
    // header, which a loose text match would also hit.
    this.categoriesTab = page.locator('li').filter({ hasText: /^Danh mục$/ });
    this.heading = page.getByRole('heading', { name: 'Quản lý Danh mục' });

    this.nameInput = page.getByPlaceholder('Tên danh mục mới');
    this.addButton = page.getByRole('button', { name: 'Thêm mới' });
    this.table = page.locator('table');
    this.rows = this.table.locator('tbody tr');
  }

  async loginAsAdmin({ email, password }) {
    await this.page.goto(this.baseUrl);
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
    // The dashboard replaces the login form once the token is stored.
    await expect(this.categoriesTab.first()).toBeVisible({ timeout: 15_000 });
  }

  async openCategoriesTab() {
    await this.categoriesTab.first().click();
    await expect(this.heading).toBeVisible();
  }

  /** Row locator addressed by the category name shown in the second column. */
  rowByName(name) {
    return this.rows.filter({ has: this.page.getByRole('cell', { name, exact: true }) });
  }

  async addCategory(name) {
    await this.nameInput.fill(name);
    const call = this.page
      .waitForResponse(r => r.url().includes('/api/categories') && r.request().method() === 'POST',
        { timeout: 10_000 })
      .catch(() => null);
    await this.addButton.click();
    return call;
  }

  async deleteCategoryRow(name) {
    const call = this.page
      .waitForResponse(r => r.url().includes('/api/categories') && r.request().method() === 'DELETE',
        { timeout: 10_000 })
      .catch(() => null);
    await this.rowByName(name).getByRole('button', { name: 'Xóa' }).click();
    return call;
  }

  /** Every control offered on a category row, used to prove Update is missing. */
  async rowActionLabels(name) {
    return this.rowByName(name).locator('button, a').allInnerTexts();
  }

  async visibleCategoryNames() {
    const cells = await this.rows.locator('td:nth-child(2)').allInnerTexts();
    return cells.map(c => c.trim());
  }
}

module.exports = { AdminCategoryPage };
