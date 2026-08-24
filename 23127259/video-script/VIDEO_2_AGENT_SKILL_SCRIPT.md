# Video 2 - Agent Skill Demonstration

**Target duration:** 5-7 minutes  
**Skill:** `23127259/agent-skill/eshop-automation`

## 0:00-0:45 - Identity and skill purpose

Show face-cam or `whoami` and `hostname`. Introduce the reusable skill: it creates or repairs SRS-driven Playwright suites with POM, external DDT, intentional `@bug` cases, and independent browser reports.

## 0:45-1:30 - Validate the skill

Show `SKILL.md`, its trigger description, workflow, and stop conditions. Run:

```bash
python3 /Users/thangnhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  23127259/agent-skill/eshop-automation
```

Show the `Skill is valid!` output.

## 1:30-3:30 - Invoke on a complete feature

In the AI tool, invoke the skill with a scoped request such as:

> Use the EShop Automation skill to audit FR-16. Verify that the spec is truly data-driven, that all non-@bug tests pass on Chromium, and that each red case maps to FR-16 or SEC-03. Do not edit the SUT.

Show the agent reading SRS, fixtures, Page Object and spec. Explain the skill's key guardrail: browser errors, wrong selectors, and lost SPA state must never be reported as product bugs.

## 3:30-4:45 - Demonstrate the gate

Run:

```bash
npx playwright test tests/fr16-import-csv.spec.js \
  --project=chromium --grep-invert @bug
```

Show that seven normal FR-16 cases pass. Then open one `@bug` test and explain why keeping the assertion red is correct.

## 4:45-5:45 - Evidence and reuse

Show the multi-browser summary and metadata screenshot. Explain how the same skill can be reused for another EShop feature by changing the SRS mapping, POM and external dataset while retaining the evidence gate.

## 5:45-6:15 - Conclusion

State what AI generated, what you reviewed, and which corrections you made. Add the final unlisted YouTube URL to README only after upload succeeds.
