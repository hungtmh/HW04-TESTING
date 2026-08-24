---
name: eshop-automation-23127259
description: Audit and build data-driven, multi-browser Playwright automation for EShop features using SRS assertions, POM, CSV/JSON, @bug evidence, and report verification.
---

# EShop automation for 23127259

Use the submission skill at `23127259/agent-skill/SKILL.md` as the authoritative workflow. Preserve these gates:

1. Read SRS before implementation.
2. Probe real DOM/API/state instead of assuming selectors.
3. Externalize all test values to CSV/JSON.
4. Require every non-`@bug` test to pass on Chromium.
5. Run Chromium, Firefox, and WebKit with `unexpectedFailures: 0`.
6. Never weaken an assertion or call an automation failure a SUT bug.
7. Produce report metadata, evidence, bug report, and GitHub Issue mapping.
