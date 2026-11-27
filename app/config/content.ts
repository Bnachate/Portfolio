/**
 * Static public content of the site (texts from the design that are not edited from the admin).
 * Everything edited from the admin (hero, experiences, projects, tags) lives in the database.
 */

export const CV_URL = "/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf";

/** Key facts next to the profile photo on the home page. */
export type HeroFact = { label: string; value: string };

export const HERO_FACTS: HeroFact[] = [
  { label: "Expérience", value: "6 ans" },
  { label: "Spécialité", value: "Vue.js, TypeScript et Node.js" },
  { label: "Basé en", value: "Île-de-France" },
];

/** "Profil" section of the home page. */
export const PROFILE = {
  title: "Du marketing digital au développement",
  paragraphs: [
    "J'ai d'abord travaillé dans le marketing digital : un Master à l'INSEEC, puis la gestion de projets CRM et de marketing automation chez Octelio Conseil, avec une équipe de deux personnes. Ce passé m'aide à relier une interface à son objectif : conversion, engagement, lisibilité des données.",
    "Après le bootcamp d'Epitech Coding Academy, j'ai développé en React et Node.js chez Ipocamp, puis en Vue.js, Nuxt et Java chez Weborama. Je travaille avec les équipes UX/UI, back-end et produit.",
  ],
};

/** Short texts of the home page tiles leading to each page. */
export const TILE_TEXTS = {
  projects: "Ce que j'ai construit de bout en bout, avec le code source et une étude de cas pour chaque projet.",
  experience: "Du marketing automation chez Octelio à Vue.js et Java chez Weborama, en passant par React et Node.js.",
  skills: "Front-end, tests, API, outils de livraison, et le marketing technique dont je viens.",
};

export type EducationItem = { period: string; title: string; school: string };

export const EDUCATION: EducationItem[] = [
  { period: "2020 – 2021", title: "Code & Go, bootcamp de développement", school: "Coding Academy by Epitech Paris" },
  { period: "2014 – 2017", title: "Master Digital Marketing", school: "INSEEC Business School" },
  { period: "2010 – 2014", title: "Licence Sciences Économiques et Gestion", school: "Université Paris-Est Marne-la-Vallée" },
];

export type Language = { name: string; level: string };

export const LANGUAGES: Language[] = [
  { name: "Français", level: "langue maternelle" },
  { name: "Anglais", level: "professionnel (B2)" },
  { name: "Arabe", level: "débutant (A1-A2)" },
];

/**
 * Public case study pages (/projets/[id]) and the links to them. Off while they are being written:
 * the "Lire l'étude de cas" button and the sitemap entries are hidden, and /projets/[id] redirects
 * to the home page. Set to true to bring everything back.
 */
export const CASE_STUDIES_ENABLED = false;
