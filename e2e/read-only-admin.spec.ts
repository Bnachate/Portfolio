import { expect, test } from '@playwright/test';

test.describe('Read-only admin (visitor)', () => {
  test('the header "Admin" link opens the panel in read-only mode (R1, R3)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Admin' }).click();

    await expect(page).toHaveURL('/admin');
    await expect(page.getByText(/Mode lecture seule/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveText(['Expériences', 'Projets', 'Tags', 'Hero']);
    await expect(page.getByRole('tab', { name: 'Messages' })).toHaveCount(0);
  });

  test('every tab can be browsed without any way to change anything (R2)', async ({ page }) => {
    await page.goto('/admin');

    // Experiences: data visible, no editing controls
    await expect(page.getByRole('cell', { name: 'Weborama' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Nouvelle expérience|Modifier|Supprimer/ })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Projets' }).click();
    await expect(page.getByRole('heading', { name: 'Gestion des Projets' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Nouveau projet|Modifier|Supprimer/ })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Tags' }).click();
    await expect(page.getByRole('cell', { name: 'Vue.js' })).toBeVisible();
    await expect(page.getByLabel('Rechercher un tag')).toBeVisible();
    await expect(page.getByLabel('Nom du nouveau tag')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Ajouter|Renommer|Supprimer/ })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Hero' }).click();
    await expect(page.getByLabel('Titre principal')).toBeDisabled();
    await expect(page.getByLabel('Email de contact')).toHaveValue('');
    await expect(page.getByRole('button', { name: /Sauvegarder/ })).toHaveCount(0);
  });

  test('the API refuses changes even if the interface is bypassed (R4)', async ({ request }) => {
    const response = await request.post('/api/tags', {
      data: { name: 'Hacked' },
      headers: { origin: 'http://localhost:3100' },
    });
    expect(response.status()).toBe(401);
  });
});
