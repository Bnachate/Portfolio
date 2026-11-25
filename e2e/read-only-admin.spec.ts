import { expect, test } from '@playwright/test';

const EDITING_CONTROLS = /^(Nouvelle expérience|Nouveau projet|Ajouter|Renommer|Modifier|Supprimer|Monter|Descendre|Enregistrer)/;

test.describe('Read-only admin (visitor)', () => {
  test('the footer "Admin" link opens the panel in read-only mode (R1, R3)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Liens du pied de page' }).getByRole('link', { name: 'Admin' }).click();

    await expect(page).toHaveURL('/admin');
    await expect(page.getByText(/Mode lecture seule/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveText(['Expériences', 'Projets', 'Tags', 'Domaines', 'Hero']);
    await expect(page.getByRole('tab', { name: 'Messages' })).toHaveCount(0);
  });

  test('the header "Admin" link, right after "Contact", opens the panel in read-only mode (R1)', async ({ page }) => {
    await page.goto('/contact');
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav.getByRole('link')).toHaveText(['Accueil', 'Projets', 'Expérience', 'Compétences', 'Contact', 'Admin', 'CV en PDF']);
    await nav.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText(/Mode lecture seule/)).toBeVisible();
  });

  test('every tab can be browsed without any way to change anything (R2)', async ({ page }) => {
    await page.goto('/admin');

    // Experiences: data visible, no editing or ordering controls
    await expect(page.getByRole('cell', { name: 'Weborama' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: EDITING_CONTROLS })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Projets' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Projets' })).toBeVisible();
    await expect(page.getByRole('button', { name: EDITING_CONTROLS })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Tags' }).click();
    await expect(page.getByRole('cell', { name: 'Vue.js', exact: true })).toBeVisible();
    await expect(page.getByLabel('Rechercher un tag')).toBeVisible();
    await expect(page.getByLabel('Nom du nouveau tag')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: EDITING_CONTROLS })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Domaines' }).click();
    await expect(page.getByRole('cell', { name: 'Front-end', exact: true })).toBeVisible();
    await expect(page.getByLabel('Nom du nouveau domaine')).toHaveCount(0);
    await expect(page.getByRole('button', { name: EDITING_CONTROLS })).toHaveCount(0);

    await page.getByRole('tab', { name: 'Hero' }).click();
    await expect(page.getByLabel('Titre principal')).toBeDisabled();
    await expect(page.getByRole('switch', { name: 'Afficher le voyant de disponibilité' })).toBeDisabled();
    await expect(page.getByLabel('E-mail de contact')).toHaveValue('');
    await expect(page.getByRole('button', { name: EDITING_CONTROLS })).toHaveCount(0);
  });

  test('the API refuses changes even if the interface is bypassed (R4)', async ({ request }) => {
    const headers = { origin: 'http://localhost:3100' };
    expect((await request.post('/api/tags', { data: { name: 'Hacked' }, headers })).status()).toBe(401);
    expect((await request.put('/api/experiences/order', { data: { ids: [1] }, headers })).status()).toBe(401);
  });
});
