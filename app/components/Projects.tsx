import { ProjectsCard } from "./projects/ProjectsCard";
import type { Project } from "@/app/types/api";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projets" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Mes Projets</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez quelques-uns de mes projets récents qui démontrent mes compétences en développement full-stack
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500">Les projets arrivent bientôt.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectsCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
