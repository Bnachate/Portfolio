import { describe, expect, it } from 'vitest';
import { excludePrivatePages } from '@/app/components/site/SiteAnalytics';

const view = (url: string) => ({ type: 'pageview' as const, url });

describe('excludePrivatePages (Vercel Web Analytics)', () => {
  it('keeps the public pages unchanged', () => {
    for (const url of [
      'https://brahimnachate.fr/',
      'https://brahimnachate.fr/experience/weborama',
      'https://brahimnachate.fr/contact?utm_source=linkedin',
      // Only whole path segments count: these are public
      'https://brahimnachate.fr/administration',
      'https://brahimnachate.fr/authors',
    ]) {
      expect(excludePrivatePages(view(url))).toEqual(view(url));
    }
  });

  it('drops the admin panel and the login page', () => {
    for (const url of ['https://brahimnachate.fr/admin', 'https://brahimnachate.fr/admin/', 'https://brahimnachate.fr/auth/login', 'https://brahimnachate.fr/auth']) {
      expect(excludePrivatePages(view(url))).toBeNull();
    }
    expect(excludePrivatePages({ type: 'event', url: 'https://brahimnachate.fr/admin' })).toBeNull();
  });
});
