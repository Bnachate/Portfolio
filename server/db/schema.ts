import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
});

// Groups of skills on the "Compétences" page, in display order
export const skillDomains = pgTable('skill_domains', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  position: integer('position').notNull().default(0),
  ...timestamps,
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  // Group on the "Compétences" page; null = "Autres". Deleting a domain moves its tags to "Autres".
  domainId: integer('domain_id').references(() => skillDomains.id, { onDelete: 'set null' }),
  ...timestamps,
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  projectImageUrl: text('project_image_url').notNull(),
  githubUrl: text('github_url'),
  demoUrl: text('demo_url'),
  position: integer('position').notNull().default(0),
  // Case study (optional): shown on /projets/[id]; placeholders are displayed while empty
  kind: text('kind'), // e.g. "Projet personnel"
  scope: text('scope'), // e.g. "Full-stack"
  role: text('role'), // e.g. "Conception et développement"
  context: text('context'),
  achievements: text('achievements'), // one achievement per line
  results: text('results'),
  ...timestamps,
});

export const projectTags = pgTable(
  'project_tags',
  {
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.tagId] })],
);

// Employers: one card on the "Expérience" page, and a page with their context and the positions held there
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  // URL segment of /experience/[slug], derived from the name
  slug: text('slug').notNull().unique(),
  // Short line on the card, e.g. "AdTech · Data marketing"
  sector: text('sector'),
  websiteUrl: text('website_url'),
  // Paragraphs separated by a blank line; lines starting with "- " become a bulleted list
  context: text('context'),
  ...timestamps,
});

export const experiences = pgTable('experiences', {
  id: serial('id').primaryKey(),
  job: text('job').notNull(),
  // Deprecated copy of the company name, still written for the deploy that adds companyId; drop it in a later migration
  company: text('company').notNull(),
  // An employer cannot be deleted while a position points to it
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'restrict' }),
  description: text('description').notNull(),
  // Stored as DATE, exchanged as 'YYYY-MM-DD' strings
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }),
  position: integer('position').notNull().default(0),
  ...timestamps,
});

export const experienceTags = pgTable(
  'experience_tags',
  {
    experienceId: integer('experience_id').notNull().references(() => experiences.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.experienceId, t.tagId] })],
);

export const CONTACT_STATUSES = ['new', 'read', 'done'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status', { enum: CONTACT_STATUSES }).notNull().default('new'),
  ...timestamps,
});

// One row per rate-limited action (e.g. a contact form submission).
// `key` is "<action>:<hashed client IP>": raw IP addresses are never stored.
export const rateLimitHits = pgTable(
  'rate_limit_hits',
  {
    id: serial('id').primaryKey(),
    key: text('key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('rate_limit_hits_key_created_at_idx').on(table.key, table.createdAt)],
);

// Single-row table holding the editable hero section (id is always 1)
export const hero = pgTable('hero', {
  id: integer('id').primaryKey().default(1),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  primaryButtonText: text('primary_button_text').notNull(),
  primaryButtonUrl: text('primary_button_url').notNull(),
  secondaryButtonText: text('secondary_button_text').notNull(),
  secondaryButtonUrl: text('secondary_button_url').notNull(),
  githubUrl: text('github_url').notNull(),
  linkedinUrl: text('linkedin_url').notNull(),
  email: text('email').notNull(),
  // Availability indicator above the hero title (amber dot + short sentence)
  availabilityEnabled: boolean('availability_enabled').notNull().default(true),
  availabilityText: text('availability_text').notNull().default('Ouvert aux opportunités, Paris'),
  ...timestamps,
});

export const projectsRelations = relations(projects, ({ many }) => ({
  projectTags: many(projectTags),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  experiences: many(experiences),
}));

export const experiencesRelations = relations(experiences, ({ one, many }) => ({
  companyRef: one(companies, { fields: [experiences.companyId], references: [companies.id] }),
  experienceTags: many(experienceTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  projectTags: many(projectTags),
  experienceTags: many(experienceTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, { fields: [projectTags.projectId], references: [projects.id] }),
  tag: one(tags, { fields: [projectTags.tagId], references: [tags.id] }),
}));

export const experienceTagsRelations = relations(experienceTags, ({ one }) => ({
  experience: one(experiences, { fields: [experienceTags.experienceId], references: [experiences.id] }),
  tag: one(tags, { fields: [experienceTags.tagId], references: [tags.id] }),
}));
