CREATE TABLE "skill_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "domain_id" integer;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_domain_id_skill_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."skill_domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Data: the domains that were hard-coded in app/config/tag-domains.ts, in their display order
INSERT INTO "skill_domains" ("name", "position") VALUES ('Front-end', 0), ('Tests, qualité et design', 1), ('API et données', 2), ('Outils de livraison', 3), ('Marketing technique', 4) ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
-- Data: link each tag to the domain it had as text
UPDATE "tags" SET "domain_id" = "skill_domains"."id" FROM "skill_domains" WHERE "tags"."domain" = "skill_domains"."name";
