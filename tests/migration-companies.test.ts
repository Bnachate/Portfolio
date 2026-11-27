import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';

// Production already has positions when migration 0005 runs: replay that order on a bare database
const MIGRATIONS = ['0000_init', '0001_kind_exodus', '0002_magical_stephen_strange', '0003_skill_domains', '0004_drop_tags_domain'];

async function run(pg: PGlite, name: string) {
  const sql = readFileSync(path.join(process.cwd(), 'drizzle', `${name}.sql`), 'utf8');
  for (const statement of sql.split('--> statement-breakpoint')) {
    if (statement.trim()) await pg.exec(statement);
  }
}

describe('migration 0005 (companies)', () => {
  it('links the existing positions to their employer by name, then requires a company', async () => {
    const pg = new PGlite();
    for (const name of MIGRATIONS) await run(pg, name);
    await pg.exec(`
      INSERT INTO experiences (job, company, description, start_date, end_date, position) VALUES
        ('Développeur Vue.js JAVA', 'Weborama', 'x', '2026-01-01', NULL, 0),
        ('Développeur Vue.js', 'weborama', 'x', '2023-01-09', '2026-01-01', 1),
        ('Développeur React / Node.js', 'Ipocamp', 'x', '2021-04-01', '2023-01-01', 2),
        ('Stagiaire', 'Société Générale', 'x', '2017-01-01', '2017-06-01', 3),
        ('Freelance', 'société générale', 'x', '2018-01-01', '2018-06-01', 4);
    `);

    await run(pg, '0005_experience_companies');

    const linked = await pg.query<{ job: string; name: string; slug: string }>(
      `SELECT e.job, c.name, c.slug FROM experiences e JOIN companies c ON c.id = e.company_id ORDER BY e.position`,
    );
    expect(linked.rows.map((r) => [r.job, r.name])).toEqual([
      ['Développeur Vue.js JAVA', 'Weborama'],
      ['Développeur Vue.js', 'Weborama'],
      ['Développeur React / Node.js', 'Ipocamp'],
      ['Stagiaire', 'Société Générale'],
      ['Freelance', 'Société Générale'],
    ]);
    // A company outside the CV gets a bare employer with an accent-free, unique slug
    const other = linked.rows.find((r) => r.name === 'Société Générale')!;
    expect(other.slug).toMatch(/^societe-generale-[0-9a-f]{6}$/);

    const cv = await pg.query<{ name: string; context: string | null }>(`SELECT name, context FROM companies WHERE slug IN ('weborama', 'ipocamp', 'octelio-conseil') ORDER BY name`);
    expect(cv.rows.map((r) => r.name)).toEqual(['Ipocamp', 'Octelio Conseil', 'Weborama']);
    expect(cv.rows.every((r) => r.context && r.context.length > 100)).toBe(true);

    // From now on, a position without a company is refused
    await expect(pg.exec(`INSERT INTO experiences (job, company, description, start_date, position) VALUES ('X', 'Y', 'x', '2024-01-01', 0)`)).rejects.toThrow(/company_id/);
    await pg.close();
  });
});
