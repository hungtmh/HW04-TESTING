// Cấu hình môi trường SUT — 23127060.
// Port đọc từ ENV để đổi port KHÔNG phải sửa code test (Vite tự cấp port tăng dần).
// Giá trị mặc định đã xác minh bằng curl trong Phase 0 (xem report/00-SUT-RECON.md §1).

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
export const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:5173';
export const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || 'http://localhost:5174';

/** Tài khoản seed công khai của SUT (database.js:88-90) — không phải credential thật. */
export const SEED_ACCOUNTS = {
  admin: { email: 'admin@eshop.com', password: 'Admin123!', role: 'admin' },
  user: { email: 'test@eshop.com', password: 'Test1234!', role: 'user' },
};

/** Sản phẩm seed id 1..5 (database.js:95-100) — dùng làm mốc so sánh, không sửa. */
export const SEED_PRODUCT_COUNT = 5;

/**
 * Mật khẩu "hợp lệ" theo regex của FE (ForgotPassword.jsx:26).
 * Regex đòi khoảng trắng `(?=.*\s)` và CẤM ký tự đặc biệt -> đây là bug, xem BUG-03-01.
 */
export const FE_VALID_PASSWORD = 'New Pass 123';
