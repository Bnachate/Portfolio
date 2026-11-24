import { expect, type Page } from '@playwright/test';

/**
 * Confirms a deletion dialog and waits until it closes, i.e. until the server confirmed the deletion.
 * While a modal is open, Radix hides the rest of the page from assistive technologies (aria-hidden),
 * so role-based locators see no table rows at all: asserting "row is gone" right after the click
 * would pass immediately, before the DELETE request completed.
 */
export async function confirmDeletion(page: Page) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(dialog).toBeHidden();
}

// Shared constants of the Playwright suite (also read by playwright.config.ts)
export const E2E_PORT = 3100;
export const E2E_ADMIN = { email: 'e2e-admin@example.com', password: 'e2e-admin-password-1234' };
// Session of the admin, saved once by auth.setup.ts and reused by the admin specs.
// Logging in from every test would hit the login rate limit (5 attempts per 15 minutes).
export const ADMIN_STATE = 'e2e/.auth/admin.json';
