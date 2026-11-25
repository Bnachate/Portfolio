import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE, confirmDeletion } from './fixtures';

test.use({ storageState: ADMIN_STATE });

async function openTab(page: Page, name: string) {
  await page.goto('/admin');
  await page.getByRole('tab', { name }).click();
}

// Domain picked in a tag's select (values are domain ids)
const selectedDomain = (page: Page, tag: string) => page.getByLabel(`Domaine de ${tag}`).locator('option:checked');

// Job titles of the experiences table, in display order
const jobsInTable = (page: Page) => page.getByRole('row').locator('td:nth-child(2) span.font-bold').allTextContents();

test.describe('Admin - experiences', () => {
  test('create, edit and delete an experience, reflected on the public site (E1, E2, E3)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Nouvelle expérience' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Titre du poste').fill('Ingénieur E2E');
    await dialog.getByLabel('Entreprise').fill('Playwright Corp');
    await dialog.getByLabel('Date de début').fill('2019-03-01');
    await dialog.getByLabel('Date de fin (vide = poste actuel)').fill('2020-02-01');
    await dialog.getByLabel('Description').fill('Tests de bout en bout');
    await dialog.getByLabel('Tags', { exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: 'TypeScript' }).click();
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: 'Créer', exact: true }).click();

    const row = page.getByRole('row').filter({ hasText: 'Ingénieur E2E' });
    await expect(row).toContainText('Playwright Corp');
    await expect(row).toContainText('TypeScript');
    // New experiences go to the end of the list
    expect((await jobsInTable(page)).at(-1)).toBe('Ingénieur E2E');

    await page.goto('/experience');
    await expect(page.getByRole('heading', { level: 2, name: 'Ingénieur E2E' })).toBeVisible();
    await expect(page.getByText('Mars 2019 - Févr. 2020')).toBeVisible();

    // Edit
    await page.goto('/admin');
    await row.getByRole('button', { name: 'Modifier Ingénieur E2E' }).click();
    await dialog.getByLabel('Entreprise').fill('Playwright SAS');
    await dialog.getByRole('button', { name: 'Mettre à jour' }).click();
    await expect(row).toContainText('Playwright SAS');

    // Delete, after the in-row confirmation
    await row.getByRole('button', { name: 'Supprimer Ingénieur E2E' }).click();
    await confirmDeletion(page, 'Supprimer « Ingénieur E2E » ?');
    await expect(row).toHaveCount(0);
    await page.goto('/experience');
    await expect(page.getByRole('heading', { name: 'Ingénieur E2E' })).toHaveCount(0);
  });

  test('move an experience down and back up, reflected on the experience page (E4)', async ({ page }) => {
    await page.goto('/admin');
    // Wait for the table: the experiences load after the first render
    await expect(page.getByRole('button', { name: /^Descendre / }).first()).toBeVisible();
    const [first, second] = await jobsInTable(page);

    await page.getByRole('button', { name: `Descendre ${first}`, exact: true }).click();
    await expect.poll(() => jobsInTable(page).then((jobs) => jobs.slice(0, 2))).toEqual([second, first]);
    await page.goto('/experience');
    await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toContainText(second);

    // Restore the order for the other specs (kept after a reload: saved on the server)
    await page.goto('/admin');
    await expect.poll(() => jobsInTable(page).then((jobs) => jobs.slice(0, 2))).toEqual([second, first]);
    await page.getByRole('button', { name: `Monter ${first}`, exact: true }).click();
    await expect.poll(() => jobsInTable(page).then((jobs) => jobs.slice(0, 2))).toEqual([first, second]);
  });
});

test.describe('Admin - projects', () => {
  test('create and delete a project, with its case study page (P1)', async ({ page }) => {
    await openTab(page, 'Projets');
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Titre du projet').fill('Projet E2E');
    await dialog.getByLabel("URL de l'image").fill('https://example.com/e2e.png');
    await dialog.getByLabel('URL GitHub').fill('https://github.com/example/e2e');
    await dialog.getByLabel('Description').fill('Créé par Playwright');
    await dialog.getByLabel('Type').fill('Projet de test');
    await dialog.getByLabel("Ce que j'ai fait (une réalisation par ligne)").fill('Écrire la spec\nLa faire passer');
    await dialog.getByRole('button', { name: 'Créer', exact: true }).click();

    const row = page.getByRole('row').filter({ hasText: 'Projet E2E' });
    await expect(row).toBeVisible();
    await expect(row.getByRole('link', { name: 'github.com/example/e2e' })).toHaveAttribute('href', 'https://github.com/example/e2e');

    // The admin link opens the public case study
    await row.getByRole('link', { name: 'Voir Projet E2E sur le site' }).click();
    await expect(page).toHaveURL(/\/projets\/\d+$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Projet E2E' })).toBeVisible();
    await expect(page.getByText('Projet de test')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'La faire passer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Code source' })).toHaveAttribute('href', 'https://github.com/example/e2e');

    await page.goto('/projets');
    await expect(page.getByRole('heading', { level: 2, name: 'Projet E2E' })).toBeVisible();

    await openTab(page, 'Projets');
    await row.getByRole('button', { name: 'Supprimer Projet E2E' }).click();
    await confirmDeletion(page, 'Supprimer « Projet E2E » ?');
    await expect(row).toHaveCount(0);

    // Gone from the public site too
    await page.goto('/projets');
    await expect(page.getByRole('heading', { name: 'Projet E2E' })).toHaveCount(0);
  });
});

