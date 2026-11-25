import Link from "next/link";
import { CV_URL } from "@/app/config/content";
import { Container } from "./ui";

export type PageKey = "home" | "projets" | "experience" | "competences" | "contact";

const NAV: { key: PageKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Accueil" },
  { key: "projets", href: "/projets", label: "Projets" },
  { key: "experience", href: "/experience", label: "Expérience" },
  { key: "competences", href: "/competences", label: "Compétences" },
  { key: "contact", href: "/contact", label: "Contact" },
];

/**
 * Site header. `tone="dark"` sits on the ink band of the home page, `"light"` on the paper of
 * the other pages. The current page is underlined in mint and marked with aria-current.
 * The navigation wraps on small screens (no hidden menu).
 */
export function SiteHeader({ current, tone = "light" }: { current: PageKey; tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <header className={dark ? "" : "px-[clamp(20px,6vw,80px)]"}>
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-7">
        <Link href="/" className={`flex items-center gap-3 font-display text-lg font-semibold ${dark ? "text-on-ink" : "text-ink"}`}>
          <span
            aria-hidden="true"
            className={`flex h-[38px] w-[38px] items-center justify-center rounded-lg text-base font-bold tracking-[-0.02em] ${dark ? "bg-mint-light text-ink" : "bg-ink text-on-ink"}`}
          >
            BN
          </span>
          <span>Brahim Nachate</span>
        </Link>
        <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-base font-medium">
          {NAV.map((item) => {
            const active = item.key === current;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 px-3.5 py-2.5 transition-colors duration-150 ${
                  active ? (dark ? "border-mint-light" : "border-mint") : "border-transparent"
                } ${dark ? `${active ? "text-on-ink" : "text-mist"} hover:text-mint-light` : "text-ink hover:text-mint"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`ml-2 rounded-lg border-[1.5px] px-4 py-2.5 transition-colors duration-150 ${
              dark ? "border-line text-on-ink hover:border-mint-light hover:text-mint-light" : "border-ink text-ink hover:border-mint hover:text-mint"
            }`}
          >
            CV en PDF
          </a>
        </nav>
      </Container>
    </header>
  );
}
