import { OTHER_DOMAIN_LABEL } from "@/app/config/tag-domains";
import type { Experience, Project, SkillDomain, TagWithDomain } from "@/app/types/api";

/** The position shown as "most recent mission": the first ongoing one, else the first listed. */
export function currentExperience(experiences: Experience[]) {
  return experiences.find((experience) => experience.endDate === null) ?? experiences[0] ?? null;
}

/** e.g. "3 postes, 2018 à 2026" */
export function experienceSummary(experiences: Experience[], now = new Date()) {
  if (experiences.length === 0) return "Bientôt";
  const startYears = experiences.map((e) => Number(e.startDate.slice(0, 4)));
  const endYears = experiences.map((e) => (e.endDate ? Number(e.endDate.slice(0, 4)) : now.getFullYear()));
  const count = experiences.length;
  return `${count} poste${count > 1 ? "s" : ""}, ${Math.min(...startYears)} à ${Math.max(...endYears)}`;
}

/** Splits a description written as lines ("• point" or "- point") into bullet points. */
export function toBulletPoints(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
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
  const endParagraph = () => {
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
      const last = blocks.at(-1);
      if (last?.type === "list") last.items.push(item[1]);
      else blocks.push({ type: "list", items: [item[1]] });
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
  const currentIds = new Set(experiences.filter((e) => e.endDate === null).flatMap((e) => e.tags.map((t) => t.id)));
  const usedIds = new Set([...experiences, ...projects].flatMap((item) => item.tags.map((t) => t.id)));
  const knownDomainIds = new Set(domains.map((domain) => domain.id));
  // A tag whose domain is missing from the list falls back to "Autres"
  const groupOf = (tag: TagWithDomain) => (tag.domainId !== null && knownDomainIds.has(tag.domainId) ? tag.domainId : null);

  const groups = [...domains.map((domain) => ({ id: domain.id as number | null, title: domain.name })), { id: null, title: OTHER_DOMAIN_LABEL }];
  return groups
    .map(({ id, title }) => ({
      title,
      skills: tags
        .filter((tag) => usedIds.has(tag.id) && groupOf(tag) === id)
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
        .map((tag) => ({ name: tag.name, current: currentIds.has(tag.id) })),
    }))
    .filter((group) => group.skills.length > 0);
}
