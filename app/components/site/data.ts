import { OTHER_DOMAIN_LABEL } from "@/app/config/tag-domains";
import type { Experience, Project, SkillDomain, TagWithDomain } from "@/app/types/api";
import type { Tag } from "@/app/types/api";

/** The position shown as "most recent mission": the first ongoing one, else the first listed. */
export function currentExperience(experiences: Experience[]): Experience | null {
  return experiences.find((experience: Experience) => experience.endDate === null) ?? experiences[0] ?? null;
}

/** e.g. "3 postes, 2018 à 2026" */
export function experienceSummary(experiences: Experience[], now: Date = new Date()): string {
  if (experiences.length === 0) return "Bientôt";
  const startYears = experiences.map((e: Experience) => Number(e.startDate.slice(0, 4)));
  const endYears = experiences.map((e: Experience) => (e.endDate ? Number(e.endDate.slice(0, 4)) : now.getFullYear()));
  const count = experiences.length;
  return `${count} poste${count > 1 ? "s" : ""}, ${Math.min(...startYears)} à ${Math.max(...endYears)}`;
}

/** Splits a description written as lines ("• point" or "- point") into bullet points. */
export function toBulletPoints(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line: string) => line.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

export type TextBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

/**
 * Splits a free text written in the admin into blocks: a blank line ends a paragraph, and
 * consecutive lines starting with "- ", "• " or "* " form a bulleted list.
 */
export function toTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];
  const endParagraph = (): void => {
    if (paragraph.length > 0) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const item = line.match(/^[•\-*]\s+(.*)$/);
    if (!line) {
      endParagraph();
    } else if (item) {
      endParagraph();
      const text: string = item[1] ?? "";
      const last: TextBlock | undefined = blocks.at(-1);
      if (last?.type === "list") last.items.push(text);
      else blocks.push({ type: "list", items: [text] });
    } else {
      // A text line right after a list starts a new paragraph
      paragraph.push(line);
    }
  }
  endParagraph();
  return blocks;
}
export type Skill = { name: string; current: boolean };
export type SkillGroup = { title: string; skills: Skill[] };

/**
 * Skills grouped by domain (in the domains' display order, then "Autres") for the "Compétences" page.
 * Only tags used somewhere are shown, alphabetically: `current` = used in an ongoing position,
 * otherwise used in a previous position or a project.
 */
export function buildSkillGroups(domains: SkillDomain[], tags: TagWithDomain[], experiences: Experience[], projects: Project[]): SkillGroup[] {
  const currentIds = new Set(experiences.filter((e: Experience) => e.endDate === null).flatMap((e: Experience) => e.tags.map((t: Tag) => t.id)));
  const usedIds = new Set([...experiences, ...projects].flatMap((item: Experience | Project) => item.tags.map((t: Tag) => t.id)));
  const knownDomainIds = new Set(domains.map((domain: SkillDomain) => domain.id));
  // A tag whose domain is missing from the list falls back to "Autres"
  const groupOf = (tag: TagWithDomain): number | null => (tag.domainId !== null && knownDomainIds.has(tag.domainId) ? tag.domainId : null);

  const groups = [...domains.map((domain: SkillDomain) => ({ id: domain.id as number | null, title: domain.name })), { id: null, title: OTHER_DOMAIN_LABEL }];
  return groups
    .map(({ id, title }: { id: number | null; title: string }) => ({
      title,
      skills: tags
        .filter((tag: TagWithDomain) => usedIds.has(tag.id) && groupOf(tag) === id)
        .sort((a: TagWithDomain, b: TagWithDomain) => a.name.localeCompare(b.name, "fr"))
        .map((tag: TagWithDomain) => ({ name: tag.name, current: currentIds.has(tag.id) })),
    }))
    .filter((group: SkillGroup) => group.skills.length > 0);
}

/** One point of a project description: "Back-end : route handlers…" gives the label "Back-end". */
export type ProjectPoint = { label: string | null; text: string };

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase("fr") + text.slice(1);

/** A short label before " : " becomes the label; a line without one keeps its whole text. */
export function toProjectPoint(item: string): ProjectPoint {
  const match: RegExpMatchArray | null = item.match(/^([^:]{1,32}?)\s*:\s+(.+)$/);
  const label: string | undefined = match?.[1];
  const text: string | undefined = match?.[2];
  return label && text ? { label: label.trim(), text: capitalize(text.trim()) } : { label: null, text: item };
}

/** Project description as the projects page shows it: the intro paragraphs, then the points of its lists. */
export function toProjectDescription(description: string): { intro: string[]; points: ProjectPoint[] } {
  const intro: string[] = [];
  const points: ProjectPoint[] = [];
  for (const block of toTextBlocks(description)) {
    if (block.type === "paragraph") intro.push(block.text);
    else points.push(...block.items.map(toProjectPoint));
  }
  return { intro, points };
}
