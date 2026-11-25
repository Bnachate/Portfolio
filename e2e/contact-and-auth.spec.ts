import { expect, test } from '@playwright/test';
import { ADMIN_STATE, E2E_ADMIN } from './fixtures';

test.describe('Contact form (visitor)', () => {
  test('a visitor sends a message and gets a confirmation (C1)', async ({ page }) => {
    await page.goto('/contact');
    const form = page.getByRole('form', { name: 'Formulaire de contact' });

    await form.getByLabel('Nom').fill('Ada Lovelace');
    await form.getByLabel('E-mail').fill('ada@example.com');
    await form.getByLabel('Sujet').fill('E2E - proposition de mission');
    await form.getByLabel('Message').fill('Bonjour, je vous contacte depuis un test E2E.');
    await form.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByRole('status')).toContainText('Message envoyé !');
    await page.getByRole('button', { name: 'Envoyer un autre message' }).click();
    await expect(page.getByRole('form', { name: 'Formulaire de contact' }).getByLabel('Nom')).toHaveValue('');
  });

  test('the browser blocks an incomplete message (C2)', async ({ page }) => {
    let posted = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/contacts')) posted = true;
    });
    await page.goto('/contact');
    await page.getByLabel('Nom').fill('Ada');
    await page.getByLabel('E-mail').fill('not-an-email');
    await page.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByText('Message envoyé !')).toBeHidden();
    expect(await page.getByLabel('E-mail').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
    expect(posted).toBe(false);
  });
});

test.describe('Authentication', () => {
  test('wrong credentials show an error and stay on the login page (A2)', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('E-mail').fill(E2E_ADMIN.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('the login page links back to the site (A1)', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /Retour au site/ }).click();
    await expect(page).toHaveURL('/');
  });

  test.describe('as the logged-in admin', () => {
    test.use({ storageState: ADMIN_STATE });

    test('opening the login page goes straight to the admin panel (A4)', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page).toHaveURL('/admin');
    });

    test('logout ends the session and the panel becomes read-only again (A5)', async ({ page }) => {
      // The public site has no session controls: the footer leads to the admin panel
      await page.goto('/');
      await page.getByRole('navigation', { name: 'Liens du pied de page' }).getByRole('link', { name: 'Admin' }).click();
      await expect(page).toHaveURL('/admin');

      await page.getByRole('button', { name: 'Déconnexion' }).click();
      await expect(page).toHaveURL('/');

      await page.goto('/admin');
      await expect(page.getByText(/Mode lecture seule/)).toBeVisible();
      await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();
    });
  });
});
