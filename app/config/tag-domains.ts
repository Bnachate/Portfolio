/** Label for tags without a domain on the "Compétences" page. */
export const OTHER_DOMAIN_LABEL = "Autres";

/**
 * The skill domains themselves live in the `skill_domains` table and are edited from the admin.
 * This is only the seed source: default domain (by name) of known technologies (lowercase name),
 * used when the seed creates tags. drizzle/0003_*.sql created these 5 domains.
 */
const DEFAULT_DOMAINS: Record<string, string[]> = {
  "Front-end": ["vue.js", "nuxt.js", "pinia", "vuex", "typescript", "javascript", "html", "css", "element-plus", "react", "next.js", "redux", "composition api", "tailwind css", "tailwind"],
  "Tests, qualité et design": ["vitest", "jest", "playwright", "e2e", "design system", "figma"],
  "API et données": ["node.js", "express.js", "rest api", "graphql", "go", "java", "spring", "spring boot", "nestjs", "mongodb", "sql", "postgresql", "drizzle orm"],
  "Outils de livraison": ["gitlab", "github", "docker", "ci/cd", "jira", "trello", "agile / scrum", "vercel"],
  "Marketing technique": ["selligent marketing cloud", "sarbacane", "sublime text", "adobe dreamweaver"],
};

/** Name of the default domain of a technology, or null ("Autres"). */
export function defaultTagDomain(name: string): string | null {
  const key = name.trim().toLowerCase();
  const match = Object.entries(DEFAULT_DOMAINS).find(([, names]: [string, string[]]) => names.includes(key));
  return match ? match[0] : null;
}
