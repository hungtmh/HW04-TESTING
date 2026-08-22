// Page Object — màn Quản lý Sản phẩm của frontend-admin (frontend-admin/src/App.jsx)
// App.jsx là SPA 1 file, đổi màn bằng state `activeTab`, KHÔNG có router => không điều hướng bằng URL.
import { expect } from '@playwright/test';
import { ADMIN_BASE_URL } from '../utils/env.js';

export class AdminProductPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // --- Màn đăng nhập (App.jsx:185-211) ---
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.loginHeading = page.getByRole('heading', { name: 'Admin Login' });

    // --- Sidebar (App.jsx:226-270): các mục là <li>, KHÔNG phải button/link ---
    this.productsTab = page.getByText('Sản phẩm', { exact: true });
    this.logoutTab = page.getByText('Đăng xuất', { exact: true });

    // --- Màn sản phẩm (App.jsx:337-604) ---
    this.productsHeading = page.getByRole('heading', { name: 'Quản lý Sản phẩm' });
    this.nameInput = page.getByPlaceholder('Tên sản phẩm');
    this.priceInput = page.getByPlaceholder('Giá tiền');
    this.imageUrlInput = page.getByPlaceholder('URL Ảnh');
    this.descriptionInput = page.getByPlaceholder('Mô tả');
    this.categorySelect = page.getByRole('combobox');
    this.saveButton = page.getByRole('button', { name: 'Lưu sản phẩm' });
    this.cancelEditButton = page.getByRole('button', { name: 'Hủy sửa' });

    // Tiêu đề form đổi theo chế độ (App.jsx:486-488) — dùng để khẳng định đang add hay edit.
    this.addFormTitle = page.getByRole('heading', { name: 'Thêm sản phẩm mới' });
    this.editFormTitle = page.getByRole('heading', { name: 'Sửa sản phẩm' });
  }

  async goto() {
    await this.page.goto(ADMIN_BASE_URL);
  }

  /** Đăng nhập qua UI thật. Trả về message của alert nếu bị từ chối, ngược lại trả null. */
  async loginUi(email, password) {
    await expect(this.loginHeading).toBeVisible();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    let dialogMessage = null;
    const dialogHandler = async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    };
    this.page.on('dialog', dialogHandler);

    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/login')),
      this.loginButton.click(),
    ]);
    // Chờ FE xử lý xong response: hoặc vào được sidebar, hoặc vẫn ở màn login.
    await expect
      .poll(async () => (await this.productsTab.isVisible()) || dialogMessage !== null)
      .toBe(true);

    this.page.off('dialog', dialogHandler);
    return dialogMessage;
  }

  /**
   * Bỏ qua login UI bằng cách bơm sẵn JWT admin vào localStorage (App.jsx:7).
   * Dùng cho các test không kiểm thử bản thân luồng đăng nhập.
   */
  async signInViaToken(token) {
    await this.page.addInitScript(
      (jwt) => window.localStorage.setItem('adminToken', jwt),
      token,
    );
  }

  /**
   * Mở tab Sản phẩm và chờ **bảng đã nạp xong dữ liệu**.
   * GAP-04 (Phase 4): trước đây chỉ chờ nút "Lưu sản phẩm" hiện — nút đó thuộc form, có ngay
   * lập tức, trong khi `fetchData()` vẫn đang chạy. Test nào đếm số dòng ngay sau đó có thể
   * đọc phải bảng rỗng => flaky. Nay chờ đúng dòng dữ liệu đầu tiên (nút "Sửa") xuất hiện.
   */
  async openProductsTab() {
    await this.productsTab.click();
    await expect(this.productsHeading).toBeVisible();
    await expect(this.saveButton).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sửa' }).first()).toBeVisible();
  }

  /** Số dòng sản phẩm đang hiển thị (trừ dòng header của bảng). */
  async visibleRowCount() {
    return (await this.page.getByRole('row').count()) - 1;
  }

  /** Locator dòng bảng chứa đúng tên sản phẩm. */
  rowByName(name) {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  /** Số dòng mang tên này — dùng để bắt bug "fake mass update". */
  countRowsWithName(name) {
    return this.rowByName(name).count();
  }

  /** Điền form và bấm Lưu, chờ đúng response của /api/products. */
  async fillAndSave({ name, price, description, imageUrl }, method) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (price !== undefined) await this.priceInput.fill(String(price));
    if (imageUrl !== undefined) await this.imageUrlInput.fill(imageUrl);
    if (description !== undefined) await this.descriptionInput.fill(description);

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/products') && r.request().method() === method,
      ),
      this.saveButton.click(),
    ]);
    return response;
  }

  /** Bấm nút "Sửa" ở dòng có tên cho trước; form chuyển sang chế độ sửa. */
  async startEditing(name) {
    await this.rowByName(name).getByRole('button', { name: 'Sửa' }).click();
    await expect(this.editFormTitle).toBeVisible();
    await expect(this.nameInput).toHaveValue(name);
  }

  /** Bấm nút "Xóa" ở dòng có tên cho trước và chờ DELETE hoàn tất. */
  async deleteByName(name) {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/products/') && r.request().method() === 'DELETE',
      ),
      this.rowByName(name).getByRole('button', { name: 'Xóa' }).click(),
    ]);
    return response;
  }

  /** Bắt đúng 1 alert() tiếp theo (App.jsx dùng alert cho "Cập nhật thành công!" và lỗi). */
  captureNextDialog() {
    return new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
  }
}
