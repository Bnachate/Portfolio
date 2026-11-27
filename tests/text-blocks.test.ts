import { describe, expect, it } from 'vitest';
import { toTextBlocks } from '@/app/components/site/data';

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
