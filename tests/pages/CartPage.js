class CartPage {
  constructor(page) {
    this.page = page;
    
    this.tableRows = page.locator('tbody tr');
    this.emptyStateHeading = page.locator('h2'); // "Giỏ hàng của bạn đang trống"
    this.continueShoppingLink = page.locator('a[href="/"]', { hasText: /Mua tiếp|Tiếp tục mua sắm/ });
    this.totalLabel = page.locator('.text-xl.font-bold'); // "Tổng tạm tính:" or "Tổng cộng:"
    this.totalAmount = page.locator('.text-red-600');
    this.checkoutButton = page.locator('button', { hasText: 'Tiến hành thanh toán' });
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async openFromHeader() {
    await this.page.locator('header a[href="/cart"]').click();
  }

  async addProductByName(name, quantity = 1) {
    const heading = this.page.locator('h2', { hasText: name }).first();
    const card = heading.locator('xpath=ancestor::div[contains(@class,"bg-white")][1]');
    if (Number(quantity) === 1) {
      await card.locator('button', { hasText: 'Thêm vào giỏ' }).click();
      return;
    }

    await card.locator('a', { hasText: 'Xem chi tiết' }).click();
    await this.page.locator('input[type="number"]').fill(String(quantity));
    await this.page.locator('button', { hasText: 'Thêm vào giỏ hàng' }).click();
  }

  async addFirstProducts(count) {
    const buttons = this.page.locator('button', { hasText: 'Thêm vào giỏ' });
    for (let index = 0; index < count; index += 1) await buttons.nth(index).click();
  }

  getProductRow(index) {
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
