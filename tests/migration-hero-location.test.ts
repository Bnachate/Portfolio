import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';

// Production already has a hero when migration 0006 runs: replay that order on a bare database
const BEFORE = [
  '0000_init',
  '0001_kind_exodus',
  '0002_magical_stephen_strange',
  '0003_skill_domains',
  '0004_drop_tags_domain',
  '0005_experience_companies',
];

async function run(pg: PGlite, name: string) {
  const sql = readFileSync(path.join(process.cwd(), 'drizzle', `${name}.sql`), 'utf8');
  for (const statement of sql.split('--> statement-breakpoint')) {
    if (statement.trim()) await pg.exec(statement);
  }
}

async function heroWith(availabilityText: string | null) {
  const pg = new PGlite();
  for (const name of BEFORE) await run(pg, name);
  const text = availabilityText === null ? '' : `, availability_text`;
  const value = availabilityText === null ? '' : `, '${availabilityText}'`;
  await pg.exec(`
    INSERT INTO hero (title, subtitle, description, primary_button_text, primary_button_url, secondary_button_text,
      secondary_button_url, github_url, linkedin_url, email${text})
    VALUES ('t', 's', 'd', 'p', '/contact', 's', '/projets', 'https://github.com/x', 'https://linkedin.com/in/x', 'a@b.c'${value});
  `);
  await run(pg, '0006_hero_availability_default');
  const { rows } = await pg.query<{ availability_text: string }>('SELECT availability_text FROM hero');
  await pg.close();
  return rows[0].availability_text;
}

describe('migration 0006 (availability in Île-de-France)', () => {
  it('replaces the old default text "Paris"', async () => {
    // Inserted without a text: the column default of that time, "Ouvert aux opportunités, Paris"
    expect(await heroWith(null)).toBe('Ouvert aux opportunités, Île-de-France');
  });

  it('keeps a text the admin customized', async () => {
    expect(await heroWith('Disponible en mars 2027')).toBe('Disponible en mars 2027');
  });
});
