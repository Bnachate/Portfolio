import { describe, expect, it } from 'vitest';
import { formatDuration, formatPeriod } from '@/app/components/experience/format';

describe('formatPeriod', () => {
  it('shows start and end months', () => {
    expect(formatPeriod('2021-04-01', '2023-01-01')).toBe('Avr. 2021 - Janv. 2023');
  });

  it('shows "Présent" for an ongoing position', () => {
    expect(formatPeriod('2026-01-01', null)).toBe('Janv. 2026 - Présent');
  });

  it('is not shifted by time zones (first and last day of a month)', () => {
    expect(formatPeriod('2020-12-31', '2021-02-01')).toBe('Déc. 2020 - Févr. 2021');
  });
});

describe('formatDuration', () => {
  it('counts years and months', () => {
    expect(formatDuration('2021-04-01', '2023-01-01')).toBe('1 an 9 mois');
  });

  it('uses plurals for years only ("mois" is invariable)', () => {
    expect(formatDuration('2023-01-01', '2026-01-01')).toBe('3 ans');
    expect(formatDuration('2023-01-01', '2023-03-01')).toBe('2 mois');
  });

  it('never shows less than one month', () => {
    expect(formatDuration('2024-05-10', '2024-05-20')).toBe('1 mois');
  });

  it('counts an ongoing position up to today', () => {
    const now = new Date(2026, 10, 24); // 24 Nov. 2026
    expect(formatDuration('2026-01-01', null, now)).toBe('10 mois');
    expect(formatDuration('2023-01-01', null, now)).toBe('3 ans 10 mois');
  });
});
