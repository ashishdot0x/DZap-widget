import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 15000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/html' }], ['json', { outputFile: 'reports/results.json' }]],
  use: { baseURL: process.env.WIDGET_URL ?? 'https://dzapwidget.vercel.app/', actionTimeout: 15000, screenshot: 'only-on-failure', trace: 'retain-on-failure', video: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
