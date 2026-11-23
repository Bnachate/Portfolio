/** Shapes returned by the /api routes (mirrors server/services/*). */

export interface Tag {
  id: number;
  name: string;
}

export interface TagWithUsage extends Tag {
  experienceCount: number;
  projectCount: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  position: number;
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
  email: string;
}

/** Payload for create/update: tags are sent as ids. */
export type WithTagIds<T extends { tags: Tag[] }> = Omit<T, 'id' | 'tags'> & { tags: number[] };
