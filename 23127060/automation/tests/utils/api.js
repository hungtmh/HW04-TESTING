// Helper gọi API SUT trực tiếp — dùng để:
//  1) tạo dữ liệu tiền đề nhanh (register user riêng cho mỗi test),
//  2) làm assertion pattern #3 "API/back-end state" (§4.3 SKILL).
// Mọi hành vi ở đây đã xác minh bằng curl trong Phase 0.
import { API_BASE_URL } from './env.js';

/**
 * Đăng ký user mới. Backend không hash mật khẩu, không check trùng email (server.js:20-29).
 * @param {import('@playwright/test').APIRequestContext} request
 */
export async function registerUser(request, { name, email, password }) {
  const res = await request.post(`${API_BASE_URL}/register`, {
    data: { name, email, password },
  });
  if (!res.ok()) throw new Error(`registerUser failed ${res.status()}: ${await res.text()}`);
  return res.json();
}

/**
 * Đăng nhập, trả { token, user }. Ném lỗi nếu không 200 để test fail sớm với thông điệp rõ.
 * @param {import('@playwright/test').APIRequestContext} request
 */
export async function loginUser(request, { email, password }) {
  const res = await request.post(`${API_BASE_URL}/login`, { data: { email, password } });
  if (!res.ok()) throw new Error(`loginUser failed ${res.status()}: ${await res.text()}`);
  return res.json();
}

/** Tạo user mới + đăng nhập luôn, trả { email, password, token, user }. */
export async function createAndLoginUser(request, { email, password, name = 'PW Test User' }) {
  await registerUser(request, { name, email, password });
  const { token, user } = await loginUser(request, { email, password });
  return { email, password, token, user };
}

/** Lấy resetToken 4 số qua API (server.js:66-82 trả token thẳng trong body — chính là BUG-03-02). */
export async function requestResetToken(request, email) {
  const res = await request.post(`${API_BASE_URL}/forgot-password`, { data: { email } });
  return { status: res.status(), body: await res.json() };
}

/** Gọi reset-password thô, trả cả status để assert mã lỗi. */
export async function resetPassword(request, { email, resetToken, newPassword }) {
  const res = await request.post(`${API_BASE_URL}/reset-password`, {
    data: { email, resetToken, newPassword },
  });
  return { status: res.status(), body: await res.json() };
}

/** Đọc đơn hàng theo id — endpoint này KHÔNG có auth (server.js:340), dùng để verify state sau checkout. */
export async function getOrderById(request, orderId) {
  const res = await request.get(`${API_BASE_URL}/orders/${orderId}`);
  return { status: res.status(), body: await res.json() };
}

/** Đơn hàng của chính user (cần token). Dùng để lấy đơn mới nhất sau khi checkout qua UI. */
export async function getMyOrders(request, token) {
  const res = await request.get(`${API_BASE_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) throw new Error(`getMyOrders failed ${res.status()}`);
  return res.json();
}

/** Danh sách sản phẩm (public). */
export async function getProducts(request) {
  const res = await request.get(`${API_BASE_URL}/products`);
  return res.json();
}

/** Chi tiết 1 sản phẩm — trả cả status vì id lạ cho 200 {} (BUG-15-05). */
export async function getProductById(request, id) {
  const res = await request.get(`${API_BASE_URL}/products/${id}`);
  return { status: res.status(), body: await res.json() };
}

/**
 * Tạo sản phẩm qua API. `token` để undefined = KHÔNG gửi Authorization
 * -> đúng kịch bản chứng minh BUG-15-01 (thiếu access control).
 */
export async function createProduct(request, payload, token) {
  const res = await request.post(`${API_BASE_URL}/products`, {
    data: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status(), body: await res.json() };
}

export async function updateProduct(request, id, payload, token) {
  const res = await request.put(`${API_BASE_URL}/products/${id}`, {
    data: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status(), body: await res.json() };
}

export async function deleteProduct(request, id, token) {
  const res = await request.delete(`${API_BASE_URL}/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status(), body: await res.json() };
}

/** Áp mã giảm giá. Trả status + body để bắt được cả nhánh lỗi lẫn nhánh tính sai. */
export async function applyCoupon(request, { code, total_amount, user_id }) {
  const res = await request.post(`${API_BASE_URL}/apply-coupon`, {
    data: { code, total_amount, user_id },
  });
  return { status: res.status(), body: await res.json() };
}

/** Checkout thô qua API — dùng cho các case security không đi qua UI được. */
export async function checkout(request, { total_amount, shipping_address }, token) {
  const res = await request.post(`${API_BASE_URL}/checkout`, {
    data: { total_amount, shipping_address },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status(), body: await res.json() };
}

/** Dọn sản phẩm do test tạo ra, để bảng admin không phình sau nhiều lần chạy. */
export async function cleanupProduct(request, id) {
  if (!id) return;
  await request.delete(`${API_BASE_URL}/products/${id}`).catch(() => {});
}
