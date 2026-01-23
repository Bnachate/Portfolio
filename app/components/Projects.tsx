import { ProjectsCard } from "./projects/ProjectsCard";

const projects = [
  {
    id: 1,
    title: "Application E-commerce",
    description: "Une plateforme e-commerce complète avec panier d'achat, gestion des produits et système de paiement.",
    image: "https://images.unsplash.com/photo-1750056393300-102f7c4b8bc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBtb2NrdXB8ZW58MXx8fHwxNzY4NTc3OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Stripe"],
    github: "https://github.com",
    demo: "https://example.com",
  },
  {
    id: 2,
    title: "Dashboard Analytique",
    description: "Un tableau de bord interactif pour visualiser et analyser des données en temps réel avec des graphiques dynamiques.",
    image: "https://images.unsplash.com/photo-1733503711060-1df31554390f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlfGVufDF8fHx8MTc2ODU5ODI0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    technologies: ["React", "Chart.js", "Redux", "REST API"],
    github: "https://github.com",
    demo: "https://examples.com",
  },
  {
    id: 3,
    title: "Application Mobile-First",
    description: "Une application responsive optimisée pour mobile avec une expérience utilisateur fluide et moderne.",
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY4NTcxNzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    technologies: ["React", "PWA", "Service Workers", "CSS Grid"],
    github: "https://github.com",
    demo: "https://example.com",
  },
];

export function Projects() {
  return (
    <section id="projets" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Mes Projets</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez quelques-uns de mes projets récents qui démontrent mes compétences en développement front-end
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectsCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
