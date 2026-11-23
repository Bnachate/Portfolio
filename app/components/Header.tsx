"use client";
import { Menu, X, LogOut, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from './common/Button';
import Link from "next/link";
import { logout } from '../services/auth.service';
import { useRouter } from "next/navigation";

const SECTIONS = [
  { id: "accueil", label: "Accueil" },
  { id: "projets", label: "Projets" },
  { id: "experience", label: "Expérience" },
  { id: "contact", label: "Contact" },
];

/** `isAuthenticated` is computed on the server from the HttpOnly session cookie. */
export function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            Portfolio
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {SECTIONS.map((section) => (
              <Button key={section.id} variant="ghost" className="w-auto" onClick={() => scrollToSection(section.id)}>
                {section.label}
              </Button>
            ))}
            {isAuthenticated ? (
              <div>
                <Button variant="outline" color="primary" className="mr-4" onClick={() => router.push("/admin")}>
                  Admin
                  <ExternalLink size={20} className="opacity-70" />
                </Button>
                <Button variant="plain" color="secondary" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="border border-cyan-600 text-cyan-600 px-6 py-2 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-gray-700 hover:text-cyan-600 transition-colors text-left"
              >
                {section.label}
              </button>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="border border-cyan-600 text-cyan-600 px-6 py-2 rounded-lg hover:bg-cyan-50 transition-colors text-center"
                >
                  Admin
                </Link>
                <Button variant="plain" color="secondary" className="w-full" onClick={handleLogout}>
                  <LogOut size={20} />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="border border-cyan-600 text-cyan-600 px-6 py-2 rounded-lg hover:bg-cyan-50 transition-colors text-center"
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
