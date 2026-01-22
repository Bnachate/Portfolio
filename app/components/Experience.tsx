import { Calendar, ArrowUpRight } from "lucide-react";
import { Button } from './common/Button'

const experiences = [
  {
    id: 1,
    title: "Développeur Vue.js",
    company: "Weborama",
    period: "Janv. 2023 - Présent",
    duration: "3 ans",
    description: "Développement et maintenance d’applications front-end, structuration de code from scratch et mise en place de standards et composants réutilisables. Collaboration avec UX/UI, back-end et produit, suivi des livraisons, tests, corrections et intégration de tests unitaires (Jest, Vitest). Contribution aux décisions d’architecture front-end et réduction de la dette technique.",
    stack: ["Vue.js", "Nuxt.js", "Pinia", "Vuex", "JavaScript", "TypeScript", "Element-Plus", "HTML", "CSS", "Vitest", "Jest", "Node.js", "Express.js", "Go", "Java", "Spring", "REST API", "GraphQL", "Design System", "Figma", "GitLab", "Docker"],
  },
  {
    id: 2,
    title: "Développeur React / Node.js",
    company: "Ipocamp",
    period: "Avril 2021 – Janv. 2023",
    duration: "1 an 9 mois",
    description: "Conception et développement d’applications web complexes en React, intégration de composants front-end et développement d’API REST en Node.js. Collaboration avec le back-end pour l’évolution des API et amélioration continue de la base de code front et back. Participation aux réunions de cadrage métiers et suivi de l’avancement des projets.",
    stack: ["React", "Next.js", "Redux", "JavaScript", "HTML", "CSS", "Node.js", "Express.js", "REST API", "MongoDB", "SQL", "GitHub", "Trello"],
  },
  {
    id: 3,
    title: "CRM & Marketing Automation Manager",
    company: "Octelio Conseil",
    period: "Août 2018 – Janv. 2020",
    duration: "1 an 5 mois",
    description: "Supervision de projets de la conception au déploiement, management d’une équipe de 2 collaborateurs, intégration de templates email HTML/CSS responsive, suivi et optimisation des campagnes média et bases de données clients. Définition et mise en œuvre de stratégies de ciblage multicanal et scénarios de marketing automation pour améliorer engagement et conversion client.",
    stack: ["Selligent Marketing Cloud", "Sarbacane", "JavaScript", "HTML", "CSS", "Sublime Text", "Adobe Dreamweaver"],
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

            {experiences.map((exp) => (
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
          <div className="flex mt-5">
          <Button variant="ghost">
            <a href="/CV_Brahim_Nachate_Developpeur_Front-End.pdf" target="_blank">
              View all CV
            </a>
            <ArrowUpRight size={16} />
          </Button>
          </div>
        </div>
      </div>
    </section>
  );
}