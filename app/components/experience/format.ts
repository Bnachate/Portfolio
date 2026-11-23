const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

/** Parses 'YYYY-MM-DD' without timezone surprises. */
function parse(date: string) {
  const [year, month] = date.split('-').map(Number);
  return { year, month: month - 1 };
}

/** e.g. 'Janv. 2023 - Présent' */
export function formatPeriod(startDate: string, endDate: string | null) {
  const start = parse(startDate);
  const startLabel = `${MONTHS[start.month]} ${start.year}`;
  if (!endDate) return `${startLabel} - Présent`;
  const end = parse(endDate);
  return `${startLabel} - ${MONTHS[end.month]} ${end.year}`;
}

/** e.g. '1 an 9 mois', counted in whole months (the end month is not included). */
export function formatDuration(startDate: string, endDate: string | null, now = new Date()) {
  const start = parse(startDate);
  const end = endDate ? parse(endDate) : { year: now.getFullYear(), month: now.getMonth() };
  const totalMonths = Math.max(1, (end.year - start.year) * 12 + (end.month - start.month));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mois`);
  return parts.join(' ');
}
