import { describe, expect, it } from 'vitest';
import { personJsonLd, toInlineJson } from '@/app/config/structured-data';

const LINE_SEPARATOR = String.fromCharCode(0x2028);

describe('inline JSON-LD', () => {
  const hostile = `https://example.com/</script><script>alert(1)</script><!--&${LINE_SEPARATOR}`;

  it('cannot close or comment out the script tag it lives in', () => {
    const html = toInlineJson({ url: hostile });
    expect(html).not.toMatch(/<\/script/i);
    expect(html).not.toContain('<!--');
    for (const char of ['<', '>', '&', LINE_SEPARATOR]) expect(html).not.toContain(char);
  });

  it('parses back to exactly the same data', () => {
    expect(JSON.parse(toInlineJson({ url: hostile }))).toEqual({ url: hostile });
  });

  it('describes the person with the hero links', () => {
    const data = JSON.parse(personJsonLd({ githubUrl: 'https://github.com/a', linkedinUrl: hostile }));
    expect(data).toMatchObject({ '@type': 'Person', name: 'Brahim Nachate', sameAs: ['https://github.com/a', hostile] });
  });
});
