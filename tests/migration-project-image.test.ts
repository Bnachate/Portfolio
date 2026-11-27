import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';

const BEFORE = [
  '0000_init',
  '0001_kind_exodus',
  '0002_magical_stephen_strange',
  '0003_skill_domains',
  '0004_drop_tags_domain',
  '0005_experience_companies',
  '0006_hero_availability_default',
];

async function run(pg: PGlite, name: string) {
  const sql = readFileSync(path.join(process.cwd(), 'drizzle', `${name}.sql`), 'utf8');
  for (const statement of sql.split('--> statement-breakpoint')) {
    if (statement.trim()) await pg.exec(statement);
  }
}

describe('migration 0007 (portfolio project image)', () => {
  it('replaces only the old preview image of the portfolio project', async () => {
    const pg = new PGlite();
    for (const name of BEFORE) await run(pg, name);
    await pg.exec(`
      INSERT INTO projects (title, description, project_image_url, position) VALUES
        ('Portfolio', 'd', 'https://portfolio-seven-delta-irb39wuqmp.vercel.app/opengraph-image', 0),
        ('Autre projet', 'd', 'https://example.com/capture.png', 1);
    `);
    await run(pg, '0007_portfolio_project_image');
    const { rows } = await pg.query<{ title: string; project_image_url: string }>('SELECT title, project_image_url FROM projects ORDER BY position');
    expect(rows).toEqual([
      { title: 'Portfolio', project_image_url: 'https://brahimnachate.fr/projects/portfolio.jpg' },
      { title: 'Autre projet', project_image_url: 'https://example.com/capture.png' },
    ]);
    await pg.close();
  });
});
