// Shared constants of the Playwright suite (also read by playwright.config.ts)
export const E2E_PORT = 3100;
export const E2E_ADMIN = { email: 'e2e-admin@example.com', password: 'e2e-admin-password-1234' };
// Session of the admin, saved once by auth.setup.ts and reused by the admin specs.
// Logging in from every test would hit the login rate limit (5 attempts per 15 minutes).
export const ADMIN_STATE = 'e2e/.auth/admin.json';
