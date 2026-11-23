import { ArrowUpRight } from "lucide-react";
import { ExperienceCard } from "./experience/ExperienceCard";
import type { Experience as ExperienceData } from "@/app/types/api";

export function Experience({ experiences }: { experiences: ExperienceData[] }) {
  return (
    <section id="experience" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Expérience</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mon parcours professionnel en développement full-stack
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-cyan-200"></div>

            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
          <div className="flex mt-5">
            <a
              href="/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-4 font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Voir le CV complet
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
