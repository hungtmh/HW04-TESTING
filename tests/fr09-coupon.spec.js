const { test, expect } = require('@playwright/test');
const { CheckoutPage } = require('./pages/CheckoutPage');
const { readCsv, readJson } = require('./utils/csv');
const { stampRun } = require('./utils/env');
const {
  createCustomer,
  applyCoupon,
  recordCouponUsage,
} = require('./utils/api');

/**
 * ============================================================================
 * HW04 - Automation Testing | FR-09: Mã giảm giá (Discount coupons)
 * Student: 23127195
 * ============================================================================
 *
 * DATA-DRIVEN: values come from tests/data/fr09-coupon-calculations.csv and
 * tests/data/fr09-coupon-cases.json. No inline test-data literals here.
 *
 * ASSERTION PATTERNS (>= 3 required; six used, tagged [P1]..[P6]):
 *   [P1] Navigation assertion    - expect(page).toHaveURL / heading visible
 *   [P2] Web-first element/text  - toBeVisible() / toContainText()
 *   [P3] Numeric value assertion - parsed money compared with toBe/toBeCloseTo
 *   [P4] Back-end API assertion  - status + body shape via toMatchObject()
 *   [P5] Element-state assertion - toBeDisabled() / toHaveCount()
 *   [P6] Invariant assertion     - properties that must hold for EVERY coupon
 *
 * Tests tagged @bug assert the SPECIFIED behaviour and currently fail; each
 * maps to a defect in 23127195/bug-report/BUG_REPORT.md.
 */

const calcCases = readCsv('fr09-coupon-calculations.csv');
const data = readJson('fr09-coupon-cases.json');

// TC-01..TC-03 exercise the percent formula, which is broken (BUG-07).
// TC-07 sits exactly on the minimum-order threshold, which is exclusive (BUG-08).
const BUGGY_CALC_CASES = new Set(['TC-01', 'TC-02', 'TC-03', 'TC-07']);

