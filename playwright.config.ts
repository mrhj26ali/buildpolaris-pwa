import { defineConfig, devices } from '@playwright/test'

// This replaces the previous BFF-oriented, browser-less config. The PWA's own
// E2E suite needs a real browser context because several scenarios depend on
// context.setOffline() (offline field capture, UC-6.5's sync flow) and on
// service-worker/IndexedDB behavior that an APIRequestContext cannot exercise.
// webServer boots the actual Vite dev server so tests run against the real app;
// network calls to the BFF are intercepted via page.route() in each spec
// (mocks/bffRoutes.ts) rather than requiring a live buildpolaris_bff instance.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
