import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000', // Frappe bench default
    trace: 'on-first-retry',
  },
  // NO projects with browsers. We use APIRequestContext for pure backend E2E.
  projects: [
    {
      name: 'api-e2e',
      use: { ...devices['Desktop Chrome'] }, // Device context for headers, but no browser launch
    },
  ],
});