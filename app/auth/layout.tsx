import type { Metadata } from "next";

// The login page must not show up in search results
export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
