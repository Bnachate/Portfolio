ALTER TABLE "hero" ADD COLUMN "availability_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hero" ADD COLUMN "availability_text" text DEFAULT 'Ouvert aux opportunités, Paris' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "kind" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "achievements" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "results" text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "domain" text;--> statement-breakpoint
-- Data: each section now has its own page, so the hero's in-page anchors become routes
UPDATE "hero" SET "primary_button_url" = '/contact' WHERE "primary_button_url" = '#contact';--> statement-breakpoint
UPDATE "hero" SET "primary_button_url" = '/projets' WHERE "primary_button_url" = '#projets';--> statement-breakpoint
UPDATE "hero" SET "secondary_button_url" = '/contact' WHERE "secondary_button_url" = '#contact';--> statement-breakpoint
UPDATE "hero" SET "secondary_button_url" = '/projets' WHERE "secondary_button_url" = '#projets';--> statement-breakpoint
-- Data: the other old in-page anchors of the one-page site (#accueil, #experience, #formation) also become routes
UPDATE "hero" SET "primary_button_url" = CASE "primary_button_url" WHEN '#accueil' THEN '/' ELSE '/experience' END WHERE "primary_button_url" IN ('#accueil', '#experience', '#formation');--> statement-breakpoint
UPDATE "hero" SET "secondary_button_url" = CASE "secondary_button_url" WHEN '#accueil' THEN '/' ELSE '/experience' END WHERE "secondary_button_url" IN ('#accueil', '#experience', '#formation');--> statement-breakpoint
-- Data: domains of the existing tags (grouping of the "Compétences" page); other tags stay null ("Autres")
UPDATE "tags" SET "domain" = 'Front-end' WHERE "domain" IS NULL AND lower("name") IN ('vue.js', 'nuxt.js', 'pinia', 'vuex', 'typescript', 'javascript', 'html', 'css', 'element-plus', 'react', 'next.js', 'redux', 'composition api', 'tailwind css', 'tailwind');--> statement-breakpoint
UPDATE "tags" SET "domain" = 'Tests, qualité et design' WHERE "domain" IS NULL AND lower("name") IN ('vitest', 'jest', 'playwright', 'e2e', 'design system', 'figma');--> statement-breakpoint
UPDATE "tags" SET "domain" = 'API et données' WHERE "domain" IS NULL AND lower("name") IN ('node.js', 'express.js', 'rest api', 'graphql', 'go', 'java', 'spring', 'spring boot', 'nestjs', 'mongodb', 'sql', 'postgresql', 'drizzle orm');--> statement-breakpoint
UPDATE "tags" SET "domain" = 'Outils de livraison' WHERE "domain" IS NULL AND lower("name") IN ('gitlab', 'github', 'docker', 'ci/cd', 'jira', 'trello', 'agile / scrum', 'vercel');--> statement-breakpoint
UPDATE "tags" SET "domain" = 'Marketing technique' WHERE "domain" IS NULL AND lower("name") IN ('selligent marketing cloud', 'sarbacane', 'sublime text', 'adobe dreamweaver');