test.describe('FR-09 | Mã giảm giá', () => {
  let customer;
  let checkout;

  test.beforeEach(async ({ page, request }, testInfo) => {
    stampRun(testInfo, 'FR-09 Mã giảm giá');
    customer = await createCustomer(request, data.testUser);
    checkout = new CheckoutPage(page);
  });

  // ==========================================================================
  // GROUP 1 - Calculation matrix, driven through the checkout UI (CSV)
  // ==========================================================================
  test.describe('Nhóm 1 - Ma trận tính toán giảm giá (CSV)', () => {
    for (const row of calcCases) {
      const isBug = BUGGY_CALC_CASES.has(row.tc_id);
      const title = `${row.tc_id} - ${row.label}${isBug ? ' @bug' : ''}`;

      test(title, async ({ page }) => {
        test.info().annotations.push(
          { type: 'test-case', description: row.tc_id },
          { type: 'coupon', description: `${row.code} (${row.coupon_type})` },
          { type: 'note', description: row.note },
        );
        if (isBug) {
          test.info().annotations.push({
            type: 'bug',
            description: row.tc_id === 'TC-07'
              ? 'BUG-08 - ngưỡng đơn tối thiểu loại trừ giá trị bằng'
              : 'BUG-07 - công thức giảm giá phần trăm sai',
          });
        }

        await checkout.gotoAuthenticated(customer.token);
        await checkout.setTotal(row.total_amount);
        await checkout.applyCoupon(row.code);

        if (row.outcome === 'accepted') {
          // [P2] the success block must appear
          await expect(
            checkout.couponSuccess,
            `${row.code} on ${row.total_amount} must be accepted`,
          ).toBeVisible();

          // [P3] numeric assertions on the money actually rendered
          expect(
            await checkout.readAmount('discount'),
            `discount shown for ${row.code} on ${row.total_amount}`,
          ).toBe(Number(row.expected_discount));
          expect(
            await checkout.readAmount('final'),
            `payable shown for ${row.code} on ${row.total_amount}`,
          ).toBe(Number(row.expected_final));
        } else {
          // [P2] rejection must be explained to the customer
          await expect(checkout.couponError).toBeVisible();
          // [P5] and no success block may be rendered
          await expect(checkout.couponSuccess).toHaveCount(0);
        }
      });
    }
  });

  // ==========================================================================
  // GROUP 2 - Invalid / unusable codes (JSON) : TC-11 .. TC-13
  // ==========================================================================
  test.describe('Nhóm 2 - Mã không hợp lệ', () => {
    for (const c of data.invalidCodes) {
      test(`${c.tc_id} - ${c.label}`, async ({ page }) => {
        test.info().annotations.push({ type: 'test-case', description: c.tc_id });

        await checkout.gotoAuthenticated(customer.token);
        await checkout.setTotal(c.totalAmount);

        if (c.expectButtonDisabled) {
          // A blank or whitespace-only code must not be submittable at all.
          await checkout.couponInput.fill(c.code);
          // [P5] element-state assertion
          await expect(checkout.applyButton).toBeDisabled();
          return;
        }

        await checkout.applyCoupon(c.code);
        // [P2] the specific reason must be shown, not a generic failure
        await expect(checkout.couponError).toBeVisible();
        await expect(checkout.couponError).toContainText(c.expectedErrorFragment);
      });
    }
  });

  // ==========================================================================
  // GROUP 2b - Ràng buộc đầu vào ở tầng API : TC-19
  // ==========================================================================
  // Nhóm 2 chứng minh nút bị disable trên UI khi mã rỗng. Test này đi thẳng
  // xuống API để chắc chắn máy chủ cũng tự bảo vệ: đặc tả 5.1 khai báo `code`
  // là bắt buộc, nên một request thiếu hẳn trường này phải bị từ chối 400.
  test(`${data.apiValidation.tc_id} - ${data.apiValidation.label}`, async ({ request }) => {
    const c = data.apiValidation;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    const { status, body } = await applyCoupon(request, {
      total_amount: c.totalAmount,
      user_id: customer.id,
    });

    // [P4] Back-end API assertion: đúng status và đúng lý do lỗi.
    expect(status).toBe(400);
    expect(body?.error ?? '').toContain(c.expectedErrorFragment);
  });

  // ==========================================================================
  // GROUP 3 - Code normalisation : TC-14
  // ==========================================================================
  test(`${data.caseInsensitive.tc_id} - ${data.caseInsensitive.label}`, async ({ page }) => {
    const c = data.caseInsensitive;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    await checkout.gotoAuthenticated(customer.token);
    await checkout.setTotal(c.totalAmount);
    await checkout.applyCoupon(c.typed);

    // [P2] the UI upper-cases the input before sending, so a lowercase entry works
    await expect(checkout.couponSuccess).toBeVisible();
    // [P3]
    expect(await checkout.readAmount('discount')).toBe(c.expectedDiscount);
  });

  // ==========================================================================
  // GROUP 4 - Per-user usage limit : TC-15
  // ==========================================================================
  test(`${data.usageLimit.tc_id} - ${data.usageLimit.label}`, async ({ page, request }) => {
    const c = data.usageLimit;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    const coupon = data.seededCoupons.fixed100k;

    // Consume the whole allowance through the API.
    const first = await applyCoupon(request, {
      code: c.code, total_amount: c.totalAmount, user_id: customer.id,
    });
    expect(first.status, 'the first use must be allowed').toBe(200);
    for (let i = 0; i < c.maxUses; i++) {
      const rec = await recordCouponUsage(request, customer.token, first.body.coupon_id);
      expect(rec.ok()).toBeTruthy();
    }

    await checkout.gotoAuthenticated(customer.token);
    await checkout.setTotal(c.totalAmount);
    await checkout.applyCoupon(c.code);

    // [P2] once the allowance is spent the UI must refuse the code
    await expect(checkout.couponError).toBeVisible();
    await expect(checkout.couponError).toContainText(c.expectedErrorFragment);
    expect(coupon.maxUsesPerUser).toBe(c.maxUses);
  });

  // ==========================================================================
  // GROUP 5 - Usage limit bypass : TC-16  [@bug]
  // ==========================================================================
  test(`${data.usageLimitBypass.tc_id} - ${data.usageLimitBypass.label} @bug`, async ({ request }) => {
    const c = data.usageLimitBypass;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-09 - bỏ user_id là lách được giới hạn số lần dùng' },
    );

    const seeded = await applyCoupon(request, {
      code: c.code, total_amount: c.totalAmount, user_id: customer.id,
    });
    expect(seeded.status).toBe(200);
    for (let i = 0; i < c.maxUses; i++) {
      expect((await recordCouponUsage(request, customer.token, seeded.body.coupon_id)).ok()).toBeTruthy();
    }

    // Sanity check: with the identity attached, the limit is enforced. [P4]
    const withId = await applyCoupon(request, {
      code: c.code, total_amount: c.totalAmount, user_id: customer.id,
    });
    expect(withId.status, 'limit must be enforced when the user is identified').toBe(400);

    // Same customer, same spent allowance, but the field is simply omitted.
    // Specified behaviour: the limit still applies. The SUT skips the check
    // entirely whenever user_id is falsy -> BUG-09. [P4]
    const withoutId = await applyCoupon(request, { code: c.code, total_amount: c.totalAmount });
    expect(
      withoutId.status,
      'omitting user_id must not bypass the per-user usage limit',
    ).toBe(400);
  });

  // ==========================================================================
  // GROUP 6 - Full customer journey : TC-17
  // ==========================================================================
  test(`${data.endToEnd.tc_id} - ${data.endToEnd.label}`, async ({ page }) => {
    const c = data.endToEnd;
    test.info().annotations.push({ type: 'test-case', description: c.tc_id });

    await checkout.journeyToCheckout(customer.token);
    await checkout.setTotal(c.totalAmount);
    await checkout.applyCoupon(c.code);

    // [P2] + [P3] the discount is applied and the payable total updates
    await expect(checkout.couponSuccess).toBeVisible();
    expect(await checkout.readAmount('final')).toBe(c.expectedFinal);
    await expect(checkout.payableLine).toContainText(c.expectedFinal.toLocaleString('en-US').replace(/,/g, ','));

    await checkout.payButton.click();
    // [P1] a confirmed order replaces the form with the success screen
    await expect(checkout.paidHeading).toBeVisible();
  });

  // ==========================================================================
  // GROUP 7 - Invariants that must hold for every coupon : TC-18  [@bug]
  // ==========================================================================
  test(`${data.invariants.tc_id} - ${data.invariants.label} @bug`, async ({ request }) => {
    const c = data.invariants;
    test.info().annotations.push(
      { type: 'test-case', description: c.tc_id },
      { type: 'bug', description: 'BUG-07 - giảm giá âm và thành tiền lớn hơn tổng gốc' },
    );

    const violations = [];
    for (const code of c.codes) {
      const res = await applyCoupon(request, {
        code, total_amount: c.totalAmount, user_id: customer.id,
      });
      if (res.status !== 200) continue;

      const { discount_amount, final_amount } = res.body;
      if (discount_amount < 0) violations.push(`${code}: discount ${discount_amount} < 0`);
      if (final_amount > c.totalAmount) {
        violations.push(`${code}: final ${final_amount} > total ${c.totalAmount}`);
      }
    }

    // [P6] No discount may ever be negative, and no discounted total may ever
    // exceed the original amount. Both hold for the fixed coupons and both
    // break for the percent coupon.
    expect(violations, `coupon invariants violated: ${violations.join('; ')}`).toEqual([]);
  });
});
