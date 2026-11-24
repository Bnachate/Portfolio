import type { MetadataRoute } from "next";
import { getSiteUrl } from "./config/site";

// Served at /robots.txt: what search engine crawlers may explore
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel, the login page and the API have nothing to do in search results
      disallow: ["/admin", "/auth", "/api"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
