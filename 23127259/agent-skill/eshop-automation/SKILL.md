---
name: eshop-automation
description: Build, repair, and audit SRS-driven Playwright suites for the EShop SUT when tests must use Page Objects, external CSV/JSON data, intentional @bug failures, and independent Chromium/Firefox/WebKit reports. Do not use for changing the SUT to make tests pass.
---

# EShop Automation

**Owner:** Nguyễn Tấn Thắng (23127259)

Create evidence that distinguishes SUT defects from automation defects.

## Workflow

1. Read the selected feature and all cross-cutting requirements in `eshop-sut/README.md`. Record a requirement-to-test mapping before editing tests.
2. Inspect the UI and API implementation only to understand routes, state lifetime, and stable selectors. Never copy the faulty implementation into expected values.
3. Put locators and navigation in `tests/pages/`. Preserve SPA state by clicking React Router links instead of using `page.goto()` after arranging in-memory state.
4. Put every credential, input, expected message, boundary, and API payload in `tests/data/*.csv` or `*.json`. Merely importing an unused data file does not count as DDT.
5. Generate at least 12 independently named cases per feature. Use at least three assertion families, such as web-first UI assertions, navigation/DOM properties, API status/body, and server-side state.
6. Tag a case with Playwright `{ tag: '@bug' }` and include `@bug` in its title only when its assertion expresses the SRS and the observed failure is caused by the SUT. Ordinary cases must pass.
7. Run non-bug cases first with `--grep-invert @bug`. Fix every harness failure before generating final reports.
8. Run `node scripts/run-multibrowser.mjs <spec>` and require three report directories, student metadata with an ISO timestamp, zero `unexpectedFailures`, and consistent results across engines.
9. Update the main report and bug report from JSON results rather than from hand-maintained claims. Attach the generated screenshot/trace to each GitHub issue.

For this repository's feature-specific invariants and completion checks, read [references/eshop-checklist.md](references/eshop-checklist.md).

## Stop Conditions

- Do not weaken an SRS assertion to make a test green.
- Do not classify browser launch errors, timeouts from wrong selectors, or lost React state as SUT bugs.
- Do not claim a video, GitHub issue, pull request, or browser run that was not actually produced.
- Do not edit seeded defects in `eshop-sut/` unless the user explicitly requests a product fix rather than a testing deliverable.
