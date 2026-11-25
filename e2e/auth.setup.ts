import { expect, test as setup } from '@playwright/test';
import { ADMIN_STATE, E2E_ADMIN } from './fixtures';

// Logs the admin in once (A1) and saves the session for the admin specs
setup('admin logs in and lands on the admin panel', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill(E2E_ADMIN.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(E2E_ADMIN.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('heading', { name: "Panneau d'administration" })).toBeVisible();
  await expect(page.getByText(/Mode lecture seule/)).toBeHidden();

  await page.context().storageState({ path: ADMIN_STATE });
});
