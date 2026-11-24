import type { MetadataRoute } from "next";
import { getSiteUrl } from "./config/site";

// Served at /sitemap.xml: the pages search engines should index
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
