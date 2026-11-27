import Link from "next/link";
import { CV_URL } from "@/app/config/content";
import { LogoMark } from "@/app/components/common/LogoMark";
import { SiteNav, type PageKey } from "./SiteNav";
import { Container, gutter } from "./ui";
import type { JSX } from "react";

export type { PageKey };

/**
 * Site header. `tone="dark"` sits on the ink band of the home page, `"light"` on the paper of
 * the other pages. The current page is marked with aria-current. Below the `lg` breakpoint the
 * navigation folds behind a "Menu" button (see `SiteNav`).
 */
export function SiteHeader({ current, tone = "light" }: { current: PageKey; tone?: "dark" | "light" }): JSX.Element {
  const dark = tone === "dark";
  return (
    <header className={dark ? "" : gutter}>
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-7">
        <Link href="/" className={`flex items-center gap-3 font-display text-lg font-semibold ${dark ? "text-on-ink" : "text-ink"}`}>
          <LogoMark onInk={dark} />
          <span>Brahim Nachate</span>
        </Link>
        <SiteNav current={current} dark={dark} cvUrl={CV_URL} />
      </Container>
    </header>
  );
}
