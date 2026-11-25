import { inArray } from 'drizzle-orm';
import type { Executor } from '../server/db';
import { experiences, experienceTags, hero, skillDomains, tags } from '../server/db/schema';
import { DEFAULT_HERO } from '../server/services/hero';
import { defaultTagDomain } from '../app/config/tag-domains';

/**
 * Portfolio content taken from the CV.
 * Used by `db:seed` (empty database) and `content:sync` (overwrites existing content).
 */
export type ExperienceContent = {
  job: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  stack: string[];
};

const WEBORAMA_STACK = [
  'Vue.js', 'Nuxt.js', 'Pinia', 'Vuex', 'JavaScript', 'TypeScript', 'Element-Plus', 'HTML', 'CSS',
  'Vitest', 'Jest', 'Node.js', 'Express.js', 'Go', 'Java', 'Spring', 'REST API', 'GraphQL',
  'Design System', 'Figma', 'GitLab', 'CI/CD', 'Docker', 'Jira', 'Agile / Scrum',
];

// Listed from the most recent to the oldest; the index becomes the display position
export const EXPERIENCES: ExperienceContent[] = [
  {
    job: 'Développeur Full-Stack Vue.js / Java',
    company: 'Weborama',
    startDate: '2026-01-01',
    endDate: null,
    description: [
      "• Conception et développement des fonctionnalités front et back de l'application (Java / Spring Boot & Vue.js)",
      '• Mise en œuvre et documentation d’API REST maintenables et évolutives',
      "• Participation aux choix techniques et d'architecture avec les développeurs et les tech leads",
      "• Qualité de l'expérience utilisateur : design system, ergonomie et performance",
      '• Tests, revues de code et documentation technique, dans une logique de partage des connaissances',
    ].join('\n'),
    stack: WEBORAMA_STACK,
  },
  {
    job: 'Développeur Vue.js',
    company: 'Weborama',
    startDate: '2023-01-01',
    endDate: '2026-01-01',
    description: [
      '• Conception, développement et maintenance d’applications front-end en Vue.js 3 (Composition API, TypeScript)',
      '• Structuration de composants réutilisables et intégration de maquettes Figma et de design systems',
      '• Collaboration avec les équipes UX/UI, back-end et produit, création des tickets des nouvelles features',
      '• Tests unitaires (Vitest, Jest) et e2e (Playwright), suivi des livraisons et corrections de bugs',
      '• Revues de code, pair-programming et réduction de la dette technique',
    ].join('\n'),
    stack: [...WEBORAMA_STACK, 'Playwright'],
  },
  {
    job: 'Développeur React / Node.js',
    company: 'Ipocamp',
    startDate: '2021-04-01',
    endDate: '2023-01-01',
    description: [
      "• Développement d'applications web complexes en React à partir de maquettes fonctionnelles",
      "• Conception et développement d'API REST en Node.js, consommées côté front-end",
      "• Conception des projets avec l'équipe produit et collaboration sur l'évolution des API",
      '• Participation aux réunions de cadrage métier, rédaction du cahier des charges et validation des livrables',
      "• Amélioration continue de la base de code et de l'expérience utilisateur",
    ].join('\n'),
    stack: ['React', 'Next.js', 'Redux', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express.js', 'REST API', 'MongoDB', 'SQL', 'GitHub', 'Trello'],
  },
  {
    job: 'Développeur CRM & Performance Digital',
    company: 'Octelio Conseil',
    startDate: '2018-08-01',
    endDate: '2020-01-01',
    description: [
      '• Supervision de projets de la conception au déploiement et management d’une équipe de 2 collaborateurs',
      '• Intégration de templates email HTML / CSS responsive et optimisés pour la délivrabilité',
      '• Conception et déploiement de scénarios de marketing automation et de stratégies de ciblage multicanal',
      '• Suivi et optimisation des campagnes média et des bases de données clients',
    ].join('\n'),
    stack: ['Selligent Marketing Cloud', 'Sarbacane', 'JavaScript', 'HTML', 'CSS', 'Sublime Text', 'Adobe Dreamweaver'],
  },
];

/** Inserts the CV experiences (and their missing tags). Call it inside a transaction. */
export async function insertExperiences(tx: Executor) {
  const tagNames = [...new Set(EXPERIENCES.flatMap((e) => e.stack))];
  // The domains are created by the migrations; tags get the default one of their technology
  const domainRows = await tx.select({ id: skillDomains.id, name: skillDomains.name }).from(skillDomains);
  const domainIdByName = new Map(domainRows.map((d) => [d.name, d.id]));
  await tx
    .insert(tags)
    .values(tagNames.map((name) => ({ name, domainId: domainIdByName.get(defaultTagDomain(name) ?? '') ?? null })))
    .onConflictDoNothing();
  const tagRows = await tx
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, tagNames));
  const tagIdByName = new Map(tagRows.map((t) => [t.name, t.id]));

  for (const [position, { stack, ...experience }] of EXPERIENCES.entries()) {
    const [{ id }] = await tx
      .insert(experiences)
      .values({ ...experience, position })
      .returning({ id: experiences.id });
    await tx.insert(experienceTags).values(stack.map((name) => ({ experienceId: id, tagId: tagIdByName.get(name)! })));
  }

  return { experiences: EXPERIENCES.length, tags: tagNames.length };
}

/** Creates or overwrites the hero section with the CV content. */
export async function saveCvHero(tx: Executor, { overwrite }: { overwrite: boolean }) {
  const insert = tx.insert(hero).values({ id: 1, ...DEFAULT_HERO });
  await (overwrite
    ? insert.onConflictDoUpdate({ target: hero.id, set: DEFAULT_HERO })
    : insert.onConflictDoNothing());
}
