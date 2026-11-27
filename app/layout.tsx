import type { Metadata } from "next";
import { Familjen_Grotesk, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./assets/css/globals.css";
import { SITE, getSiteUrl } from "./config/site";
import { SiteAnalytics } from "./components/site/SiteAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE.title,
    // Other pages get "<page> | Brahim Nachate"
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  keywords: ["développeur full-stack", "portfolio", ...SITE.skills, SITE.location],
  alternates: { canonical: "/" },
  // Link previews (LinkedIn, Slack, WhatsApp...). The image comes from app/opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

// Fonts of the design system, self-hosted at build time by next/font (no request to Google, CSP unchanged)
const familjen = Familjen_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-familjen", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-source-serif", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${familjen.variable} ${sourceSerif.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        {/* The analytics script only exists on Vercel: elsewhere (local, CI, E2E) it would answer 404 */}
        {process.env.VERCEL === "1" && <SiteAnalytics />}
      </body>
    </html>
  );
}
