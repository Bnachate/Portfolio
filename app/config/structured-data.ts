import { SITE, getSiteUrl } from "./site";

// U+2028 / U+2029 (line / paragraph separators), built from their code points to keep this file plain ASCII
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Serializes data for an inline `<script type="application/ld+json">`.
 * The HTML parser ends a script at "</script>" whatever the JSON says, so "<", ">", "&" and the
 * line / paragraph separators are escaped as \uXXXX: the JSON stays identical once parsed.
 */
export function toInlineJson(data: unknown) {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll(LINE_SEPARATOR, "\\u2028")
    .replaceAll(PARAGRAPH_SEPARATOR, "\\u2029");
}

/** Structured data (schema.org Person) that search engines use to describe who the site is about. */
export function personJsonLd(hero: { githubUrl: string; linkedinUrl: string }) {
  return toInlineJson({
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: SITE.jobTitle,
    url: getSiteUrl(),
    address: { "@type": "PostalAddress", addressRegion: "Île-de-France", addressCountry: "FR" },
    knowsAbout: SITE.skills,
    // Admin-edited URLs: the escaping above keeps them from breaking out of the script tag
    sameAs: [hero.githubUrl, hero.linkedinUrl],
  });
}
