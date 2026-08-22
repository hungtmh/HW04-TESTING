// Page Object — /forgot-password (frontend-web/src/pages/ForgotPassword.jsx)
// Selector policy §4.4: getByRole > getByPlaceholder > getByText. KHÔNG dùng class Tailwind cho phần tử
// tương tác. Ngoại lệ duy nhất được ghi chú rõ: hộp hiển thị OTP không có role/text ổn định nào khác.
import { expect } from '@playwright/test';
import { WEB_BASE_URL } from '../utils/env.js';

export class ForgotPasswordPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // --- Bước 1 (ForgotPassword.jsx:44-60) ---
    // input email là <input type="text"> KHÔNG có placeholder và <label> không có htmlFor
    // -> getByLabel() không hoạt động; ở bước 1 chỉ có duy nhất 1 textbox.
    this.emailInput = page.getByRole('textbox').first();
    this.requestOtpButton = page.getByRole('button', { name: 'Lấy mã OTP' });

    // --- Bước 2 (ForgotPassword.jsx:63-99) ---
    // ĐÃ KIỂM CHỨNG BẰNG RUN THẬT: Playwright coi cả input[type=password] là role "textbox",
    // nên ở bước 2 getByRole('textbox') khớp 2 phần tử -> strict mode violation.
    // Ô OTP đứng trước ô mật khẩu trong DOM (jsx:71-90) nên .first() là ổn định và không phụ thuộc class.
    this.otpInput = page.getByRole('textbox').first();
    // Ô mật khẩu phân biệt bằng attribute type (thuộc tính HTML ổn định), KHÔNG dùng class Tailwind.
    this.newPasswordInput = page.locator('input[type="password"]');
    this.submitResetButton = page.getByRole('button', { name: 'Đặt lại mật khẩu' });
    this.backButton = page.getByRole('button', { name: '← Quay lại' });

    // Hộp xanh hiển thị OTP (ForgotPassword.jsx:68-70): không có role, không có text cố định
    // ngoài tiền tố "Mã OTP của bạn là:" -> định vị bằng chính tiền tố đó, không bằng class.
    this.otpBanner = page.getByText(/Mã OTP của bạn là:/);
  }

  async goto() {
    await this.page.goto(`${WEB_BASE_URL}/forgot-password`);
    await expect(this.page.getByRole('heading', { name: 'Quên Mật Khẩu' })).toBeVisible();
  }

  /**
   * Bước 1: gửi email và chờ đúng response của /api/forgot-password (không dùng waitForTimeout).
   * @returns {Promise<import('@playwright/test').Response>}
   */
  async requestOtp(email) {
    await this.emailInput.fill(email);
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/api/forgot-password')),
      this.requestOtpButton.click(),
    ]);
    return response;
  }

  /** Đọc mã OTP 4 số mà FE bày ra trên màn hình (chính là BUG-03-02 nhìn từ phía UI). */
  async readOtpFromScreen() {
    await expect(this.otpBanner).toBeVisible();
    const text = await this.otpBanner.textContent();
    const match = text?.match(/(\d{4})/);
    if (!match) throw new Error(`Không tìm thấy OTP 4 số trong: ${JSON.stringify(text)}`);
    return match[1];
  }

  /** Bước 2: điền OTP + mật khẩu mới rồi submit. KHÔNG chờ response ở đây vì FE có thể chặn tại regex. */
  async submitReset(otp, newPassword) {
    await this.otpInput.fill(otp);
    await this.newPasswordInput.fill(newPassword);
    await this.submitResetButton.click();
  }

  /** True khi đang ở bước 1 (nút "Lấy mã OTP" hiển thị). */
  async isOnStep1() {
    return this.requestOtpButton.isVisible();
  }

  /**
   * Bắt đúng 1 alert() tiếp theo và trả về nội dung.
   * SUT dùng alert() cho cả thành công lẫn lỗi (ForgotPassword.jsx:22,33,36) nên đây là
   * kênh assert bắt buộc — không có toast trong DOM để chờ.
   * @returns {Promise<string>}
   */
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
