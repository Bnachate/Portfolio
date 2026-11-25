import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE } from './fixtures';

// WCAG 2.1 A and AA rules, checked by axe-core (the engine behind Lighthouse's accessibility audit)
async function expectNoViolations(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map((node) => node.target.join(' ')),
  }));
  expect(summary, `Accessibility violations on ${label}`).toEqual([]);
}

test.describe('Accessibility (visitor)', () => {
  test('every public page (X1)', async ({ page }) => {
    for (const path of ['/', '/projets', '/experience', '/competences', '/contact']) {
      await page.goto(path);
      await expectNoViolations(page, path);
    }
  });

  test('a project case study and the 404 page (X1)', async ({ page }) => {
    await page.goto('/projets');
    const caseStudy = page.getByRole('link', { name: /Lire l'étude de cas/ }).first();
    if ((await caseStudy.count()) > 0) {
      await caseStudy.click();
      await expect(page).toHaveURL(/\/projets\/\d+$/);
      await expectNoViolations(page, 'case study');
    }
    await page.goto('/projets/999999');
    await expectNoViolations(page, '404');
  });

  test('public pages on a phone (X1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    for (const path of ['/', '/contact']) {
      await page.goto(path);
      await expectNoViolations(page, `${path} on a phone`);
    }
  });

  test('contact form after sending nothing (X1)', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel('Nom').fill('   ');
    await page.getByLabel('E-mail').fill('ada@example.com');
    await page.getByLabel('Sujet').fill('   ');
    await page.getByLabel('Message').fill('   ');
    await page.getByRole('button', { name: /Envoyer le message/ }).click();
    await expect(page.getByText('Merci de remplir tous les champs.')).toBeVisible();
    await expectNoViolations(page, 'contact form error');
  });

  test('login page, including the error state (X2)', async ({ page }) => {
    await page.goto('/auth/login');
    await expectNoViolations(page, 'login');
    await page.getByLabel('E-mail').fill('nobody@example.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('   ');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir votre email et votre mot de passe')).toBeVisible();
    await expectNoViolations(page, 'login error');
  });

  test('read-only admin, every tab (X3)', async ({ page }) => {
    await page.goto('/admin');
    for (const tab of ['Expériences', 'Projets', 'Tags', 'Domaines', 'Hero']) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await expectNoViolations(page, `read-only ${tab}`);
    }
  });
});

test.describe('Accessibility (admin)', () => {
  test.use({ storageState: ADMIN_STATE });

  test('every admin tab (X4)', async ({ page }) => {
    await page.goto('/admin');
    for (const tab of ['Expériences', 'Messages', 'Projets', 'Tags', 'Domaines', 'Hero']) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await expectNoViolations(page, `admin ${tab}`);
    }
  });

  test('admin dialogs and in-place states: forms, tags menu, open message, deletion questions, tag renaming (X4)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Nouvelle expérience' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'experience dialog');
    await page.keyboard.press('Escape');

    // Editing an experience shows its selected tags (removable chips) and the tags menu
    await page.getByRole('button', { name: /^Modifier / }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('list', { name: 'Tags sélectionnés' })).toBeVisible();
    await expectNoViolations(page, 'experience edit dialog with tags');
    await dialog.getByLabel('Tags', { exact: true }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expectNoViolations(page, 'tags menu');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Deletion modal
    await page.getByRole('button', { name: /^Supprimer / }).first().click();
    await expect(page.getByRole('alertdialog', { name: /^Supprimer « / })).toBeVisible();
    await expectNoViolations(page, 'experience deletion question');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Messages' }).click();
    await page.getByRole('list', { name: 'Messages reçus' }).getByRole('button', { name: /Seed Visitor/ }).click();
    await expect(page.getByRole('article', { name: 'Message de Seed Visitor' })).toBeVisible();
    await expectNoViolations(page, 'open message');

    await page.getByRole('tab', { name: 'Projets' }).click();
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'project dialog');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Tags' }).click();
    await page.getByRole('button', { name: 'Supprimer Java', exact: true }).click();
    await expect(page.getByRole('alertdialog', { name: /^Supprimer « Java »/ })).toBeVisible();
    await expectNoViolations(page, 'tag deletion question');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Renommer Java', exact: true }).click();
    await expect(page.getByLabel('Nouveau nom pour Java')).toBeVisible();
    await expectNoViolations(page, 'tag renaming');
  });
});
