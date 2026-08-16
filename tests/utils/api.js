const { expect } = require('@playwright/test');
const { API_BASE_URL, uniqueEmail } = require('./env');

/**
 * Shared back-end helpers for the HW04 suites.
 *
 * Tests use these to arrange preconditions (a logged-in customer, a category
 * with a product in it) and to verify outcomes against stored state rather
 * than against whatever the page happens to be showing.
 */

/** Registers a throwaway customer and returns { email, password, token, id }. */
async function createCustomer(request, { namePrefix = 'Test User', password = 'Password 123' } = {}) {
  const email = uniqueEmail('cust');
  const created = await request.post(`${API_BASE_URL}/api/register`, {
    data: { name: `${namePrefix} ${Date.now()}`, email, password },
  });
  expect(created.ok(), 'customer registration must succeed').toBeTruthy();

  const auth = await request.post(`${API_BASE_URL}/api/login`, { data: { email, password } });
  expect(auth.ok(), 'customer login must succeed').toBeTruthy();
  const body = await auth.json();

  return { email, password, token: body.token, id: body.user.id };
}

/**
 * Logs in as the seeded admin. Credentials come from the caller (which reads
 * them from a data file) so the wrong-password lock described in BUG-06 cannot
 * be reintroduced by hardcoding here.
 */
async function loginAdmin(request, { email, password }) {
  const auth = await request.post(`${API_BASE_URL}/api/login`, { data: { email, password } });
  expect(
    auth.ok(),
    `admin login must succeed (status ${auth.status()}: ${await auth.text()})`,
  ).toBeTruthy();
  return (await auth.json()).token;
}

/**
 * Builds the auth header, or no header at all when no token is supplied.
 * Sending the literal string "Bearer undefined" would make the server answer
 * 403 (bad signature) instead of 401 (missing credentials), which would hide
 * whether the unauthenticated path is actually guarded.
 */
const authHeaders = token => (token ? { Authorization: `Bearer ${token}` } : {});

/** Applies a coupon straight through the API, bypassing the UI. */
async function applyCoupon(request, { code, total_amount, user_id }) {
  const res = await request.post(`${API_BASE_URL}/api/apply-coupon`, {
    data: { code, total_amount, ...(user_id !== undefined ? { user_id } : {}) },
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

/** Records one use of a coupon for the authenticated user. */
async function recordCouponUsage(request, token, couponId) {
  return request.post(`${API_BASE_URL}/api/coupon-usage`, {
    headers: authHeaders(token),
    data: { coupon_id: couponId },
  });
}

async function listCategories(request) {
  const res = await request.get(`${API_BASE_URL}/api/categories`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function createCategory(request, token, name) {
  const res = await request.post(`${API_BASE_URL}/api/categories`, {
    headers: authHeaders(token),
    data: { name },
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

async function updateCategory(request, token, id, name) {
  const res = await request.put(`${API_BASE_URL}/api/categories/${id}`, {
    headers: authHeaders(token),
    data: { name },
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

async function deleteCategory(request, token, id) {
  const res = await request.delete(`${API_BASE_URL}/api/categories/${id}`, {
    headers: authHeaders(token),
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

async function createProduct(request, token, product) {
  const res = await request.post(`${API_BASE_URL}/api/products`, {
    headers: authHeaders(token),
    data: product,
  });
  return { status: res.status(), body: await res.json().catch(() => null) };
}

async function listProducts(request) {
  const res = await request.get(`${API_BASE_URL}/api/products`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

/**
 * Raw product search that does NOT assert the response is ok. FR-05 needs to
 * inspect the failure path too: a `%` or `'` in the term makes the SUT return a
 * 500 with a raw SQL error, so a helper that pre-asserts 200 (like listProducts)
 * cannot express those tests. Returns the status, content-type and parsed/raw
 * body for the caller to assert on.
 */
async function searchProducts(request, term) {
  const res = await request.get(`${API_BASE_URL}/api/products`, {
    params: term === undefined ? {} : { search: term },
  });
  const contentType = res.headers()['content-type'] || '';
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* HTML error body */ }
  return { status: res.status(), contentType, text, json };
}

module.exports = {
  createCustomer,
  loginAdmin,
  authHeaders,
  applyCoupon,
  recordCouponUsage,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  listProducts,
  searchProducts,
};
