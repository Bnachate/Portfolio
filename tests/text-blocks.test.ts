import { describe, expect, it } from 'vitest';
import { toProjectDescription, toProjectPoint, toTextBlocks } from '@/app/components/site/data';

describe('toProjectPoint', () => {
  it('splits a short label before " : " and capitalizes the text', () => {
    expect(toProjectPoint('Back-end : route handlers Next.js, PostgreSQL')).toEqual({ label: 'Back-end', text: 'Route handlers Next.js, PostgreSQL' });
    expect(toProjectPoint('Qualité: 312 tests')).toEqual({ label: 'Qualité', text: '312 tests' });
  });

  it('keeps the whole line without a short label, or when the colon is not followed by a space', () => {
    expect(toProjectPoint('Déploiement continu sur Vercel')).toEqual({ label: null, text: 'Déploiement continu sur Vercel' });
    expect(toProjectPoint('Une phrase bien trop longue pour être un libellé de ligne : suite')).toEqual({
      label: null,
      text: 'Une phrase bien trop longue pour être un libellé de ligne : suite',
    });
    expect(toProjectPoint('Lien https://example.com')).toEqual({ label: null, text: 'Lien https://example.com' });
  });
});

describe('toProjectDescription', () => {
  it('returns the intro paragraphs and the points of every list', () => {
    expect(toProjectDescription('Intro.\n\nSuite.\n- A : un\n- B : deux')).toEqual({
      intro: ['Intro.', 'Suite.'],
      points: [
        { label: 'A', text: 'Un' },
        { label: 'B', text: 'Deux' },
      ],
    });
  });
});

describe('toTextBlocks', () => {
  it('splits paragraphs on blank lines and turns "- " lines into a list', () => {
    const text = [
      'Weborama est une entreprise française',
      'd’AdTech et de data marketing.',
      '',
      'Référent Front-End dans une équipe incluant :',
      '- un Scrum Master',
      '• un Product Owner',
      '* 2 développeurs Front-End',
      'Une phrase après la liste.',
    ].join('\r\n');
    expect(toTextBlocks(text)).toEqual([
      { type: 'paragraph', text: 'Weborama est une entreprise française d’AdTech et de data marketing.' },
      { type: 'paragraph', text: 'Référent Front-End dans une équipe incluant :' },
      { type: 'list', items: ['un Scrum Master', 'un Product Owner', '2 développeurs Front-End'] },
      { type: 'paragraph', text: 'Une phrase après la liste.' },
    ]);
  });

  it('keeps a dash inside a sentence or without a space, and ignores extra blank lines', () => {
    expect(toTextBlocks('\n\nFront-End et Back-End\n-pas une puce\n\n\n')).toEqual([
      { type: 'paragraph', text: 'Front-End et Back-End -pas une puce' },
    ]);
    expect(toTextBlocks('')).toEqual([]);
  });
});
