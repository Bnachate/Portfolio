import { expect, test } from '@playwright/test';

test.describe('Public site (visitor)', () => {
  test('home shows every section with the seeded content (V1)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

    await page.goto('/');

    await expect(page).toHaveTitle('Brahim Nachate — Développeur Full-Stack');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Développeur Full-Stack');
    for (const heading of ['Mes Projets', 'Expérience', 'Formation & langues', 'Contactez-moi']) {
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    }
    // The projects list depends on what other specs created: only the section itself is checked here
    // (the empty state is covered by tests/ui/public-site.test.tsx, deletion by admin-content.spec.ts)
    await expect(page.locator('section#projets')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Développeur Full-Stack Vue.js / Java' })).toBeVisible();
    await expect(page.getByText('Coding Academy by Epitech Paris')).toBeVisible();
    // Styles and scripts load under the production CSP (no violation in the console)
    expect(errors.filter((text) => /Content Security Policy|Refused to/i.test(text))).toEqual([]);
  });

  test('header links bring each section into view (V2)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Formation' }).first().click();
    await expect(page.getByRole('heading', { level: 2, name: 'Formation & langues' })).toBeInViewport();
    await page.getByRole('button', { name: 'Contact' }).first().click();
    await expect(page.getByRole('heading', { level: 2, name: 'Contactez-moi' })).toBeInViewport();
  });

  test('mobile menu opens and lists the sections (V2)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await expect(page.getByRole('button', { name: 'Projets' }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Fermer le menu' }).click();
    await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeVisible();
  });

  test('buttons show a pointer cursor (V10)', async ({ page }) => {
    await page.goto('/');
    const cursor = (name: RegExp) =>
      page.getByRole('button', { name }).first().evaluate((element) => getComputedStyle(element).cursor);
    expect(await cursor(/Envoyer le message/)).toBe('pointer');
    expect(await cursor(/^Projets$/)).toBe('pointer');

    await page.setViewportSize({ width: 390, height: 800 });
    expect(await cursor(/Ouvrir le menu/)).toBe('pointer');
  });

  test('the full CV can be opened (V4)', async ({ page, request }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Voir le CV complet/ });
    await expect(link).toHaveAttribute('href', '/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf');

    const pdf = await request.get('/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf');
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    // No CSP on the PDF, so the browser viewer keeps working
    expect(pdf.headers()['content-security-policy']).toBeUndefined();
  });

  test('no email address or phone number is published (V6)', async ({ page }) => {
    await page.goto('/');
    // What a visitor (or a scraper reading the rendered page) can see
    const visibleText = await page.locator('body').innerText();
    expect(visibleText).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    expect(visibleText).not.toMatch(/\+33|0[67](?:[ .]?\d{2}){4}/);
    await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
    await expect(page.getByText(/envoyez-moi simplement un message via le formulaire/)).toBeVisible();
  });

  test('pages are served with the security headers (S2)', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('SEO files and link previews are served (V8)', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Sitemap:');
    expect((await request.get('/sitemap.xml')).status()).toBe(200);

    const image = await request.get('/opengraph-image');
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/png');

    await page.goto('/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/opengraph-image/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});
