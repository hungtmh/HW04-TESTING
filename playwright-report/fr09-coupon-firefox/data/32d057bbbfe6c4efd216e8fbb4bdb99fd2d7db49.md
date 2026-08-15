# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr09-coupon.spec.js >> FR-09 | Mã giảm giá >> TC-18 - Bat bien: giam gia khong am va thanh tien khong vuot tong goc @bug
- Location: tests\fr09-coupon.spec.js:231:3

# Error details

```
Error: coupon invariants violated: SAVE10: discount -7200000 < 0; SAVE10: final 8000000 > total 800000

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "SAVE10: discount -7200000 < 0",
+   "SAVE10: final 8000000 > total 800000",
+ ]
```

# Test source

```ts
  155 |       code: c.code, total_amount: c.totalAmount, user_id: customer.id,
  156 |     });
  157 |     expect(first.status, 'the first use must be allowed').toBe(200);
  158 |     for (let i = 0; i < c.maxUses; i++) {
  159 |       const rec = await recordCouponUsage(request, customer.token, first.body.coupon_id);
  160 |       expect(rec.ok()).toBeTruthy();
  161 |     }
  162 | 
  163 |     await checkout.gotoAuthenticated(customer.token);
  164 |     await checkout.setTotal(c.totalAmount);
  165 |     await checkout.applyCoupon(c.code);
  166 | 
  167 |     // [P2] once the allowance is spent the UI must refuse the code
  168 |     await expect(checkout.couponError).toBeVisible();
  169 |     await expect(checkout.couponError).toContainText(c.expectedErrorFragment);
  170 |     expect(coupon.maxUsesPerUser).toBe(c.maxUses);
  171 |   });
  172 | 
  173 |   // ==========================================================================
  174 |   // GROUP 5 - Usage limit bypass : TC-16  [@bug]
  175 |   // ==========================================================================
  176 |   test(`${data.usageLimitBypass.tc_id} - ${data.usageLimitBypass.label} @bug`, async ({ request }) => {
  177 |     const c = data.usageLimitBypass;
  178 |     test.info().annotations.push(
  179 |       { type: 'test-case', description: c.tc_id },
  180 |       { type: 'bug', description: 'BUG-09 - bỏ user_id là lách được giới hạn số lần dùng' },
  181 |     );
  182 | 
  183 |     const seeded = await applyCoupon(request, {
  184 |       code: c.code, total_amount: c.totalAmount, user_id: customer.id,
  185 |     });
  186 |     expect(seeded.status).toBe(200);
  187 |     for (let i = 0; i < c.maxUses; i++) {
  188 |       expect((await recordCouponUsage(request, customer.token, seeded.body.coupon_id)).ok()).toBeTruthy();
  189 |     }
  190 | 
  191 |     // Sanity check: with the identity attached, the limit is enforced. [P4]
  192 |     const withId = await applyCoupon(request, {
  193 |       code: c.code, total_amount: c.totalAmount, user_id: customer.id,
  194 |     });
  195 |     expect(withId.status, 'limit must be enforced when the user is identified').toBe(400);
  196 | 
  197 |     // Same customer, same spent allowance, but the field is simply omitted.
  198 |     // Specified behaviour: the limit still applies. The SUT skips the check
  199 |     // entirely whenever user_id is falsy -> BUG-09. [P4]
  200 |     const withoutId = await applyCoupon(request, { code: c.code, total_amount: c.totalAmount });
  201 |     expect(
  202 |       withoutId.status,
  203 |       'omitting user_id must not bypass the per-user usage limit',
  204 |     ).toBe(400);
  205 |   });
  206 | 
  207 |   // ==========================================================================
  208 |   // GROUP 6 - Full customer journey : TC-17
  209 |   // ==========================================================================
  210 |   test(`${data.endToEnd.tc_id} - ${data.endToEnd.label}`, async ({ page }) => {
  211 |     const c = data.endToEnd;
  212 |     test.info().annotations.push({ type: 'test-case', description: c.tc_id });
  213 | 
  214 |     await checkout.journeyToCheckout(customer.token);
  215 |     await checkout.setTotal(c.totalAmount);
  216 |     await checkout.applyCoupon(c.code);
  217 | 
  218 |     // [P2] + [P3] the discount is applied and the payable total updates
  219 |     await expect(checkout.couponSuccess).toBeVisible();
  220 |     expect(await checkout.readAmount('final')).toBe(c.expectedFinal);
  221 |     await expect(checkout.payableLine).toContainText(c.expectedFinal.toLocaleString('en-US').replace(/,/g, ','));
  222 | 
  223 |     await checkout.payButton.click();
  224 |     // [P1] a confirmed order replaces the form with the success screen
  225 |     await expect(checkout.paidHeading).toBeVisible();
  226 |   });
  227 | 
  228 |   // ==========================================================================
  229 |   // GROUP 7 - Invariants that must hold for every coupon : TC-18  [@bug]
  230 |   // ==========================================================================
  231 |   test(`${data.invariants.tc_id} - ${data.invariants.label} @bug`, async ({ request }) => {
  232 |     const c = data.invariants;
  233 |     test.info().annotations.push(
  234 |       { type: 'test-case', description: c.tc_id },
  235 |       { type: 'bug', description: 'BUG-07 - giảm giá âm và thành tiền lớn hơn tổng gốc' },
  236 |     );
  237 | 
  238 |     const violations = [];
  239 |     for (const code of c.codes) {
  240 |       const res = await applyCoupon(request, {
  241 |         code, total_amount: c.totalAmount, user_id: customer.id,
  242 |       });
  243 |       if (res.status !== 200) continue;
  244 | 
  245 |       const { discount_amount, final_amount } = res.body;
  246 |       if (discount_amount < 0) violations.push(`${code}: discount ${discount_amount} < 0`);
  247 |       if (final_amount > c.totalAmount) {
  248 |         violations.push(`${code}: final ${final_amount} > total ${c.totalAmount}`);
  249 |       }
  250 |     }
  251 | 
  252 |     // [P6] No discount may ever be negative, and no discounted total may ever
  253 |     // exceed the original amount. Both hold for the fixed coupons and both
  254 |     // break for the percent coupon.
> 255 |     expect(violations, `coupon invariants violated: ${violations.join('; ')}`).toEqual([]);
      |                                                                                ^ Error: coupon invariants violated: SAVE10: discount -7200000 < 0; SAVE10: final 8000000 > total 800000
  256 |   });
  257 | });
  258 | 
```