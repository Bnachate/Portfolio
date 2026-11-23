import {
  date,
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

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
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

export const experiences = pgTable('experiences', {
  id: serial('id').primaryKey(),
  job: text('job').notNull(),
  company: text('company').notNull(),
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
  ...timestamps,
});

export const projectsRelations = relations(projects, ({ many }) => ({
  projectTags: many(projectTags),
}));

export const experiencesRelations = relations(experiences, ({ many }) => ({
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
