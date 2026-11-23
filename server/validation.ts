import { z } from 'zod';

// Only http(s) links are accepted, so stored URLs can never be `javascript:` payloads
const httpUrl = z.url({ protocol: /^https?$/, error: 'URL http(s) invalide' }).max(2000);

const optionalHttpUrl = z
  .union([httpUrl, z.literal('')])
  .nullish()
  .transform((value) => value || null);

// In-page anchors (#contact), relative paths (/cv.pdf) or http(s) URLs
const link = z
  .string()
  .trim()
  .max(2000)
  .regex(/^(#|\/(?!\/)|https?:\/\/)/, 'Lien invalide (#ancre, /chemin ou URL http(s))');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format AAAA-MM-JJ');

const tagIds = z.array(z.number().int().positive()).max(50);
const position = z.number().int().min(0).max(10_000);
const shortText = (max: number) =>
  z.string({ error: 'Champ requis' }).trim().min(1, 'Champ requis').max(max, `${max} caractères maximum`);

/* ---------- Auth ---------- */

export const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

/* ---------- Projects ---------- */

const projectFields = {
  title: shortText(200),
  description: shortText(5000),
  projectImageUrl: httpUrl,
  githubUrl: optionalHttpUrl,
  demoUrl: optionalHttpUrl,
  position,
  tags: tagIds,
};

export const createProjectSchema = z.object({
  ...projectFields,
  position: position.optional(),
  tags: tagIds.optional(),
});

export const updateProjectSchema = z.object(projectFields).partial();

/* ---------- Experiences ---------- */

const experienceFields = {
  job: shortText(200),
  company: shortText(200),
  description: shortText(5000),
  startDate: isoDate,
  endDate: isoDate.nullish().transform((value) => value ?? null),
  position,
  tags: tagIds,
};

export const createExperienceSchema = z
  .object({
    ...experienceFields,
    position: position.optional(),
    tags: tagIds.optional(),
  })
  .refine((e) => !e.endDate || e.endDate >= e.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  });

export const updateExperienceSchema = z.object(experienceFields).partial();

/* ---------- Tags ---------- */

// Used to create and to rename a tag
export const tagSchema = z.object({ name: shortText(50) });

/* ---------- Contact messages ---------- */

export const createContactSchema = z.object({
  name: shortText(100),
  email: z.email('Email invalide').max(200),
  subject: shortText(200),
  message: shortText(5000),
  // Honeypot: hidden field that humans leave empty
  website: z.string().optional(),
});

export const updateContactSchema = z.object({
  status: z.enum(['new', 'read', 'done']),
});

/* ---------- Hero ---------- */

export const heroSchema = z.object({
  title: shortText(200),
  subtitle: shortText(300),
  description: shortText(2000),
  primaryButtonText: shortText(50),
  primaryButtonUrl: link,
  secondaryButtonText: shortText(50),
  secondaryButtonUrl: link,
  githubUrl: httpUrl,
  linkedinUrl: httpUrl,
  email: z.email('Email invalide').max(200),
});
