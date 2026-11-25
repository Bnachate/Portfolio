import { eq, getTableColumns } from 'drizzle-orm';
import type { z } from 'zod';
import { db } from '../db';
import { hero } from '../db/schema';
import type { heroSchema } from '../validation';

export type HeroDTO = z.infer<typeof heroSchema>;

// Shown until the hero is saved once from the admin
export const DEFAULT_HERO: HeroDTO = {
  title: 'Développeur Full-Stack',
  subtitle: "7 ans d'expérience · Vue.js, React, Node.js, Java",
  description:
    "Je conçois et développe des applications web de bout en bout : interfaces en Vue.js et React, API REST en Node.js et Java / Spring Boot. Attaché à la qualité du code, aux tests et à l'expérience utilisateur, j'aime participer aux choix d'architecture et partager mes connaissances avec l'équipe.",
  primaryButtonText: 'Me contacter',
  primaryButtonUrl: '/contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '/projets',
  githubUrl: 'https://github.com/Bnachate',
  linkedinUrl: 'https://www.linkedin.com/in/brahim-nachate/',
  email: 'nachate.brahim@gmail.com',
  availabilityEnabled: true,
  availabilityText: 'Ouvert aux opportunités, Paris',
};

// Every column except technical ones
const heroColumns = Object.fromEntries(
  Object.entries(getTableColumns(hero)).filter(([key]) => !['id', 'createdAt', 'updatedAt'].includes(key)),
) as Omit<ReturnType<typeof getTableColumns<typeof hero>>, 'id' | 'createdAt' | 'updatedAt'>;

export async function getHero(): Promise<HeroDTO> {
  const [row] = await db.select(heroColumns).from(hero).where(eq(hero.id, 1)).limit(1);
  return row ?? DEFAULT_HERO;
}

/** Hero without the contact email: what visitors may see (the email stays admin-only). */
export type PublicHero = Omit<HeroDTO, 'email'>;

export async function getPublicHero(): Promise<PublicHero> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, ...publicHero } = await getHero();
  return publicHero;
}

export async function saveHero(data: HeroDTO): Promise<HeroDTO> {
  await db
    .insert(hero)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: hero.id, set: data });
  return getHero();
}
