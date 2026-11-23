import { eq, getTableColumns } from 'drizzle-orm';
import type { z } from 'zod';
import { db } from '../db';
import { hero } from '../db/schema';
import type { heroSchema } from '../validation';

export type HeroDTO = z.infer<typeof heroSchema>;

// Shown until the hero is saved once from the admin
export const DEFAULT_HERO: HeroDTO = {
  title: 'Développeur Vue.js React',
  subtitle: "Création d'expériences web modernes et performantes",
  description:
    'Passionné par le développement web, je transforme des idées en applications élégantes et intuitives. Spécialisé en React, TypeScript et design moderne.',
  primaryButtonText: 'Me contacter',
  primaryButtonUrl: '#contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '#projets',
  githubUrl: 'https://github.com/Bnachate',
  linkedinUrl: 'https://www.linkedin.com/in/brahim-nachate/',
  email: 'nachate.brahim@gmail.com',
};

// Every column except technical ones
const heroColumns = Object.fromEntries(
  Object.entries(getTableColumns(hero)).filter(([key]) => !['id', 'createdAt', 'updatedAt'].includes(key)),
) as Omit<ReturnType<typeof getTableColumns<typeof hero>>, 'id' | 'createdAt' | 'updatedAt'>;

export async function getHero(): Promise<HeroDTO> {
  const [row] = await db.select(heroColumns).from(hero).where(eq(hero.id, 1)).limit(1);
  return row ?? DEFAULT_HERO;
}

export async function saveHero(data: HeroDTO): Promise<HeroDTO> {
  await db
    .insert(hero)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: hero.id, set: data });
  return getHero();
}
