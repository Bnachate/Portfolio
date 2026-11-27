import type { MetadataRoute } from "next";
import { getContentDates, getProjectDates, type ContentDates } from "@/server/services/sitemap";
import { getSiteUrl } from "./config/site";
import { CASE_STUDIES_ENABLED } from "./config/content";

// Dates come from the database: build the sitemap on each request
export const dynamic = "force-dynamic";

type Content = keyof ContentDates;

/**
 * Each page with the content it shows: its lastmod is the latest change of that content.
 * Texts written in the code (profile, education, languages) and the footer links are left out:
 * they rarely change, and counting every deploy or footer edit would make lastmod meaningless.
 */
const PAGES: { path: string; priority: number; shows: Content[] }[] = [
  // Hero, tile counts (projects, experiences, skill domains) and the current position with its tags
  { path: "", priority: 1, shows: ["hero", "experiences", "projects", "tags", "skillDomains"] },
  { path: "/projets", priority: 0.9, shows: ["projects", "tags"] },
  { path: "/experience", priority: 0.8, shows: ["experiences", "tags"] },
  // Skills are the tags used by experiences and projects, grouped by domain
  { path: "/competences", priority: 0.7, shows: ["tags", "skillDomains", "experiences", "projects"] },
  // Fixed texts and the form only
  { path: "/contact", priority: 0.6, shows: [] },
];

const latest = (dates: (Date | null)[]) =>
  dates.reduce<Date | null>((max, date) => (date && (!max || date > max) ? date : max), null);

// Served at /sitemap.xml: the pages search engines should index
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  // A database hiccup must not break the sitemap: the pages are still listed, without lastmod
  const dates = await getContentDates().catch(() => null);

  const pages: MetadataRoute.Sitemap = PAGES.map(({ path, priority, shows }) => {
    const lastModified = dates ? latest(shows.map((content) => dates[content])) : null;
    return {
      url: `${base}${path}`,
      // No date rather than a made-up one when the page shows no stored content
      ...(lastModified && { lastModified }),
      changeFrequency: "monthly",
      priority,
    };
  });

  // Case study pages are only listed once they are published
  const projects = CASE_STUDIES_ENABLED ? await getProjectDates().catch(() => []) : [];
  return [
    ...pages,
    ...projects.map((project) => ({
      url: `${base}/projets/${project.id}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
