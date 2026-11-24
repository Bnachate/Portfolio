import { defineConfig, devices } from '@playwright/test';
import { E2E_ADMIN, E2E_PORT } from './e2e/fixtures';

const baseURL = `http://localhost:${E2E_PORT}`;

/**
 * End-to-end tests against the production build, on port 3100 (never 3000, the dev server)
 * with a throwaway database in ./.pglite-e2e recreated on each run.
 */
export default defineConfig({
  testDir: 'e2e',
  // One shared database: run the specs one after the other
  fullyParallel: false,
  workers: 1,
  // One retry on CI only: GitHub runners are slower, and a test passing on retry is reported as
  // "flaky" instead of failing the build. Locally, failures show up immediately. A retry replays at
  // most one login and one contact message, which stays under the rate limits (5 per window).
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],
  webServer: {
    command: `npm run e2e:prepare && npm run build && npx next start -p ${E2E_PORT}`,
    url: baseURL,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    env: {
      PGLITE_DATA_DIR: './.pglite-e2e',
      SESSION_SECRET: 'e2e-session-secret-that-is-long-enough-1234',
      E2E_ADMIN_EMAIL: E2E_ADMIN.email,
      E2E_ADMIN_PASSWORD: E2E_ADMIN.password,
      RESEND_API_KEY: '',
      DATABASE_URL: '',
    },
  },
});
