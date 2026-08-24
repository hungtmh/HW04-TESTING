# HW04 Main Report - AI Automation Testing

## 1. Student and Scope

- **Student:** Nguyễn Tấn Thắng - 23127259
- **Selected features:** FR-02 Login and Account Lockout, FR-07 Shopping Cart, FR-16 Product Import from CSV
- **Tooling:** Playwright, Node.js, Playwright HTML/JSON reporter
- **Browsers:** Chromium, Firefox, WebKit
- **SUT services:** Backend `:3000`, Web `:5173`, Admin `:5174`

The three features are the required one-per-pool selection from Pools A, B, and C. The final suite contains 45 unique cases: FR-02 has 16, FR-07 has 17, and FR-16 has 12.

## 2. Requirements Traceability

| Feature | Primary SRS coverage | Test evidence |
|---|---|---|
| FR-02 | Valid/invalid login, HTML5 email, increment by one, threshold three, 30-second lock, reset, secure password handling, FR-21/22 form rules | `tests/fr02-login.spec.js` TC01-TC16 |
| FR-07 | Empty state, navigation, product/quantity/subtotal/total, removal, checkout, duplicate add, confirmation, +/- controls | `tests/fr07-cart.spec.js` TC01-TC17 |
| FR-16 | Valid import, preview, template, extension, row validation, admin authorization, rollback, positive price, RFC 4180 | `tests/fr16-import-csv.spec.js` TC01-TC12 |

## 3. Automation Architecture

### Page Object Model

`LoginPage`, `CartPage`, and `AdminImportPage` own locators and user flows. A significant correction was made to `CartPage`: after arranging products, the suite clicks the React Router cart link instead of calling `page.goto('/cart')`. A full reload destroys the in-memory `CartContext` and previously produced false failures.

The admin POM was also corrected to use the actual login placeholders and `Login` button, then open the Products tab before locating the import panel. All import locators are scoped to that panel so the preview table is not confused with the product table.

### Data-Driven Testing

Credentials, product rows, messages, boundaries, API payloads, and expected labels live in `tests/data/*.csv` or `*.json`. The specs iterate CSV rows and reference JSON payloads; no test-only fixture is imported without use. FR-16 uploads three physical CSV fixtures, including an RFC 4180 quoted-comma case.

### Assertion Patterns

The suite uses more than three patterns: URL/navigation, visibility/text, count, HTML attribute and validity, API status/body, exact money calculation, modal event, and backend state through the admin API.

## 4. Human Review and Corrections to AI Output

The initial AI-generated suite contained several false-positive/false-negative risks:

1. **Unused DDT:** CSV files were loaded but their rows did not drive tests. The final suite loops through external rows and moves inline API payloads to JSON.
2. **Lost cart state:** `page.goto('/cart')` reset React state. It was replaced by SPA navigation through the header.
3. **Broken admin selectors:** The AI assumed `type="email"` and Vietnamese button text on the admin login. Selectors now match stable placeholders and the actual route flow.
4. **Unscoped table selector:** `table.bg-white tbody tr` matched both preview and product tables. The locator is now scoped to the CSV import card.
5. **Weak assertion:** Checking only for `₫` did not verify totals. The final suite parses and compares exact amounts from CSV.
6. **Missed lockout bug:** The old test never asserted the second/third response, so early lockout passed. The final test asserts the full status sequence and reads counter/lock time through the admin API.
7. **Environment failures mislabeled as bugs:** Firefox/WebKit executables were installed and the suite rerun. Browser-launch failures are no longer present.

## 5. Multi-Browser Results

Each feature ran independently on Chromium, Firefox, and WebKit. Every report contains `Run by: 23127259` and an ISO timestamp; nine screenshots in `evidence/report-screenshots/` verify visible attribution.

| Feature | Chromium | Firefox | WebKit | Unexpected failures |
|---|---|---|---|---:|
| FR-02 | 6 Pass / 10 `@bug` Fail | 6 / 10 | 6 / 10 | 0 |
| FR-07 | 11 Pass / 6 `@bug` Fail | 11 / 6 | 11 / 6 | 0 |
| FR-16 | 7 Pass / 5 `@bug` Fail | 7 / 5 | 7 / 5 | 0 |

The matrix totals 135 executions: 72 passed and 63 intentional failures corresponding to 21 failing cases across three browsers. Results are consistent across engines.

## 6. Defect Findings

Twenty unique SUT defects were confirmed. Examples include early/overlong account lockout, plaintext password exposure, duplicate cart rows, missing removal confirmation, non-atomic CSV import, non-admin import access, and incorrect RFC 4180 parsing. Details, exact expected/actual results, severity, test mapping, and evidence paths are in `bug-report/BUG_REPORT.md`.

## 7. Reproducibility

```bash
npm run test:multibrowser:all
node scripts/verify-report-banner.mjs
```

`scripts/run-multibrowser.mjs` classifies red `@bug` cases separately from unexpected failures and returns non-zero only for infrastructure or non-bug failures. This prevents known product defects from stopping the matrix while still detecting a broken suite.

## 8. Remaining Manual Work

No test case remains unautomated. The remaining submission work requires student identity and external actions: record/upload the two videos, create GitHub Issues with the generated screenshots, and open/merge a real Pull Request. These actions are deliberately not claimed as completed in this report.
