# HW04 Bug Report - 20 Confirmed SUT Defects

**Reporter:** Nguyễn Tấn Thắng (23127259)  
**Environment:** EShop local SUT; Chromium, Firefox, WebKit; 2026-08-24  
**Evidence:** Playwright HTML reports under `playwright-report/` and visible report screenshots under `23127259/evidence/report-screenshots/`.

All cases below assert the documented SRS behavior and fail consistently on three engines. GitHub Issue links remain **Pending** until the student creates them and uploads the corresponding failure screenshot; this report does not claim external actions that have not occurred.

## Reproduction Pattern

1. Start the three SUT services through Playwright `webServer`.
2. Run `npm run test:multibrowser:all`.
3. Open the named feature/browser report and select the mapped `@bug` case.
4. Review the assertion, screenshot, error context, and trace.

## FR-02 - Login and Account Lockout

| ID / Test | SRS | Expected | Actual | Severity | GitHub Issue |
|---|---|---|---|---|---|
| BUG-LGN-01 / TC05 | FR-02 | Malformed email is rejected by HTML5 validation | Email input is `type=text`; `invalid-email` is valid to the browser | Major | Pending |
| BUG-LGN-02 / TC07 | FR-02 | One failed login increments counter by 1 | Counter changes from 0 to 2 | Critical | Pending |
| BUG-LGN-03 / TC08 | FR-02 | First three wrong submissions are processed before lock applies | Third request already returns 403 because account locked after two | Critical | Pending |
| BUG-LGN-04 / TC09 | FR-02 | Temporary lock lasts approximately 30 seconds | `locked_until` is approximately 180 seconds ahead | Major | Pending |
| BUG-LGN-05 / TC11 | FR-21 | Page has one H1 titled `Đăng Nhập` | No H1; H2 text is `Đăng Ký` | Major | Pending |
| BUG-LGN-06 / TC12 | FR-02/22 | Email input is `type=email` and label is `Email` | Input is `type=text`; label is `Username` | Major | Pending |
| BUG-LGN-07 / TC13 | FR-22 | Password input masks characters using `type=password` | Password input is `type=text` | Critical | Pending |
| BUG-LGN-08 / TC14 | FR-21 | Submit label is Vietnamese `Đăng nhập` | Button label is English `Sign In` | Minor | Pending |
| BUG-LGN-09 / TC15 | FR-22 | Login error appears above submit button | Error block is rendered after the form | Major | Pending |
| BUG-LGN-10 / TC16 | SEC-01 | Login response does not expose stored password | Response `user.password` contains the plaintext password | Critical | Pending |

Evidence directories: `playwright-report/fr02-login-{chromium,firefox,webkit}/`.

## FR-07 - Shopping Cart

| ID / Test | SRS | Expected | Actual | Severity | GitHub Issue |
|---|---|---|---|---|---|
| BUG-CART-01 / TC12 | FR-07 | Adding the same product increments quantity in one row | Two independent rows are created | Major | Pending |
| BUG-CART-02 / TC13 | FR-07/24 | Removal requires a confirmation dialog | Item is removed immediately; no dialog event fires | Major | Pending |
| BUG-CART-03 / TC14 | FR-07 | Total label is `Tổng cộng` | UI renders `Tổng tạm tính` | Minor | Pending |
| BUG-CART-04 / TC15 | FR-07 | Quantity cell contains plus and minus controls | Quantity is static text with zero buttons | Major | Pending |
| BUG-CART-05 / TC16 | FR-07/24 | Empty cart contains an icon or illustration | Empty state contains text and link only | Minor | Pending |
| BUG-CART-06 / TC17 | FR-07 | Non-empty cart link is `Tiếp tục mua sắm` | Link is `← Mua tiếp` | Minor | Pending |

Evidence directories: `playwright-report/fr07-cart-{chromium,firefox,webkit}/`.

## FR-16 - Product Import from CSV

| ID / Test | SRS | Expected | Actual | Severity | GitHub Issue |
|---|---|---|---|---|---|
| BUG-CSV-01 / TC06 | FR-12/SEC-03 | Customer token receives 403 from admin import API | Customer token imports products with status 200 | Critical | Pending |
| BUG-CSV-02 / TC09 | FR-16 | Any invalid row rolls back the whole batch | Valid row remains inserted when another row is invalid | Critical | Pending |
| BUG-CSV-03 / TC10 | FR-15/16 | Non-positive price returns validation error | Negative price imports successfully with status 200 | Critical | Pending |
| BUG-CSV-04 / TC11 | FR-16 | Quoted comma remains inside one RFC 4180 field | Frontend uses `split(',')`; first cell becomes `"Product` | Major | Pending |
| BUG-CSV-05 / TC12 | FR-16 | File input declares `accept=".csv"` | `accept` attribute is absent | Minor | Pending |

Evidence directories: `playwright-report/fr16-import-csv-{chromium,firefox,webkit}/`.

## Consistency Check

- Unique defects: 20.
- Failing `@bug` cases: 21, because TC05 and TC12 in FR-02 both evidence the same email-input root cause but verify different acceptance criteria.
- Browser-level bug failures: 63 = 21 cases x 3 browsers.
- Unexpected automation failures: 0.
