// Page Object — Home (thêm vào giỏ) + /cart (frontend-web/src/pages/Home.jsx, Cart.jsx)
// Giỏ hàng sống trong React Context in-memory (CartContext.jsx:7) => KHÔNG thể seed qua API,
// mọi test luồng UI phải thêm sản phẩm bằng chính UI trong cùng một phiên trang.
import { expect } from '@playwright/test';
import { WEB_BASE_URL } from '../utils/env.js';

export class CartPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.emptyMessage = page.getByText('Giỏ hàng của bạn đang trống');
    this.checkoutButton = page.getByRole('button', { name: 'Tiến hành thanh toán' });
    this.cartHeading = page.getByRole('heading', { name: 'Giỏ Hàng' });
    this.cartLink = page.getByRole('link', { name: 'Giỏ hàng' });
    // Tổng tạm tính hiển thị ở Cart.jsx:66 — định vị bằng nhãn tiếng Việt, không bằng class.
    this.subtotalLabel = page.getByText(/Tổng tạm tính:/);
  }

  async gotoHome() {
    await this.page.goto(`${WEB_BASE_URL}/`);
    await expect(this.page.getByRole('heading', { name: 'Danh sách sản phẩm' })).toBeVisible();
  }

  async gotoCart() {
    await this.page.goto(`${WEB_BASE_URL}/cart`);
  }

  /**
   * Thêm sản phẩm thứ `index` (0-based) trên trang chủ vào giỏ.
   * Dùng nút "Thêm vào giỏ" của Home.jsx:110 — KHÔNG dùng trang ProductDetail vì nút ở đó
   * cố tình bỏ qua click đầu tiên (ProductDetail.jsx:22-25) => nguồn flaky.
   */
  async addProductToCart(index = 0) {
    const buttons = this.page.getByRole('button', { name: 'Thêm vào giỏ' });
    await expect(buttons.first()).toBeVisible();
    await buttons.nth(index).click();
  }

  /** Tên sản phẩm thứ `index` trên trang chủ — dùng để đối chiếu về sau. */
  async productNameAt(index = 0) {
    return (await this.page.getByRole('heading', { level: 2 }).nth(index).textContent())?.trim();
  }

  /** Số dòng sản phẩm đang có trong giỏ (bỏ dòng header của bảng). */
  async itemRowCount() {
    if (await this.emptyMessage.isVisible()) return 0;
    return (await this.page.getByRole('row').count()) - 1;
  }

  /** Đọc "Tổng tạm tính" và ép về số nguyên VND (bỏ dấu chấm phân cách và ký hiệu ₫). */
  async readSubtotal() {
    const text = await this.subtotalLabel.textContent();
    const digits = text?.replace(/[^\d]/g, '');
    return Number(digits);
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }
}
