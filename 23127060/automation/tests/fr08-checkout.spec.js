// FR-08 — Thanh toán (Checkout) | 23127060 Ninh Văn Khải
// Data-driven: tests/data/fr08-checkout-cases.json + fr08-order-totals.csv.
// Assertion pattern: A1 (UI text) · A2 (URL) · A3 (API state) · A4 (boundary/số học) · A5 (dialog).
import { test, expect } from '@playwright/test';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { loadJson, loadCsv, uniqueEmail } from './utils/data.js';
import { API_BASE_URL, WEB_BASE_URL } from './utils/env.js';
import { checkout, getMyOrders, getOrderById } from './utils/api.js';
import { annotate, freshUser as makeUser } from './utils/fixtures.js';

const cases = loadJson('fr08-checkout-cases.json');
const couponRows = loadCsv('fr08-order-totals.csv');

const PASSWORD = 'Check Out 123';

const byId = (id) => {
  const c = cases.find((x) => x.id === id);
  if (!c) throw new Error(`Không có case ${id} trong fr08-checkout-cases.json`);
  return c;
};

/** Gắn mã bug + dòng source vào test để HTML report truy vết được test <-> bug. */
const trace = (info, c, patterns) =>
  annotate(info, { bug: c.bug, source: c.source, patterns });

/** Tạo user riêng cho mỗi test + trả token. Test không bao giờ dùng chung dữ liệu. */
async function freshUser(request, prefix = 'fr08') {
  return makeUser(request, { prefix, password: PASSWORD });
}

/**
 * Bơm sẵn JWT vào localStorage trước khi trang chạy để bỏ qua login UI (AuthContext.jsx:9).
 * TC01 vẫn đăng nhập bằng UI thật để chứng minh luồng đăng nhập hoạt động.
 */
async function signInViaToken(page, token) {
  await page.addInitScript((jwt) => window.localStorage.setItem('token', jwt), token);
}

/** Chờ AuthContext nạp xong user (header đổi sang nút "Thoát") — thay cho waitForTimeout. */
async function waitForAuthReady(page) {
  await expect(page.getByRole('button', { name: 'Thoát' })).toBeVisible();
}

