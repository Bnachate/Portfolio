import { expect, test, type Page } from '@playwright/test';
import { ADMIN_STATE } from './fixtures';

// Sets window.__xss if any of it ever runs; alert() would open a dialog, which fails the test too
const XSS = `<img src=x onerror="window.__xss=1;alert('xss')"><script>window.__xss=1</script>`;

function failOnDialog(page: Page) {
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
    throw new Error(`Unexpected dialog: ${dialog.message()}`);
  });
}

const xssRan = (page: Page) => page.evaluate(() => (window as { __xss?: number }).__xss !== undefined);

test.describe('Input safety (visitor)', () => {
  test('a contact form made of spaces is never sent (I1)', async ({ page }) => {
    let posted = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/contacts')) posted = true;
    });
    await page.goto('/#contact');
    await page.getByLabel('Nom').fill('   ');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Sujet').fill('   ');
    await page.getByLabel('Message').fill('   ');
    await page.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByText('Merci de remplir tous les champs.')).toBeVisible();
    expect(posted).toBe(false);
  });

  test('a login with a password made of spaces is never sent (I2)', async ({ page }) => {
    let posted = false;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/auth/login')) posted = true;
    });
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('   ');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Veuillez saisir votre email et votre mot de passe')).toBeVisible();
    expect(posted).toBe(false);
  });
});

test.describe('Input safety (admin)', () => {
  test.use({ storageState: ADMIN_STATE });

  test('a hostile contact message is shown as plain text in the admin (I3)', async ({ page, browser }) => {
    const visitor = await browser.newContext();
    const visitorPage = await visitor.newPage();
    await visitorPage.goto('/#contact');
    await visitorPage.getByLabel('Nom').fill('Mallory');
    await visitorPage.getByLabel('Email').fill('mallory@example.com');
    await visitorPage.getByLabel('Sujet').fill(XSS);
    await visitorPage.getByLabel('Message').fill(XSS);
    await visitorPage.getByRole('button', { name: /Envoyer le message/ }).click();
    await expect(visitorPage.getByText('Message envoyé !')).toBeVisible();
    await visitor.close();

    failOnDialog(page);
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Messages' }).click();
    const row = page.getByRole('row').filter({ hasText: 'Mallory' });
    await expect(row).toContainText(XSS);

    await row.getByRole('button', { name: /^Voir le message de / }).click();
    await expect(page.getByRole('dialog')).toContainText(XSS);
    expect(await xssRan(page)).toBe(false);
    await page.keyboard.press('Escape');

    // Clean up
    page.removeAllListeners('dialog');
    page.once('dialog', (confirm) => confirm.accept());
    await row.getByRole('button', { name: /^Supprimer le message de / }).click();
    await expect(row).toHaveCount(0);
  });

  test('a tag named with HTML is shown literally (I4)', async ({ page }) => {
    failOnDialog(page);
    const name = '<img src=x onerror=window.__xss=1>';
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Tags' }).click();
    await page.getByLabel('Nom du nouveau tag').fill(name);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
    expect(await xssRan(page)).toBe(false);

    await page.getByRole('button', { name: `Supprimer ${name}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByRole('cell', { name, exact: true })).toHaveCount(0);
  });

  test('a hero link leading to another site is refused (I5)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Hero' }).click();
    await page.getByLabel('Lien bouton principal').fill('/\\evil.example');
    await page.getByRole('button', { name: /Sauvegarder les modifications/ }).click();

    // Scoped to the tab: Next.js adds its own role="alert" route announcer to every page
    await expect(page.getByRole('tabpanel', { name: 'Hero' }).getByRole('alert')).toContainText('Lien invalide');
    await page.goto('/');
    await expect(page.locator('a[href*="evil.example"]')).toHaveCount(0);
  });
});
