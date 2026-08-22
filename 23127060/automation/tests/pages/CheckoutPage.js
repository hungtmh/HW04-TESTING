// Page Object — /checkout (frontend-web/src/pages/Checkout.jsx)
import { expect } from '@playwright/test';

export class CheckoutPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' });

    // 🔴 Ô "Tổng tiền thanh toán (VND)" là <input type="number"> SỬA ĐƯỢC (Checkout.jsx:96-106).
    // role của input[type=number] là "spinbutton" và đây là spinbutton duy nhất trên trang.
    this.totalInput = page.getByRole('spinbutton');

    this.couponInput = page.getByPlaceholder('Nhập mã giảm giá...');
    this.applyCouponButton = page.getByRole('button', { name: 'Áp dụng' });
    this.confirmButton = page.getByRole('button', { name: 'Xác Nhận Thanh Toán' });

    this.successHeading = page.getByRole('heading', { name: 'Thanh toán thành công!' });
    this.backHomeLink = page.getByRole('button', { name: 'Quay lại trang chủ' });

    // Kết quả coupon (Checkout.jsx:129-135) — định vị bằng nhãn tiếng Việt, không bằng class.
    this.couponSavedLine = page.getByText(/Tiết kiệm:/);
    this.couponFinalLine = page.getByText(/^Thành tiền:/);
    this.grandTotalLine = page.getByText(/Tổng thanh toán:/);
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.confirmButton).toBeEnabled();
  }

  /** Giá trị hiện tại của ô tổng tiền (do FE tính từ cartTotal). */
  async readTotal() {
    return Number(await this.totalInput.inputValue());
  }

  /** Sửa tay ô tổng tiền — đây chính là thao tác khai thác BUG-08-01. */
  async tamperTotal(newTotal) {
    await this.totalInput.fill(String(newTotal));
    await expect(this.totalInput).toHaveValue(String(newTotal));
  }

  /** Nhập mã và chờ đúng response của /api/apply-coupon (không dùng waitForTimeout). */
  async applyCoupon(code) {
    await this.couponInput.fill(code);
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/apply-coupon')),
      this.applyCouponButton.click(),
    ]);
    return response;
  }

  /** Bấm xác nhận và chờ đúng response của /api/checkout. */
  async confirm() {
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/checkout')),
      this.confirmButton.click(),
    ]);
    return response;
  }

  /** Đọc "Thành tiền" sau khi áp coupon, ép về số nguyên VND. */
  async readCouponFinalAmount() {
    await expect(this.couponFinalLine).toBeVisible();
    const text = await this.couponFinalLine.textContent();
    return Number(text?.replace(/[^\d]/g, ''));
  }
}
