import { expect, test } from '@playwright/test';

const CV_URL = '/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf';
const PAGES = [
  { path: '/', title: 'Brahim Nachate — Développeur Full-Stack', nav: 'Accueil' },
  { path: '/projets', title: 'Projets | Brahim Nachate', nav: 'Projets' },
  { path: '/experience', title: 'Expérience | Brahim Nachate', nav: 'Expérience' },
  { path: '/competences', title: 'Compétences | Brahim Nachate', nav: 'Compétences' },
  { path: '/contact', title: 'Contact | Brahim Nachate', nav: 'Contact' },
];

test.describe('Public site (visitor)', () => {
  test('home shows the hero, the page tiles and the seeded content (V1)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

    await page.goto('/');

    await expect(page).toHaveTitle('Brahim Nachate — Développeur Full-Stack');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Développeur Full-Stack');
    await expect(page.getByText('Ouvert aux opportunités, Paris')).toBeVisible();
    const tiles = page.getByRole('region', { name: 'Pages du portfolio' });
    for (const name of ['Projets', 'Expérience', 'Compétences']) {
      await expect(tiles.getByRole('link', { name: new RegExp(name) })).toBeVisible();
    }
    await expect(page.getByRole('heading', { level: 2, name: 'Du marketing digital au développement' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Développeur Full-Stack Vue.js / Java' })).toBeVisible();
    // Styles and scripts load under the production CSP (no violation in the console)
    expect(errors.filter((text) => /Content Security Policy|Refused to/i.test(text))).toEqual([]);
  });

  test('every page has its title and the header marks it as current (V2)', async ({ page }) => {
    for (const { path, title, nav } of PAGES) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      const header = page.getByRole('navigation', { name: 'Navigation principale' });
      await expect(header.getByRole('link', { name: nav, exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(header.locator('[aria-current="page"]')).toHaveCount(1);
    }
  });

  test('the header and the tiles lead to each page (V2)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('region', { name: 'Pages du portfolio' }).getByRole('link', { name: /Expérience/ }).click();
    await expect(page).toHaveURL('/experience');
    await expect(page.getByRole('heading', { level: 1, name: 'Expérience' })).toBeVisible();

    await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Compétences' }).click();
    await expect(page).toHaveURL('/competences');
    await expect(page.getByRole('heading', { level: 2, name: 'Front-end' })).toBeVisible();

    await page.getByRole('link', { name: 'Écrire à Brahim' }).click();
    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('form', { name: 'Formulaire de contact' })).toBeVisible();
  });

  test('the navigation wraps on a phone, without horizontal scroll (V2)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    for (const path of ['/', '/experience', '/contact']) {
      await page.goto(path);
      await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Contact' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('the experience page shows the timeline and the education (V3)', async ({ page }) => {
    await page.goto('/experience');
    await expect(page.getByRole('heading', { level: 2, name: 'Poste actuel : Développeur Full-Stack Vue.js / Java' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Formation' })).toBeVisible();
    await expect(page.getByText('Coding Academy by Epitech Paris')).toBeVisible();
  });

  // Case studies are switched off (CASE_STUDIES_ENABLED = false in app/config/content.ts).
  // When they come back, restore the journey "a project opens its case study" and the 404 checks.
  test('case studies are switched off: no button, every case study URL leads home (V5)', async ({ page }) => {
    await page.goto('/projets');
    await expect(page.getByRole('heading', { level: 1, name: 'Projets' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Lire l'étude de cas/ })).toHaveCount(0);

    for (const path of ['/projets/1', '/projets/999999', '/projets/abc']) {
      await page.goto(path);
      await expect(page).toHaveURL('/');
    }
    const sitemap = await (await page.request.get('/sitemap.xml')).text();
    expect(sitemap).not.toMatch(/\/projets\/\d+/);
  });

  test('links and buttons show a pointer cursor (V10)', async ({ page }) => {
    await page.goto('/contact');
    const cursor = (locator: ReturnType<typeof page.getByRole>) => locator.first().evaluate((element) => getComputedStyle(element).cursor);
    expect(await cursor(page.getByRole('button', { name: /Envoyer le message/ }))).toBe('pointer');
    expect(await cursor(page.getByRole('link', { name: 'Projets', exact: true }))).toBe('pointer');
  });

  test('the full CV can be opened (V4)', async ({ page, request }) => {
    await page.goto('/experience');
    await expect(page.getByRole('link', { name: 'CV en PDF', exact: true })).toHaveAttribute('href', CV_URL);
    await expect(page.getByRole('link', { name: 'Télécharger le CV en PDF' })).toHaveAttribute('href', CV_URL);

    const pdf = await request.get(CV_URL);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    // No CSP on the PDF, so the browser viewer keeps working
    expect(pdf.headers()['content-security-policy']).toBeUndefined();
  });

  test('no email address or phone number is published (V6)', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      // What a visitor (or a scraper reading the rendered page) can see
      const visibleText = await page.locator('body').innerText();
      expect(visibleText).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      expect(visibleText).not.toMatch(/\+33|0[67](?:[ .]?\d{2}){4}/);
      await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
    }
    await expect(page.getByText('Je réponds à chaque message par e-mail.')).toBeVisible();
  });

  test('pages are served with the security headers (S2)', async ({ page }) => {
    for (const path of ['/', '/projets']) {
      const headers = (await page.goto(path))!.headers();
      expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['strict-transport-security']).toContain('max-age=');
      expect(headers['x-powered-by']).toBeUndefined();
    }
  });

  test('SEO files and link previews are served (V8)', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Sitemap:');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const path of ['/projets', '/experience', '/competences', '/contact']) {
      expect(xml).toContain(`${path}</loc>`);
    }

    const image = await request.get('/opengraph-image');
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/png');

    await page.goto('/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/opengraph-image/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await page.goto('/experience');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/experience$/);
  });
});
