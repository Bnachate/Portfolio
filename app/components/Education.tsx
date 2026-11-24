import { GraduationCap, Languages } from "lucide-react";

// Static content from the CV: it rarely changes, so it does not need to live in the database
const EDUCATION = [
  {
    period: "2020 – 2021",
    title: "Code & Go",
    school: "Coding Academy by Epitech Paris",
    details: "Formation intensive de 5 mois (600 heures) aux principaux langages de programmation et au développement web",
  },
  {
    period: "2014 – 2017",
    title: "Master Digital Marketing",
    school: "INSEEC Business School",
  },
  {
    period: "2010 – 2014",
    title: "Licence Sciences Économiques et Gestion",
    school: "Université Paris-Est Marne-la-Vallée",
  },
];

const LANGUAGES = [
  { name: "Français", level: "Langue maternelle", percent: 100 },
  { name: "Anglais", level: "Professionnel (B2)", percent: 75 },
  { name: "Arabe", level: "Débutant (A1-A2)", percent: 25 },
];

export function Education() {
  return (
    <section id="formation" className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Formation & langues</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un parcours entre marketing digital et développement web
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-3">
          {/* Education */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="flex items-center gap-2 text-xl text-gray-900 mb-2">
              <GraduationCap className="text-cyan-700" size={24} />
              Formation
            </h3>
            {EDUCATION.map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-lg text-gray-900">{item.title}</h4>
                    <p className="text-cyan-700">{item.school}</p>
                  </div>
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {item.period}
                  </span>
                </div>
                {item.details && <p className="text-gray-600 mt-3 leading-relaxed">{item.details}</p>}
              </div>
            ))}
          </div>

          {/* Languages */}
          <div>
            <h3 className="flex items-center gap-2 text-xl text-gray-900 mb-6">
              <Languages className="text-cyan-700" size={24} />
              Langues
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-5">
              {LANGUAGES.map((language) => (
                <div key={language.name}>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="text-gray-900">{language.name}</span>
                    <span className="text-sm text-gray-500">{language.level}</span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-gray-200"
                    role="meter"
                    aria-label={`${language.name} : ${language.level}`}
                    aria-valuenow={language.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-2 rounded-full bg-cyan-700" style={{ width: `${language.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
