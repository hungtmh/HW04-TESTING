// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * HW04 - Automation Testing | EShop SUT
 * Student: 23127195
 *
 * Anti-AI-cheat requirement: every HTML report must visibly show
 * "Run by: {StudentID}" together with an ISO timestamp. We inject both
 * through the reporter `title` and through `metadata`, which the Playwright
 * HTML reporter renders in the report header.
 */

const STUDENT_ID = '23127195';
const RUN_STARTED_AT = new Date().toISOString();

// Each browser run writes its own HTML report so that every one of the
// required runs has a standalone artefact. `scripts/run-multibrowser.mjs`
// sets PW_REPORT_DIR; a plain `npx playwright test` falls back to combined/.
const REPORT_DIR = process.env.PW_REPORT_DIR || 'playwright-report/combined';

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  testDir: './tests',
  // The SUT has no cross-test shared state we depend on, but registration
  // writes to a single SQLite file. Serial workers keep the DB assertions
  // deterministic; unique emails per test keep them independent.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  metadata: {
    'Run by': STUDENT_ID,
    'Student ID': STUDENT_ID,
    'Executed at (ISO)': RUN_STARTED_AT,
    'Homework': 'HW04 - Automation Testing',
    'SUT': 'EShop (eshop-sut) - frontend-web + backend API',
    'Features under test': 'FR-01 Account registration',
  },

  reporter: [
    ['list'],
    ['html', {
      open: 'never',
      outputFolder: REPORT_DIR,
      title: `HW04 EShop Automation - FR-01 | Run by: ${STUDENT_ID} | ${RUN_STARTED_AT}`,
    }],
    ['json', { outputFile: `${REPORT_DIR}/results.json` }],
  ],

  use: {
    baseURL: WEB_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    // Exposed to specs via testInfo.project.use for direct API assertions.
    extraHTTPHeaders: { 'Accept': 'application/json, text/html' },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Boot the SUT automatically so the suite is reproducible from a clean clone.
  webServer: [
    {
      command: 'node eshop-sut/backend/server.js',
      url: `${API_BASE_URL}/api/products`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm --prefix eshop-sut/frontend-web run dev',
      url: WEB_BASE_URL,
      reuseExistingServer: true,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
