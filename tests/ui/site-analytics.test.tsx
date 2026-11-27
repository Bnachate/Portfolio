// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SiteAnalytics } from '@/app/components/site/SiteAnalytics';

afterEach(() => {
  vi.unstubAllEnvs();
  document.head.querySelectorAll('script').forEach((script) => script.remove());
});

describe('SiteAnalytics', () => {
  it('in production, loads the analytics script from the site itself, so the CSP (script-src self) allows it', async () => {
    // Vercel builds run with NODE_ENV=production (previews too); the component reads it at runtime
    vi.stubEnv('NODE_ENV', 'production');
    render(<SiteAnalytics />);
    await waitFor(() => expect(document.querySelector('script[src*="insights/script.js"]')).not.toBeNull());
    const script = document.querySelector<HTMLScriptElement>('script[src*="insights/script.js"]')!;
    // Same origin: a relative URL, no third-party host
    expect(script.getAttribute('src')).toMatch(/^\/_vercel\/insights\/script\.js/);
    expect(script.defer).toBe(true);
  });
});