test.describe('Admin - skill domains', () => {
  test('create a domain, give it a tag, see it on /competences, then delete it (D1, D2, D4)', async ({ page }) => {
    await openTab(page, 'Domaines');
    await page.getByLabel('Nom du nouveau domaine').fill('Domaine E2E');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByRole('cell', { name: 'Domaine E2E', exact: true })).toBeVisible();

    // Docker (used by a seeded experience) moves to the new domain
    await openTab(page, 'Tags');
    await page.getByLabel('Domaine de Docker').selectOption('Domaine E2E');
    await expect(selectedDomain(page, 'Docker')).toHaveText('Domaine E2E');

    await page.goto('/competences');
    const section = page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: 'Domaine E2E' }) });
    await expect(section.getByText('Docker', { exact: true })).toBeVisible();

    // Restore Docker, then delete the domain
    await openTab(page, 'Tags');
    await page.getByLabel('Domaine de Docker').selectOption('Outils de livraison');
    await expect(selectedDomain(page, 'Docker')).toHaveText('Outils de livraison');
    await openTab(page, 'Domaines');
    await page.getByRole('button', { name: 'Supprimer Domaine E2E' }).click();
    await confirmDeletion(page, 'Supprimer « Domaine E2E » ?');
    await expect(page.getByRole('cell', { name: 'Domaine E2E', exact: true })).toHaveCount(0);

    await page.goto('/competences');
    await expect(page.getByRole('heading', { name: 'Domaine E2E' })).toHaveCount(0);
  });

  test('reorder the domains, reflected on /competences, then restore (D3)', async ({ page }) => {
    await openTab(page, 'Domaines');
    await expect(page.getByRole('cell', { name: 'Front-end', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Descendre Front-end' }).click();
    await expect(page.getByRole('button', { name: 'Monter Front-end' })).toBeEnabled();

    await page.goto('/competences');
    const headings = page.getByRole('main').getByRole('heading', { level: 2 });
    await expect(headings.nth(0)).toHaveText('Tests, qualité et design');
    await expect(headings.nth(1)).toHaveText('Front-end');

    await openTab(page, 'Domaines');
    await page.getByRole('button', { name: 'Monter Front-end' }).click();
    await expect(page.getByRole('button', { name: 'Monter Front-end' })).toBeDisabled();
  });
});

test.describe('Admin - tags', () => {
  test('create with a domain, rename and delete a tag (T1, T4, T5)', async ({ page }) => {
    await openTab(page, 'Tags');
    await page.getByLabel('Nom du nouveau tag').fill('Cypress');
    await page.getByLabel('Domaine du nouveau tag').selectOption('Tests, qualité et design');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByRole('cell', { name: 'Cypress', exact: true })).toBeVisible();
    await expect(selectedDomain(page, 'Cypress')).toHaveText('Tests, qualité et design');

    // The domain is saved as soon as it is picked (kept after a reload)
    await page.getByLabel('Domaine de Cypress').selectOption('Outils de livraison');
    await openTab(page, 'Tags');
    await expect(selectedDomain(page, 'Cypress')).toHaveText('Outils de livraison');

    await page.getByLabel('Rechercher un tag').fill('cypr');
    await expect(page.getByRole('row')).toHaveCount(2); // header + Cypress

    await page.getByRole('button', { name: 'Renommer Cypress' }).click();
    await page.getByLabel('Nouveau nom pour Cypress').fill('Puppeteer');
    await page.getByLabel('Nouveau nom pour Cypress').press('Enter');
    await page.getByLabel('Rechercher un tag').fill('');
    await expect(page.getByRole('cell', { name: 'Puppeteer', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Supprimer Puppeteer' }).click();
    await confirmDeletion(page, 'Supprimer « Puppeteer » ?');
    await expect(page.getByRole('cell', { name: 'Puppeteer', exact: true })).toHaveCount(0);
  });

  test('a used tag shows its usage and warns before deletion (T3)', async ({ page }) => {
    await openTab(page, 'Tags');
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Java', exact: true }) });
    await expect(row).toContainText('expérience');

    await row.getByRole('button', { name: 'Supprimer Java', exact: true }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Supprimer « Java » ?' });
    await expect(confirm).toBeVisible();
    await expect(confirm).toHaveAccessibleDescription(/Il sera retiré de .*expérience/);
    // Focus is on the safe answer: Enter would keep the tag
    await expect(confirm.getByRole('button', { name: 'Non' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(confirm).toHaveCount(0);
    await expect(row.getByRole('button', { name: 'Supprimer Java', exact: true })).toBeVisible();
  });
});

test.describe('Admin - hero', () => {
  test('editing the hero updates the public site (H1, H2)', async ({ page }) => {
    await openTab(page, 'Hero');
    const subtitle = page.getByLabel('Sous-titre');
    const original = await subtitle.inputValue();
    const preview = page.getByRole('complementary', { name: 'Aperçu' });

    await subtitle.fill('Sous-titre modifié par Playwright');
    await expect(preview).toContainText('Sous-titre modifié par Playwright');
    // Turning the availability indicator off hides it from the preview and the home page
    await page.getByRole('switch', { name: 'Afficher le voyant de disponibilité' }).click();
    await expect(preview).not.toContainText('Ouvert aux opportunités');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Enregistré : les modifications sont en ligne.')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('Sous-titre modifié par Playwright')).toBeVisible();
    await expect(page.getByText('Ouvert aux opportunités, Paris')).toHaveCount(0);

    // Restore the original hero for the other specs
    await openTab(page, 'Hero');
    await page.getByLabel('Sous-titre').fill(original);
    await page.getByRole('switch', { name: 'Afficher le voyant de disponibilité' }).click();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Enregistré : les modifications sont en ligne.')).toBeVisible();
  });
});

test.describe('Admin - contact messages', () => {
  test('a visitor message is listed, read, marked as done and deleted (M1, M2, M3)', async ({ page, browser }) => {
    // The visitor sends the message from a separate, logged-out browser context
    const visitor = await browser.newContext();
    const visitorPage = await visitor.newPage();
    await visitorPage.goto('/contact');
    await visitorPage.getByLabel('Nom').fill('Grace Hopper');
    await visitorPage.getByLabel('E-mail').fill('grace@example.com');
    await visitorPage.getByLabel('Sujet').fill('E2E - question');
    await visitorPage.getByLabel('Message').fill('Un message pour la boîte de réception.');
    await visitorPage.getByRole('button', { name: /Envoyer le message/ }).click();
    await expect(visitorPage.getByText('Message envoyé !')).toBeVisible();
    await visitor.close();

    await openTab(page, 'Messages');
    const messages = page.getByRole('list', { name: 'Messages reçus' });
    const item = messages.getByRole('button', { name: /Grace Hopper/ });
    await expect(item).toContainText('E2E - question');
    // Unread messages are announced and counted on the tab
    await expect(item).toHaveAccessibleName(/^Nouveau message : Grace Hopper/);
    await expect(page.getByRole('tab', { name: /Messages \d+ non lus?/ })).toBeVisible();

    // Opening marks it as read, next to the list
    await item.click();
    const message = page.getByRole('article', { name: 'Message de Grace Hopper' });
    await expect(message).toContainText('Un message pour la boîte de réception.');
    await expect(message.getByText('Lu', { exact: true })).toBeVisible();
    await expect(item).not.toHaveAccessibleName(/Nouveau message/);
    await expect(message.getByRole('link', { name: 'Répondre par e-mail' })).toHaveAttribute('href', /^mailto:grace@example\.com\?subject=/);

    await message.getByRole('button', { name: 'Marquer comme traité' }).click();
    await expect(message.getByText('Traité', { exact: true })).toBeVisible();

    // The "unread" filter hides it
    await page.getByRole('button', { name: /^Non lus/ }).click();
    await expect(item).toHaveCount(0);
    await page.getByRole('button', { name: 'Tous' }).click();

    await item.click();
    await message.getByRole('button', { name: 'Supprimer' }).click();
    await confirmDeletion(page, 'Supprimer ce message ?');
    await expect(item).toHaveCount(0);
  });
});
