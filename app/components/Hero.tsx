import { Github, Linkedin, Mail } from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";
import type { PublicHero } from "@/server/services/hero";

const linkButton =
  "inline-flex items-center justify-center h-12 px-5 rounded-xl border-2 border-cyan-700 text-cyan-700 font-medium hover:bg-cyan-50 transition-colors";

export function Hero({ hero }: { hero: PublicHero }) {
  return (
    <section id="accueil" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-linear-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl mb-4 text-gray-900">{hero.title}</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">{hero.subtitle}</p>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl whitespace-pre-line">{hero.description}</p>
            <div className="flex gap-4 justify-center md:justify-start mb-8">
              <a href={hero.primaryButtonUrl} className={linkButton}>
                {hero.primaryButtonText}
              </a>
              <a href={hero.secondaryButtonUrl} className={linkButton}>
                {hero.secondaryButtonText}
              </a>
            </div>
            <div className="flex gap-6 justify-center md:justify-start">
              <a href={hero.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-700 hover:text-cyan-700 transition-colors">
                <Github size={28} />
              </a>
              <a href={hero.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-700 hover:text-cyan-700 transition-colors">
                <Linkedin size={28} />
              </a>
              {/* Points to the contact form: the email address is never published */}
              <a href="#contact" aria-label="Me contacter via le formulaire" className="text-gray-700 hover:text-cyan-700 transition-colors">
                <Mail size={28} />
              </a>
            </div>
          </div>
          <div className="flex-1 max-w-md relative h-96 w-full">
            <ImageWithFallback
              src="/my_photo.jpeg"
              alt="Photo de profil"
              className="rounded-2xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
