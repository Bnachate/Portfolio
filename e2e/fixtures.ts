import { expect, type Page } from '@playwright/test';

/**
 * Answers "Oui" to an in-place deletion question ("Supprimer « X » ? Oui / Non") and waits until
 * the question disappears, i.e. until the server confirmed the deletion. Asserting "row is gone"
 * right after the click could otherwise pass or fail depending on the DELETE request timing.
 */
export async function confirmDeletion(page: Page, question: string | RegExp) {
  const confirm = page.getByRole('group', { name: question });
  await confirm.getByRole('button', { name: 'Oui', exact: true }).click();
  await expect(confirm).toBeHidden();
}

// Shared constants of the Playwright suite (also read by playwright.config.ts)
export const E2E_PORT = 3100;
export const E2E_ADMIN = { email: 'e2e-admin@example.com', password: 'e2e-admin-password-1234' };
// Session of the admin, saved once by auth.setup.ts and reused by the admin specs.
// Logging in from every test would hit the login rate limit (5 attempts per 15 minutes).
export const ADMIN_STATE = 'e2e/.auth/admin.json';
