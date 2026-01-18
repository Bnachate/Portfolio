const skills = [
  "React",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "Tailwind CSS",
  "Next.js",
  "Redux",
  "React Query",
  "Git/GitHub",
  "Figma",
  "Responsive Design",
  "REST API",
  "Vite",
  "Motion",
  "UI/UX Design",
];

export function Skills() {
  return (
    <section id="competences" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Compétences</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Technologies et outils que je maîtrise pour créer des applications web performantes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 text-gray-800 px-6 py-3 rounded-xl text-lg shadow-sm hover:shadow-md hover:scale-105 transition-all"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}