/**
 * Static site identity, used for SEO: page metadata, link previews (Open Graph),
 * the sitemap, robots.txt and the structured data read by search engines.
 */
export const SITE = {
  name: "Brahim Nachate",
  title: "Brahim Nachate — Développeur Full-Stack",
  jobTitle: "Développeur Full-Stack",
  description:
    "Portfolio de Brahim Nachate, développeur full-stack avec 6 ans d'expérience : Vue.js, React, Node.js et Java / Spring Boot. Découvrez mes projets et mon parcours.",
  skills: ["Vue.js", "React", "TypeScript", "Node.js", "Java / Spring Boot"],
  locale: "fr_FR",
  location: "Paris, France",
};

/**
 * Public URL of the site, needed for absolute links (sitemap, link previews).
 * NEXT_PUBLIC_SITE_URL wins (e.g. a custom domain), then the production domain Vercel exposes.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelDomain) return `https://${vercelDomain}`;
  return "http://localhost:3000";
}