test.describe('FR-08 Checkout', () => {
  // ---------------------------------------------------------------- luồng UI
  test(`FR08-${byId('TC01').id} ${byId('TC01').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC01');
    trace(test.info(), c, ['A1','A3','A4']);
    const email = uniqueEmail('fr08-tc01');
    await request.post(`${API_BASE_URL}/register`, {
      data: { name: 'FR08 User', email, password: PASSWORD },
    });

    // Đăng nhập bằng UI THẬT (yêu cầu §2.1 SKILL: ít nhất 1 test đi qua login thật)
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, PASSWORD);

    const cart = new CartPage(page);
    await cart.gotoHome();
    // GAP-05 (Phase 4): bản trước không hề kiểm tra ĐÚNG sản phẩm nào vào giỏ — chỉ kiểm tra
    // "có tiền > 0". Nay ghi lại tên sản phẩm đã bấm và assert nó xuất hiện trong giỏ.
    const productName = await cart.productNameAt(c.productIndex);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();

    // A1 — đúng sản phẩm vừa chọn nằm trong giỏ
    await expect(cart.rowByProductName(productName), 'A1').toHaveCount(1);

    const subtotal = await cart.readSubtotal();
    expect(subtotal, 'tiền đề: giỏ phải có tiền').toBeGreaterThan(0);
    await cart.goToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectLoaded();
    // A4 — FE phải chuyển đúng tổng tiền của giỏ sang trang thanh toán
    expect(await checkoutPage.readTotal(), 'A4: tổng khớp giỏ hàng').toBe(subtotal);

    const res = await checkoutPage.confirm();
    expect(res.status(), 'A3').toBe(200);
    // A1 — màn hình thành công
    await expect(checkoutPage.successHeading).toBeVisible();

    // A3 — đơn hàng thật sự nằm trong DB với đúng số tiền
    const { token } = (await request.post(`${API_BASE_URL}/login`, {
      data: { email, password: PASSWORD },
    }).then((r) => r.json()));
    const orders = await getMyOrders(request, token);
    expect(orders.length, 'A3: có đúng 1 đơn').toBe(1);
    expect(orders[0].total_amount, 'A4: tổng đơn = tổng giỏ').toBe(subtotal);
  });

  test(`FR08-${byId('TC02').id} ${byId('TC02').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC02');
    trace(test.info(), c, ['A1','A4']);
    const user = await freshUser(request, 'fr08-tc02');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoCart();
    // A1 — trạng thái rỗng
    await expect(cart.emptyMessage).toBeVisible();
    expect(await cart.itemRowCount(), 'A4: 0 dòng sản phẩm').toBe(0);
    await expect(page.getByText(c.expect.text)).toBeVisible();
  });

  test(`FR08-${byId('TC03').id} ${byId('TC03').title} @fr08`, async ({ page }) => {
    const c = byId('TC03');
    trace(test.info(), c, ['A5','A2']);
    // KHÔNG đăng nhập.
    const cart = new CartPage(page);
    await cart.gotoHome();
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    await expect(cart.checkoutButton).toBeVisible();

    const dialogPromise = new Promise((resolve) => {
      page.once('dialog', async (d) => {
        const m = d.message();
        await d.accept();
        resolve(m);
      });
    });
    await cart.goToCheckout();

    // A5 — SUT chặn bằng alert()
    expect(await dialogPromise, 'A5').toContain(c.expect.dialog);
    // A2 — bị đẩy sang trang đăng nhập
    await expect(page).toHaveURL(new RegExp(`${c.expect.url}$`));
  });

  test(`FR08-${byId('TC04').id} ${byId('TC04').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC04'); // BUG-08-01
    trace(test.info(), c, ['A1','A3','A4']);
    const user = await freshUser(request, 'fr08-tc04');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoHome();
    await waitForAuthReady(page);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    const realSubtotal = await cart.readSubtotal();
    await cart.goToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectLoaded();
    // 🔴 Khách hàng tự sửa số tiền phải trả xuống 1 ₫
    await checkoutPage.tamperTotal(c.tamperTotal);
    const res = await checkoutPage.confirm();

    expect(res.status(), 'A3').toBe(200);
    await expect(checkoutPage.successHeading, 'A1: vẫn báo thành công').toBeVisible();

    // A3 + A4 — đơn hàng lưu 1 ₫ trong khi giỏ trị giá hàng chục triệu
    const orders = await getMyOrders(request, user.token);
    expect(orders[0].total_amount, 'A4: số tiền bị giả mạo').toBe(c.expect.orderTotal);
    expect(realSubtotal, 'A4: giá trị thật của giỏ lớn hơn hẳn').toBeGreaterThan(
      c.expect.orderTotal,
    );
  });

  test(`FR08-${byId('TC09').id} ${byId('TC09').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC09'); // BUG-08-05
    trace(test.info(), c, ['A1','A3','A4']);
    const user = await freshUser(request, 'fr08-tc09');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoHome();
    await waitForAuthReady(page);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    await cart.goToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.confirm();
    await expect(checkoutPage.successHeading).toBeVisible();

    // Điều hướng bằng LINK trong SPA (không reload) để giữ nguyên React Context của giỏ.
    await checkoutPage.backHomeLink.click();
    await cart.cartLink.click();

    // A1 — giỏ vẫn còn hàng sau khi đã thanh toán xong => có thể đặt trùng đơn
    await expect(cart.emptyMessage, 'A1: giỏ đáng lẽ phải trống').toBeHidden();
    expect(await cart.itemRowCount(), 'A4: vẫn còn sản phẩm trong giỏ').toBeGreaterThan(0);

    // A3 — chứng minh hậu quả: bấm thanh toán lần nữa tạo thêm đơn thứ 2
    await cart.goToCheckout();
    await checkoutPage.confirm();
    const orders = await getMyOrders(request, user.token);
    expect(orders.length, 'A3: một giỏ hàng tạo ra 2 đơn').toBe(2);
  });

  test(`FR08-${byId('TC10').id} ${byId('TC10').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC10'); // BUG-08-06
    trace(test.info(), c, ['A3']);
    const user = await freshUser(request, 'fr08-tc10');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoHome();
    await waitForAuthReady(page);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    await cart.goToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.confirm();
    await expect(checkoutPage.successHeading).toBeVisible();

    // A3 — đơn hàng không có địa chỉ giao: FE không gửi trường shipping_address
    const orders = await getMyOrders(request, user.token);
    expect(orders[0].shipping_address, 'A3: địa chỉ giao hàng bị mất').toBe(
      c.expect.shippingAddress,
    );
  });

  test(`FR08-${byId('TC11').id} ${byId('TC11').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC11'); // BUG-08-07
    trace(test.info(), c, ['A1','A3','A4']);
    const user = await freshUser(request, 'fr08-tc11');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoHome();
    await waitForAuthReady(page);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    const subtotal = await cart.readSubtotal();
    await cart.goToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectLoaded();
    const res = await checkoutPage.applyCoupon(c.coupon);
    expect(res.status(), 'A3: SUT coi đây là áp mã thành công').toBe(200);

    const body = await res.json();
    const finalAmount = await checkoutPage.readCouponFinalAmount();

    // Soft assertion: gom TẤT CẢ triệu chứng của BUG-08-07 vào một lần chạy.
    // A4 — "giảm 10%" nhưng thành tiền GẤP 10 LẦN
    expect.soft(finalAmount, 'A4: thành tiền lẽ ra phải nhỏ hơn tổng giỏ').toBeGreaterThan(subtotal);
    expect.soft(finalAmount, 'A4: đúng bằng 10 lần tổng giỏ').toBe(subtotal * c.expect.multiplier);
    // A4 — số tiền "tiết kiệm" là số ÂM, tức là khách phải trả THÊM
    expect.soft(body.discount_amount, 'A4: discount_amount âm').toBeLessThan(0);
    // A1 — nhưng UI vẫn khoe "Áp dụng thành công! Giảm 10%"
    await expect.soft(page.getByText(/Áp dụng thành công/), 'A1').toBeVisible();
    // A1 — dòng "Tiết kiệm" hiển thị con số âm thẳng cho khách hàng nhìn thấy
    await expect.soft(checkoutPage.couponSavedLine, 'A1: dòng Tiết kiệm hiển thị số âm').toContainText('-');
  });

  test('FR08-TC20 my-orders only ever returns the caller own orders @fr08', async ({ request }) => {
    // Test bảo vệ (regression): /api/orders/my-orders lọc đúng theo user_id (server.js:320-329),
    // TRÁI NGƯỢC với /api/orders/:id vốn không có middleware (BUG-08-04).
    // Giữ test này để nếu ai sửa nhầm endpoint đúng thành sai thì phát hiện được ngay.
    const userA = await freshUser(request, 'fr08-tc20-a');
    const userB = await freshUser(request, 'fr08-tc20-b');

    const orderA = await checkout(request, { total_amount: 111111 }, userA.token);
    const orderB = await checkout(request, { total_amount: 222222 }, userB.token);
    expect(orderA.status, 'tiền đề').toBe(200);
    expect(orderB.status, 'tiền đề').toBe(200);

    const listA = await getMyOrders(request, userA.token);
    const listB = await getMyOrders(request, userB.token);

    // A3 — mỗi người chỉ thấy đơn của chính mình
    expect(listA.map((o) => o.id), 'A3: A chỉ thấy đơn của A').toEqual([orderA.body.orderId]);
    expect(listB.map((o) => o.id), 'A3: B chỉ thấy đơn của B').toEqual([orderB.body.orderId]);
    // A4 — số tiền không bị lẫn giữa hai người
    expect(listA[0].total_amount, 'A4').toBe(111111);
    expect(listB[0].total_amount, 'A4').toBe(222222);

    // A3 — nhưng chính đơn đó lại đọc được bằng request ẩn danh qua endpoint kia (BUG-08-04)
    const leaked = await getOrderById(request, orderA.body.orderId);
    expect(leaked.status, 'A3: endpoint /orders/:id vẫn hở').toBe(200);
    expect(leaked.body.user_id, 'A3: lộ đúng chủ đơn').toBe(userA.user.id);
  });

  test(`FR08-${byId('TC17').id} ${byId('TC17').title} @fr08`, async ({ page, request }) => {
    const c = byId('TC17'); // BUG-08-09
    trace(test.info(), c, ['A1','A4']);
    const user = await freshUser(request, 'fr08-tc17');
    await signInViaToken(page, user.token);

    const cart = new CartPage(page);
    await cart.gotoHome();
    await waitForAuthReady(page);
    await cart.addProductToCart(c.productIndex);
    await cart.cartLink.click();
    expect(await cart.itemRowCount(), 'tiền đề: giỏ có hàng').toBeGreaterThan(0);

    await page.reload();

    // A1 — F5 một cái là mất sạch giỏ hàng (state chỉ nằm trong bộ nhớ)
    await expect(page.getByText(c.expect.text), 'A1: giỏ rỗng sau reload').toBeVisible();
    expect(await cart.itemRowCount(), 'A4').toBe(0);
  });

  // --------------------------------------------------------------- luồng API
  test(`FR08-${byId('TC05').id} ${byId('TC05').title} @fr08`, async ({ request }) => {
    const c = byId('TC05'); // BUG-08-02
    trace(test.info(), c, ['A3','A4']);
    const user = await freshUser(request, 'fr08-tc05');

    const res = await checkout(request, { total_amount: c.totalAmount }, user.token);
    expect(res.status, 'A3').toBe(c.expect.status);

    const stored = await getOrderById(request, res.body.orderId);
    // A4 — đơn hàng có tổng tiền âm nằm trong CSDL
    expect(stored.body.total_amount, 'A4: tổng tiền âm được lưu').toBe(c.expect.storedTotal);
  });

  test(`FR08-${byId('TC06').id} ${byId('TC06').title} @fr08`, async ({ request }) => {
    const c = byId('TC06'); // BUG-08-02
    trace(test.info(), c, ['A3']);
    const user = await freshUser(request, 'fr08-tc06');

    const res = await checkout(request, { total_amount: c.totalAmount }, user.token);
    expect(res.status, 'A3').toBe(c.expect.status);

    const stored = await getOrderById(request, res.body.orderId);
    // A3 — cột khai báo INTEGER nhưng nhận được giá trị không phải số
    expect(Number.isFinite(Number(stored.body.total_amount)), 'A3: total_amount không là số').toBe(
      false,
    );
  });

  test(`FR08-${byId('TC07').id} ${byId('TC07').title} @fr08`, async ({ request }) => {
    const c = byId('TC07'); // BUG-08-03
    trace(test.info(), c, ['A3']);
    const user = await freshUser(request, 'fr08-tc07');

    // Giỏ hàng phía server hoàn toàn rỗng
    const cartRes = await request.get(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(await cartRes.json(), 'tiền đề: giỏ server rỗng').toEqual([]);

    const res = await checkout(request, { total_amount: c.totalAmount }, user.token);
    // A3 — vẫn tạo được đơn hàng từ một giỏ trống
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.orderId, 'A3: đơn hàng rỗng được tạo').toBeGreaterThan(0);
  });

  test(`FR08-${byId('TC08').id} ${byId('TC08').title} @fr08`, async ({ request }) => {
    const c = byId('TC08'); // BUG-08-04 (IDOR)
    trace(test.info(), c, ['A3']);
    const victim = await freshUser(request, 'fr08-tc08-victim');
    const attacker = await freshUser(request, 'fr08-tc08-attacker');

    const order = await checkout(request, { total_amount: c.totalAmount }, victim.token);
    expect(order.status, 'tiền đề').toBe(200);

    // A3 — không gửi token nào vẫn đọc được đơn của người khác
    const anonymous = await getOrderById(request, order.body.orderId);
    expect(anonymous.status, 'A3: request ẩn danh').toBe(c.expect.anonymousStatus);
    expect(anonymous.body.total_amount, 'A4').toBe(c.totalAmount);

    // A3 — user khác cũng đọc được, và response lộ luôn user_id của nạn nhân
    const other = await request.get(`${API_BASE_URL}/orders/${order.body.orderId}`, {
      headers: { Authorization: `Bearer ${attacker.token}` },
    });
    expect(other.status(), 'A3: user khác').toBe(c.expect.otherUserStatus);
    expect(anonymous.body.user_id, 'A3: lộ user_id của nạn nhân').toBe(victim.user.id);
    expect(victim.user.id).not.toBe(attacker.user.id);
  });

  test(`FR08-${byId('TC18').id} ${byId('TC18').title} @fr08`, async ({ request }) => {
    const c = byId('TC18');
    trace(test.info(), c, ['A3','A1']);
    // A3 — checkout có kiểm soát token (đối lập với product CRUD của FR-15)
    const res = await checkout(request, { total_amount: c.totalAmount }, undefined);
    expect(res.status, 'A3').toBe(c.expect.status);
    expect(res.body.error, 'A1').toBe(c.expect.error);
  });

  // ------------------------------------------- bảng boundary coupon (CSV)
  for (const row of couponRows) {
    test(`FR08-${row.id} ${row.label} @fr08`, async ({ request }) => {
      trace(test.info(), row, ['A3', 'A4', 'A1']);
      const code = row.coupon_code === '__EMPTY__' ? '' : row.coupon_code;
      const totalAmount = Number(row.total_amount);
      let userId;

      if (row.user_scope === 'fresh_user') {
        const user = await freshUser(request, `fr08-${row.id.toLowerCase()}`);
        userId = user.user.id;

        const preUses = Number(row.pre_uses);
        if (preUses > 0) {
          // Tra coupon_id thật từ API thay vì hardcode -> không vỡ nếu seed đổi thứ tự.
          const all = await request
            .get(`${API_BASE_URL}/coupons`, {
              headers: { Authorization: `Bearer ${user.token}` },
            })
            .then((r) => r.json());
          const coupon = all.find((x) => x.code === code);
          expect(coupon, `tiền đề: seed phải có coupon ${code}`).toBeTruthy();

          for (let i = 0; i < preUses; i += 1) {
            await request.post(`${API_BASE_URL}/coupon-usage`, {
              data: { coupon_id: coupon.id },
              headers: { Authorization: `Bearer ${user.token}` },
            });
          }
        }
      }

      const res = await request.post(`${API_BASE_URL}/apply-coupon`, {
        data: { code, total_amount: totalAmount, user_id: userId },
      });
      const body = await res.json();

      // A3 — mã trạng thái đúng như đặc tả rút từ server.js
      expect(res.status(), `A3: ${row.source}`).toBe(Number(row.expected_status));

      if (row.expected_final_amount) {
        // A4 — số học của chiết khấu
        expect(body.final_amount, `A4: ${row.expected_note || row.label}`).toBe(
          Number(row.expected_final_amount),
        );
      }
      if (row.expected_error_contains) {
        // A1 — thông điệp lỗi hiển thị cho người dùng
        expect(body.error, 'A1').toContain(row.expected_error_contains);
      }
    });
  }

  test('FR08-TC19 web app serves the checkout route only to authenticated sessions @fr08', async ({
    page,
    request,
  }) => {
    // Test bảo vệ: mở thẳng /checkout khi chưa đăng nhập, giỏ rỗng.
    // Đây là lỗ hổng UX đáng ghi nhận: trang vẫn render và vẫn bấm được nút xác nhận.
    await page.goto(`${WEB_BASE_URL}/checkout`);
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectLoaded();

    // A4 — tổng tiền hiển thị 0 vì giỏ rỗng
    expect(await checkoutPage.readTotal(), 'A4').toBe(0);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/checkout')),
      checkoutPage.confirmButton.click(),
    ]);
    // A3 — chỉ backend chặn (401), FE hoàn toàn không bảo vệ route
    expect(response.status(), 'A3: backend là lớp chặn duy nhất').toBe(401);

    const probe = await checkout(request, { total_amount: 0 }, undefined);
    expect(probe.status, 'A3').toBe(401);
  });
});
