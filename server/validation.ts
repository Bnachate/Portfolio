import { z } from 'zod';

// Control characters (null byte, tab, line breaks...): Postgres rejects null bytes in text,
// and browsers silently strip tabs / line breaks from URLs (turning "/<tab>/evil" into "//evil")
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const CONTROL_CHARS_EXCEPT_LINE_BREAKS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const noControlChars = (value: string): boolean => !CONTROL_CHARS.test(value);

// Only http(s) links are accepted, so stored URLs can never be `javascript:` payloads
const httpUrl = z
  .url({ protocol: /^https?$/, error: 'URL http(s) invalide' })
  .max(2000)
  .refine(noControlChars, 'URL http(s) invalide');

const optionalHttpUrl = z
  .union([httpUrl, z.literal('')])
  .nullish()
  .transform((value: string | null | undefined) => value || null);

// In-page anchors (#contact), relative paths (/cv.pdf) or http(s) URLs.
// "/\evil.com" is refused: browsers read a leading "/\" as "//", i.e. another site.
const link = z
  .string()
  .trim()
  .max(2000)
  .refine(noControlChars, 'Lien invalide (#ancre, /chemin ou URL http(s))')
  .regex(/^(#|\/(?![/\\])|https?:\/\/)/, 'Lien invalide (#ancre, /chemin ou URL http(s))');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format AAAA-MM-JJ');

const tagIds = z.array(z.number().int().positive()).max(50);
const position = z.number().int().min(0).max(10_000);
// Required text, trimmed. Line breaks and tabs are allowed (descriptions, messages), other control characters are not.
const shortText = (max: number): z.ZodString =>
  z
    .string({ error: 'Champ requis' })
    .trim()
    .min(1, 'Champ requis')
    .max(max, `${max} caractères maximum`)
    .refine((value: string) => !CONTROL_CHARS_EXCEPT_LINE_BREAKS.test(value), 'Caractères invalides');

// Optional text (case study fields...): trimmed, empty or missing -> null
type OptionalTextSchema = z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
const optionalText = (max: number): OptionalTextSchema =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum`)
    .refine((value: string) => !CONTROL_CHARS_EXCEPT_LINE_BREAKS.test(value), 'Caractères invalides')
    .nullish()
    .transform((value: string | null | undefined) => value || null);

/* ---------- Ordering ---------- */

// Full new order of a list (experiences or projects): every id, once
export const reorderSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .max(500)
    .refine((ids: number[]) => new Set(ids).size === ids.length, 'Identifiants en double'),
});

/* ---------- Auth ---------- */

export const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200).refine(noControlChars, 'Caractères invalides'),
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
  // Case study
  kind: optionalText(100),
  scope: optionalText(100),
  role: optionalText(200),
  context: optionalText(5000),
  achievements: optionalText(5000),
  results: optionalText(5000),
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
  endDate: isoDate.nullish().transform((value: string | null | undefined) => value ?? null),
  position,
  tags: tagIds,
};

export const createExperienceSchema = z
  .object({
    ...experienceFields,
    position: position.optional(),
    tags: tagIds.optional(),
  })
  .refine((e: { startDate: string; endDate: string | null }) => !e.endDate || e.endDate >= e.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  });

export const updateExperienceSchema = z.object(experienceFields).partial();

/* ---------- Tags ---------- */

// Id of a skill domain; null = "Autres". Existence is checked by the service.
const domainId = z.number({ error: 'Domaine inconnu' }).int().positive().nullable();

export const tagSchema = z.object({ name: shortText(50), domainId: domainId.optional().transform((value: number | null | undefined) => value ?? null) });

// Rename and / or change the domain
export const updateTagSchema = z
  .object({ name: shortText(50), domainId })
  .partial()
  .refine((tag: { name?: string | undefined; domainId?: number | null | undefined }) => tag.name !== undefined || tag.domainId !== undefined, 'Rien à modifier');

/* ---------- Companies ---------- */

// Created from the company name of a position; the admin edits them, all fields optional on update
export const updateCompanySchema = z
  .object({
    name: shortText(200),
    sector: optionalText(100),
    websiteUrl: optionalHttpUrl,
    context: optionalText(5000),
  })
  .partial();

/* ---------- Skill domains ---------- */

export const skillDomainSchema = z.object({ name: shortText(60) });

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
  availabilityEnabled: z.boolean({ error: 'Valeur attendue : vrai ou faux' }),
  availabilityText: shortText(120),
});
