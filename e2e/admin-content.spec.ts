import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE } from './fixtures';

test.use({ storageState: ADMIN_STATE });

async function openTab(page: Page, name: string) {
  await page.goto('/admin');
  await page.getByRole('tab', { name }).click();
}

test.describe('Admin - experiences', () => {
  test('create, edit and delete an experience, reflected on the public site (E1, E2, E3)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Nouvelle expérience' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Titre du poste').fill('Ingénieur E2E');
    await dialog.getByLabel('Entreprise').fill('Playwright Corp');
    await dialog.getByLabel('Position').fill('0');
    await dialog.getByLabel('Date de début').fill('2019-03-01');
    await dialog.getByLabel('Date de fin').fill('2020-02-01');
    await dialog.getByLabel('Description').fill('Tests de bout en bout');
    await dialog.getByLabel('Tags').click();
    await page.getByRole('menuitemcheckbox', { name: 'TypeScript' }).click();
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: 'Créer' }).click();

    const row = page.getByRole('row').filter({ hasText: 'Ingénieur E2E' });
    await expect(row).toContainText('Playwright Corp');
    await expect(row).toContainText('TypeScript');

    // Shown on the public site, first because of its position
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ingénieur E2E' })).toBeVisible();
    await expect(page.getByText('Mars 2019 - Févr. 2020')).toBeVisible();

    // Edit
    await page.goto('/admin');
    await row.getByRole('button', { name: 'Modifier' }).click();
    await dialog.getByLabel('Entreprise').fill('Playwright SAS');
    await dialog.getByRole('button', { name: 'Mettre à jour' }).click();
    await expect(row).toContainText('Playwright SAS');

    // Delete
    await row.getByRole('button', { name: "Supprimer l'expérience" }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
    await expect(row).toHaveCount(0);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ingénieur E2E' })).toHaveCount(0);
  });
});

test.describe('Admin - projects', () => {
  test('create and delete a project, reflected on the public site (P1)', async ({ page }) => {
    await openTab(page, 'Projets');
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Titre du projet').fill('Projet E2E');
    await dialog.getByLabel("URL de l'image").fill('https://example.com/e2e.png');
    await dialog.getByLabel('URL GitHub').fill('https://github.com/example/e2e');
    await dialog.getByLabel('Description').fill('Créé par Playwright');
    await dialog.getByRole('button', { name: 'Créer' }).click();

    const row = page.getByRole('row').filter({ hasText: 'Projet E2E' });
    await expect(row).toBeVisible();
    await expect(row.getByRole('link', { name: 'Ouvrir sur GitHub' })).toHaveAttribute('href', 'https://github.com/example/e2e');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Projet E2E' })).toBeVisible();
    await expect(page.getByText('Les projets arrivent bientôt.')).toHaveCount(0);

    await openTab(page, 'Projets');
    await row.getByRole('button', { name: 'Supprimer le projet' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
    await expect(row).toHaveCount(0);
  });
});

test.describe('Admin - tags', () => {
  test('create, rename and delete a tag (T1, T4)', async ({ page }) => {
    await openTab(page, 'Tags');
    await page.getByLabel('Nom du nouveau tag').fill('Cypress');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByRole('cell', { name: 'Cypress', exact: true })).toBeVisible();

    await page.getByLabel('Rechercher un tag').fill('cypr');
    await expect(page.getByRole('row')).toHaveCount(2); // header + Cypress

    await page.getByRole('button', { name: 'Renommer Cypress' }).click();
    await page.getByLabel('Nouveau nom pour Cypress').fill('Puppeteer');
    await page.getByLabel('Nouveau nom pour Cypress').press('Enter');
    await page.getByLabel('Rechercher un tag').fill('');
    await expect(page.getByRole('cell', { name: 'Puppeteer', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Supprimer Puppeteer' }).click();
    await expect(page.getByRole('dialog')).toContainText("n'est utilisé nulle part");
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByRole('cell', { name: 'Puppeteer', exact: true })).toHaveCount(0);
  });

  test('a used tag shows its usage and warns before deletion (T3)', async ({ page }) => {
    await openTab(page, 'Tags');
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Java', exact: true }) });
    await expect(row).toContainText('expérience');

    await row.getByRole('button', { name: 'Supprimer Java' }).click();
    await expect(page.getByRole('dialog')).toContainText('Il sera aussi retiré de');
    await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();
    await expect(row).toBeVisible();
  });
});

test.describe('Admin - hero', () => {
  test('editing the hero updates the public site (H1)', async ({ page }) => {
    await openTab(page, 'Hero');
    const subtitle = page.getByLabel('Sous-titre');
    const original = await subtitle.inputValue();

    await subtitle.fill('Sous-titre modifié par Playwright');
    await expect(page.getByText('Sous-titre modifié par Playwright').last()).toBeVisible(); // live preview
    await page.getByRole('button', { name: /Sauvegarder les modifications/ }).click();
    await expect(page.getByText('Les modifications ont été sauvegardées avec succès !')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('Sous-titre modifié par Playwright')).toBeVisible();

    // Restore the original subtitle for the other specs
    await openTab(page, 'Hero');
    await page.getByLabel('Sous-titre').fill(original);
    await page.getByRole('button', { name: /Sauvegarder les modifications/ }).click();
    await expect(page.getByText('Les modifications ont été sauvegardées avec succès !')).toBeVisible();
  });
});

test.describe('Admin - contact messages', () => {
  test('a visitor message is listed, read, marked as done and deleted (M1, M2, M3)', async ({ page, browser }) => {
    // The visitor sends the message from a separate, logged-out browser context
    const visitor = await browser.newContext();
    const visitorPage = await visitor.newPage();
    await visitorPage.goto('/#contact');
    await visitorPage.getByLabel('Nom').fill('Grace Hopper');
    await visitorPage.getByLabel('Email').fill('grace@example.com');
    await visitorPage.getByLabel('Sujet').fill('E2E - question');
    await visitorPage.getByLabel('Message').fill('Un message pour la boîte de réception.');
    await visitorPage.getByRole('button', { name: /Envoyer le message/ }).click();
    await expect(visitorPage.getByText('Message envoyé !')).toBeVisible();
    await visitor.close();

    await openTab(page, 'Messages');
    const row = page.getByRole('row').filter({ hasText: 'Grace Hopper' });
    await expect(row).toContainText('E2E - question');
    await expect(page.getByText(/nouveau/)).toBeVisible();

    // Opening marks it as read (row actions: view first, delete second)
    await row.getByRole('button').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Un message pour la boîte de réception.');
    await expect(dialog.getByText('Lu', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Répondre par email/ })).toHaveAttribute('href', 'mailto:grace@example.com');

    await dialog.getByRole('button', { name: /Marquer comme traité/ }).click();
    await row.getByRole('button').first().click();
    await expect(page.getByRole('dialog').getByText('Traité', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');

    page.once('dialog', (confirm) => confirm.accept());
    await row.getByRole('button').nth(1).click();
    await expect(row).toHaveCount(0);
  });
});
