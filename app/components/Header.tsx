"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from './common/Button'
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
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
            <Button variant="ghost" className="w-auto" onClick={() => scrollToSection("accueil")}>
              Accueil
            </Button>
            <Button variant="ghost" className="w-auto" onClick={() => scrollToSection("projets")}>
              Projets
            </Button>
            {/* <button onClick={() => scrollToSection("competences")} className="text-gray-700 hover:text-cyan-600 transition-colors">
              Compétences
            </button> */}
            <Button variant="ghost" className="w-auto" onClick={() => scrollToSection("experience")}>
              Expérience
            </Button>
            <Button variant="plain" onClick={() => scrollToSection("experience")}>
              <a href="#contact">
                Contact
              </a>
            </Button>
            <Link
              href="/login"
              className="border border-cyan-600 text-cyan-600 px-6 py-2 rounded-lg hover:bg-cyan-50 transition-colors"
            >
              Connexion
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection("accueil")} className="text-gray-700 hover:text-cyan-600 transition-colors text-left">
              Accueil
            </button>
            <button onClick={() => scrollToSection("projets")} className="text-gray-700 hover:text-cyan-600 transition-colors text-left">
              Projets
            </button>
            <button onClick={() => scrollToSection("competences")} className="text-gray-700 hover:text-cyan-600 transition-colors text-left">
              Compétences
            </button>
            <button onClick={() => scrollToSection("experience")} className="text-gray-700 hover:text-cyan-600 transition-colors text-left">
              Expérience
            </button>
            <a
              href="#contact"
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-center"
            >
              Contact
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
