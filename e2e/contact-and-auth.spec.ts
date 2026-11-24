import { expect, test } from '@playwright/test';
import { ADMIN_STATE, E2E_ADMIN } from './fixtures';

test.describe('Contact form (visitor)', () => {
  test('a visitor sends a message and gets a confirmation (C1)', async ({ page }) => {
    await page.goto('/#contact');
    const form = page.locator('form').filter({ has: page.getByRole('button', { name: /Envoyer le message/ }) });

    await form.getByLabel('Nom').fill('Ada Lovelace');
    await form.getByLabel('Email').fill('ada@example.com');
    await form.getByLabel('Sujet').fill('E2E - proposition de mission');
    await form.getByLabel('Message').fill('Bonjour, je vous contacte depuis un test E2E.');
    await form.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByText('Message envoyé !')).toBeVisible();
    await page.getByRole('button', { name: 'Envoyer un autre message' }).click();
    await expect(form.getByLabel('Nom')).toHaveValue('');
  });

  test('the browser blocks an incomplete message (C2)', async ({ page }) => {
    let posted = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/contacts')) posted = true;
    });
    await page.goto('/#contact');
    await page.getByLabel('Nom').fill('Ada');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByText('Message envoyé !')).toBeHidden();
    expect(await page.getByLabel('Email').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
    expect(posted).toBe(false);
  });
});

test.describe('Authentication', () => {
  test('wrong credentials show an error and stay on the login page (A2)', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(E2E_ADMIN.email);
    await page.getByLabel('Mot de passe').fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test.describe('as the logged-in admin', () => {
    test.use({ storageState: ADMIN_STATE });

    test('opening the login page goes straight to the admin panel (A4)', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page).toHaveURL('/admin');
    });

    test('the public header offers the admin panel and logout, and logout ends the session (A5)', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Connexion' })).toHaveCount(0);

      await page.goto('/admin');
      await page.getByRole('button', { name: 'Déconnexion' }).click();
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();

      // The panel is read-only again
      await page.goto('/admin');
      await expect(page.getByText(/Mode lecture seule/)).toBeVisible();
    });
  });
});
