import type { Metadata } from "next";
import "./assets/css/globals.css";
import { SITE, getSiteUrl } from "./config/site";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
