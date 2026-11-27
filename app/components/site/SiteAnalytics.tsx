"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import type { JSX } from "react";

// The admin panel and the login page are not part of the portfolio audience
const PRIVATE_PATHS = ["/admin", "/auth"];

/** Drops page views of private pages; every other event is sent unchanged. */
export function excludePrivatePages(event: BeforeSendEvent): BeforeSendEvent | null {
  const { pathname } = new URL(event.url);
  return PRIVATE_PATHS.some((path: string) => pathname === path || pathname.startsWith(`${path}/`)) ? null : event;
}

/**
 * Vercel Web Analytics: cookieless page views. The script and its endpoint are served by the site
 * itself (/_vercel/insights/*), so the CSP needs no change. Rendered by the layout on Vercel only.
 */
export function SiteAnalytics(): JSX.Element {
  return <Analytics beforeSend={excludePrivatePages} />;
}
