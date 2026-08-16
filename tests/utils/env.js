// Shared constants for the HW04 suite. Kept out of playwright.config.js so the
// config object only ever contains keys Playwright understands.
const STUDENT_ID = '23127195';
const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Every registration test must use an address no earlier test has consumed,
 * otherwise the duplicate-email test cannot tell its own duplicate apart from
 * leftovers of a previous run against the same SQLite file.
 */
function uniqueEmail(prefix = 'auto') {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${stamp}.${rand}@eshop-test.local`;
}

/**
 * Stamps run provenance onto a single test's report entry. The HTML report
 * header already carries "Run by: 23127195"; adding it per test makes every
 * individual result traceable to this student and feature inside the exported
 * report, which is what the assignment's anti-cheat rule actually inspects.
 */
function stampRun(testInfo, feature) {
  testInfo.annotations.push({ type: 'run-by', description: STUDENT_ID });
  if (feature) testInfo.annotations.push({ type: 'feature', description: feature });
}

module.exports = { STUDENT_ID, WEB_BASE_URL, API_BASE_URL, uniqueEmail, stampRun };
