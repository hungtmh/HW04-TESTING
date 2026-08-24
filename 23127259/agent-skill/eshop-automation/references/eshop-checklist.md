# EShop Automation Checklist

**Sinh viên:** Nguyễn Tấn Thắng - **MSSV:** 23127259

## FR-02 - Login and Account Lockout

- Email uses HTML5 `type="email"`; password uses `type="password"`.
- Each failed login increments the counter by one.
- The account locks only after the third consecutive failure and remains locked for 30 seconds.
- Successful login resets lock state and returns a JWT without exposing a stored password.
- Error placement and Vietnamese UI follow FR-21/FR-22.

## FR-07 - Shopping Cart

- Preserve `CartContext` state by using in-app navigation after adding products.
- Assert exact product, quantity, subtotal, total, duplicate-add behavior, confirmation dialog, +/- controls, empty illustration, and continue-shopping label.
- Assert exact money values; checking only for a currency symbol is too weak.

## FR-16 - Product Import CSV

- Navigate to the Products tab after admin login before locating import controls.
- Scope preview rows and result messages to the import panel, not every table on the admin page.
- Cover valid import, preview, template, file filter, missing name, positive price, atomic rollback, role authorization, missing token, empty input, and RFC 4180 quoted commas.
- Keep API arrays and expected CSV fields in JSON/CSV fixtures.

## Evidence Gate

- `npx playwright test <spec> --project=chromium --grep-invert @bug` has no failures.
- Each browser summary has `unexpectedFailures: 0`.
- HTML metadata contains `Run by: 23127259` and an ISO timestamp.
- Report counts equal parsed JSON results and BUG_REPORT entries map to concrete `@bug` tests.
