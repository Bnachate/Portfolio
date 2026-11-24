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
  test('home page (X1)', async ({ page }) => {
    await page.goto('/');
    await expectNoViolations(page, 'home');
  });

  test('home page with the mobile menu open (X1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await expectNoViolations(page, 'mobile menu');
  });

  test('login page, including the error state (X2)', async ({ page }) => {
    await page.goto('/auth/login');
    await expectNoViolations(page, 'login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('   ');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir votre email et votre mot de passe')).toBeVisible();
    await expectNoViolations(page, 'login error');
  });

  test('read-only admin, every tab (X3)', async ({ page }) => {
    await page.goto('/admin');
    for (const tab of ['Expériences', 'Projets', 'Tags', 'Hero']) {
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
    for (const tab of ['Expériences', 'Messages', 'Projets', 'Tags', 'Hero']) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await expectNoViolations(page, `admin ${tab}`);
    }
  });

  test('admin dialogs: experience and project forms, tags menu, message, tag deletion (X4)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Nouvelle expérience' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'experience dialog');
    await page.keyboard.press('Escape');

    // Editing an experience shows its selected tags (removable chips) and the tags menu
    await page.getByRole('button', { name: 'Modifier' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('list', { name: 'Tags sélectionnés' })).toBeVisible();
    await expectNoViolations(page, 'experience edit dialog with tags');
    await dialog.getByLabel('Tags', { exact: true }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expectNoViolations(page, 'tags menu');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Messages' }).click();
    await page.getByRole('button', { name: 'Voir le message de Seed Visitor' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'message dialog');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Projets' }).click();
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'project dialog');
    await page.keyboard.press('Escape');

    await page.getByRole('tab', { name: 'Tags' }).click();
    await page.getByRole('button', { name: 'Supprimer Java', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'tag deletion dialog');
  });
});
