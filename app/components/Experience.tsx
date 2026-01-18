import { Calendar } from "lucide-react";

const experiences = [
  {
    id: 1,
    title: "Développeur Front-End Senior",
    company: "Tech Solutions Inc.",
    period: "2023 - Présent",
    duration: "1 an",
    description: "Développement d'applications SaaS complexes en React et TypeScript. Migration du codebase et optimisation des performances.",
    stack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  },
  {
    id: 2,
    title: "Développeur Front-End",
    company: "Digital Agency",
    period: "2021 - 2023",
    duration: "2 ans",
    description: "Création de sites web et applications responsive pour divers clients. Mise en place de systèmes de design réutilisables.",
    stack: ["React", "JavaScript", "Redux", "Figma"],
  },
  {
    id: 3,
    title: "Développeur Web Junior",
    company: "StartUp Lab",
    period: "2019 - 2021",
    duration: "2 ans",
    description: "Développement de fonctionnalités front-end et apprentissage des meilleures pratiques de développement web moderne.",
    stack: ["React", "JavaScript", "HTML/CSS"],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Expérience</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mon parcours professionnel en développement front-end
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Ligne verticale de la timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-cyan-200"></div>

            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative pl-20 pb-12 last:pb-0">
                {/* Point sur la timeline */}
                <div className="absolute left-6 top-2 w-5 h-5 bg-cyan-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                {/* Carte de l'expérience */}
                <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-900 mb-1">
                        {exp.title}
                      </h3>
                      <p className="text-lg text-cyan-600 mb-2">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200">
                      <Calendar size={16} />
                      <span>{exp.period}</span>
                      <span className="text-gray-400">•</span>
                      <span>{exp.duration}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {exp.stack.map((tech) => (
                      <span
                        key={tech}
                        className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}