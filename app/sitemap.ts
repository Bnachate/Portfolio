import type { MetadataRoute } from "next";
import { listProjects } from "@/server/services/projects";
import { getSiteUrl } from "./config/site";

// Project pages come from the database: build the sitemap on each request
export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/projets", priority: 0.9 },
  { path: "/experience", priority: 0.8 },
  { path: "/competences", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
];

// Served at /sitemap.xml: the pages search engines should index
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
  }));

  // A database hiccup must not break the sitemap: the static pages are still listed
  const projects = await listProjects().catch(() => []);
  return [
    ...pages,
    ...projects.map((project) => ({
      url: `${base}/projets/${project.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
