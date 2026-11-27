import type { Metadata } from "next";
import type { ReactNode } from "react";

// The login page must not show up in search results
export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }): ReactNode {
  return children;
}
