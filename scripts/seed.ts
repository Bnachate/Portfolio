import { count } from 'drizzle-orm';
import { closeDb, db } from '../server/db';
import { experiences, hero, tags } from '../server/db/schema';
import { DEFAULT_HERO } from '../server/services/hero';
import { createExperience } from '../server/services/experiences';

/**
 * Fills an empty database with the content that used to be hardcoded in the components.
 * Safe to run several times: it does nothing if experiences already exist.
 * Usage: npm run db:seed
 */
const EXPERIENCES = [
  {
    job: 'Développeur Vue.js',
    company: 'Weborama',
    startDate: '2023-01-01',
    endDate: null,
    description:
      "Développement et maintenance d'applications front-end, structuration de code from scratch et mise en place de standards et composants réutilisables. Collaboration avec UX/UI, back-end et produit, suivi des livraisons, tests, corrections et intégration de tests unitaires (Jest, Vitest). Contribution aux décisions d'architecture front-end et réduction de la dette technique.",
    stack: ['Vue.js', 'Nuxt.js', 'Pinia', 'Vuex', 'JavaScript', 'TypeScript', 'Element-Plus', 'HTML', 'CSS', 'Vitest', 'Jest', 'Node.js', 'Express.js', 'Go', 'Java', 'Spring', 'REST API', 'GraphQL', 'Design System', 'Figma', 'GitLab', 'Docker'],
  },
  {
    job: 'Développeur React / Node.js',
    company: 'Ipocamp',
    startDate: '2021-04-01',
    endDate: '2023-01-01',
    description:
      "Conception et développement d'applications web complexes en React, intégration de composants front-end et développement d'API REST en Node.js. Collaboration avec le back-end pour l'évolution des API et amélioration continue de la base de code front et back. Participation aux réunions de cadrage métiers et suivi de l'avancement des projets.",
    stack: ['React', 'Next.js', 'Redux', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express.js', 'REST API', 'MongoDB', 'SQL', 'GitHub', 'Trello'],
  },
  {
    job: 'CRM & Marketing Automation Manager',
    company: 'Octelio Conseil',
    startDate: '2018-08-01',
    endDate: '2020-01-01',
    description:
      "Supervision de projets de la conception au déploiement, management d'une équipe de 2 collaborateurs, intégration de templates email HTML/CSS responsive, suivi et optimisation des campagnes média et bases de données clients. Définition et mise en œuvre de stratégies de ciblage multicanal et scénarios de marketing automation pour améliorer engagement et conversion client.",
    stack: ['Selligent Marketing Cloud', 'Sarbacane', 'JavaScript', 'HTML', 'CSS', 'Sublime Text', 'Adobe Dreamweaver'],
  },
];

async function main() {
  const [{ value: existing }] = await db.select({ value: count() }).from(experiences);
  if (existing > 0) {
    console.log('Database already has experiences, skipping seed');
    return;
  }

  const allTagNames = [...new Set(EXPERIENCES.flatMap((e) => e.stack))];
  await db.insert(tags).values(allTagNames.map((name) => ({ name }))).onConflictDoNothing();
  const tagRows = await db.select({ id: tags.id, name: tags.name }).from(tags);
  const tagIdByName = new Map(tagRows.map((t) => [t.name, t.id]));

  for (const [position, { stack, ...experience }] of EXPERIENCES.entries()) {
    await createExperience({
      ...experience,
      position,
      tags: stack.map((name) => tagIdByName.get(name)!),
    });
  }

  await db.insert(hero).values({ id: 1, ...DEFAULT_HERO }).onConflictDoNothing();

  console.log(`Seeded ${EXPERIENCES.length} experiences, ${allTagNames.length} tags and the hero section`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
