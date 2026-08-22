// Playwright config RIÊNG của 23127060 — Ninh Văn Khải
// KHÔNG dùng chung với playwright.config.js ở root (đó là của thành viên khác).
import { defineConfig, devices } from '@playwright/test';

/** Thời điểm chạy thật — dùng cho banner chống AI-cheat (§11 đề bài). */
const RUN_AT = new Date().toISOString();

/** Mỗi run multi-browser ghi vào 1 thư mục report riêng (scripts/run-multibrowser.mjs set biến này). */
const REPORT_DIR = process.env.PW_REPORT_DIR || 'playwright-report/local';

export default defineConfig({
  testDir: './tests',
  // Test phải độc lập nhau -> chạy song song được. SUT là SQLite đơn tiến trình nên giới hạn worker.
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  forbidOnly: !!process.env.CI,
  retries: 0, // để lộ flaky thật, không che bằng retry
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: REPORT_DIR,
        title: `Run by: 23127060 — ${RUN_AT}`,
      },
    ],
    ['json', { outputFile: `${REPORT_DIR}/results.json` }],
    // Đăng ký SAU html reporter: onEnd của nó chạy sau khi index.html đã được ghi xong,
    // nhờ đó đóng dấu được banner "Run by: 23127060" + ISO timestamp vào file.
    // (Option `title` của html reporter không còn tác dụng ở Playwright 1.62 — xem
    //  ghi chú đầu file scripts/banner-reporter.mjs.)
    ['./scripts/banner-reporter.mjs'],
  ],

  metadata: {
    'Run by': '23127060 – Ninh Văn Khải',
    'Run at (ISO)': RUN_AT,
    feature: process.env.PW_FEATURE || 'all',
  },

  outputDir: 'test-results',

  use: {
    baseURL: process.env.WEB_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
