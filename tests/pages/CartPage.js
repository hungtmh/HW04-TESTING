const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;
    
    this.tableRows = page.locator('tbody tr');
    this.emptyStateHeading = page.locator('h2'); // "Giỏ hàng của bạn đang trống"
    this.continueShoppingLink = page.locator('a', { hasText: 'Mua tiếp' }).or(page.locator('a', { hasText: 'Tiếp tục mua sắm' }));
    this.totalLabel = page.locator('.text-xl.font-bold'); // "Tổng tạm tính:" or "Tổng cộng:"
    this.totalAmount = page.locator('.text-red-600');
    this.checkoutButton = page.locator('button', { hasText: 'Tiến hành thanh toán' });
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async getProductRow(index) {
    const row = this.tableRows.nth(index);
    return {
      name: row.locator('td').nth(0),
      price: row.locator('td').nth(1),
      quantity: row.locator('td').nth(2),
      subtotal: row.locator('td').nth(3),
      removeBtn: row.locator('button', { hasText: 'Xóa' })
    };
  }
}

module.exports = { CartPage };
