/** Shapes returned by the /api routes (mirrors server/services/*). */

export interface Tag {
  id: number;
  name: string;
}

/** A tag listed on its own (GET /api/tags), with the domain used to group skills. */
export interface TagWithDomain extends Tag {
  /** Id of its skill domain; null = "Autres". */
  domainId: number | null;
}

export interface TagWithUsage extends TagWithDomain {
  experienceCount: number;
  projectCount: number;
}

/** A group of skills on the "Compétences" page (GET /api/skill-domains), in display order. */
export interface SkillDomain {
  id: number;
  name: string;
  position: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  position: number;
  // Case study, null while not written yet
  kind: string | null;
  scope: string | null;
  role: string | null;
  context: string | null;
  achievements: string | null; // one achievement per line
  results: string | null;
  tags: Tag[];
}

export interface Experience {
  id: number;
  job: string;
  company: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD, null = current position
  position: number;
  tags: Tag[];
}

export type ContactStatus = 'new' | 'read' | 'done';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export interface Hero {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  email?: string; // Only returned to the admin
  availabilityEnabled: boolean;
  availabilityText: string;
}

/** Payload for create/update: tags are sent as ids. */
export type WithTagIds<T extends { tags: Tag[] }> = Omit<T, 'id' | 'tags'> & { tags: number[] };
