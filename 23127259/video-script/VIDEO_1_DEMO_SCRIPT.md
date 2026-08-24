# Video 1 - Multi-Browser Automation Demo

**Target duration:** 6-8 minutes  
**Narration:** Vietnamese, by Nguyễn Tấn Thắng (23127259)  
**Authorship evidence:** face-cam or terminal output from both `whoami` and `hostname`

## 0:00-0:45 - Identity and scope

Show face-cam or run:

```bash
whoami
hostname
```

Say your full name, student ID, and selected features FR-02, FR-07, FR-16. Show the assignment folder and README self-assessment.

## 0:45-1:45 - Architecture and DDT

Open `tests/pages/` and explain the three Page Objects. Open the credential/product CSV and the three JSON files. Point out that the specs iterate the CSV rows and reference JSON API payloads rather than defining inline test arrays.

## 1:45-2:45 - Human fix to AI output

Open `CartPage.openFromHeader()` and explain:

> "AI initially used `page.goto('/cart')` after adding a product. Because the cart lives in React Context, the full reload destroyed the state and created false failures. I replaced that operation with a click on the React Router header link so the application state is preserved."

Also show the import panel-scoped locator and mention that the old selector matched more than one table.

## 2:45-4:30 - Execute multi-browser suite

Run one complete feature live:

```bash
npm run test:multibrowser:fr07
```

Explain that the runner continues through known `@bug` failures but fails the command for infrastructure/non-bug failures. Show the summary with Chromium, Firefox, WebKit and `unexpectedFailures: 0`.

## 4:30-6:00 - HTML report and defect evidence

Open one report:

```bash
npx playwright show-report playwright-report/fr07-cart-chromium
```

Show `Run by: 23127259`, the ISO timestamp, a green case, and TC12 or TC13 in red. Read the expected/actual assertion and open its screenshot or trace. Relate it to FR-07 in `eshop-sut/README.md` and the matching entry in `BUG_REPORT.md`.

## 6:00-6:45 - Complete matrix and conclusion

Show the three summary JSON files and state the verified totals: 45 unique cases, 9 browser runs, 72 pass executions, 63 intentional bug failures, and zero unexpected failures. Do not say the video or GitHub Issues are complete until their URLs/evidence actually exist.
