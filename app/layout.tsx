import type { Metadata } from "next";
import "./assets/css/globals.css";

export const metadata: Metadata = {
  title: "PortFolio",
  description: "Bienvenue sur mon portfolio, découvrez mes projets, compétences et expériences en développement web. Explorez mes réalisations et contactez-moi pour collaborer sur de futurs projets passionnants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
