const { expect } = require('@playwright/test');

/**
 * Page Object for FR-09 - Discount coupons (frontend-web /checkout).
 *
 * SESSION NOTE: AuthContext reads localStorage.token on mount and then calls
 * GET /api/users/me, so a session can be seeded without driving the login form.
 * That keeps each coupon test focused on the coupon, not on authentication.
 *
 * CART NOTE: CartContext keeps the cart in plain React state with no
 * persistence, so a full page.goto() empties it. The end-to-end test therefore
 * navigates by clicking links (client-side routing keeps the provider mounted),
 * while the calculation tests go straight to /checkout and drive the editable
 * total field instead - the coupon maths depends only on that value.
 */
class CheckoutPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' });
    this.totalInput = page.locator('input[type="number"]');
    this.couponInput = page.getByPlaceholder('Nhập mã giảm giá...');
    this.applyButton = page.getByRole('button', { name: 'Áp dụng' });
    this.payButton = page.getByRole('button', { name: 'Xác Nhận Thanh Toán' });

    // The success block and the error line are the two possible outcomes of
    // applying a coupon; both live inside the grey coupon panel.
    this.couponPanel = page.locator('div.bg-gray-50');
    this.couponError = this.couponPanel.locator('p.text-red-600');
    this.couponSuccess = this.couponPanel.locator('div.text-green-700');
    this.savingsLine = this.couponSuccess.locator('p', { hasText: 'Tiết kiệm:' });
    this.finalLine = this.couponSuccess.locator('p', { hasText: 'Thành tiền:' });

    this.payableLine = page.locator('span', { hasText: 'Tổng thanh toán:' });
    this.paidHeading = page.getByRole('heading', { name: 'Thanh toán thành công!' });
  }

  /** Puts a JWT in localStorage before any app code runs, then opens /checkout. */
  async gotoAuthenticated(token) {
    await this.page.addInitScript(t => window.localStorage.setItem('token', t), token);
    await this.page.goto('/checkout');
    await expect(this.heading).toBeVisible();
  }

  async setTotal(amount) {
    await this.totalInput.fill(String(amount));
  }

  async applyCoupon(code) {
    await this.couponInput.fill(code);
    // Wait for the request the button fires, so assertions never race it
    // (the same class of mistake as human review finding R-03 on FR-01).
    const call = this.page
      .waitForResponse(r => r.url().includes('/api/apply-coupon'), { timeout: 10_000 })
      .catch(() => null);
    await this.applyButton.click();
    return call;
  }

  /**
   * Reads a formatted amount out of the success block.
   * The UI prints Vietnamese-grouped numbers such as "-4.500.000 ₫", so every
   * separator has to be stripped before the string becomes a number again.
   *
   * Two traps, both hit during review (finding R-09):
   *  - The leading minus is already part of the match, so it must NOT be
   *    reapplied afterwards. Multiplying by -1 on top turned the SUT's negative
   *    discount back into a positive one and would have put the wrong figure
   *    into the bug report.
   *  - The grouping separator depends on the browser locale, which Playwright
   *    leaves at en-US, so the page actually renders "50,000" and not "50.000".
   *    A character class that omits the comma splits that into "50" and "000"
   *    and silently yields 0.
   */
  async readAmount(which) {
    const line = which === 'discount' ? this.savingsLine : this.finalLine;
    const text = await line.innerText();
    const match = text.match(/-?[\d.,]+/g);
    if (!match) throw new Error(`No number found in "${text}"`);
    return Number(match[match.length - 1].replace(/[.,]/g, ''));
  }

  /** Full customer journey: home -> add product -> cart -> checkout. */
  async journeyToCheckout(token) {
    await this.page.addInitScript(t => window.localStorage.setItem('token', t), token);
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
    await this.page.getByRole('link', { name: 'Giỏ hàng' }).click();
    await this.page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
    await expect(this.heading).toBeVisible();
  }
}

module.exports = { CheckoutPage };
