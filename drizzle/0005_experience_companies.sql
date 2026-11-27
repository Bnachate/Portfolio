CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sector" text,
	"website_url" text,
	"context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name"),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- Nullable first: existing positions are linked below, then the column becomes NOT NULL
ALTER TABLE "experiences" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- Data: the employers of the CV, with their context (edited later from the admin "Entreprises" tab)
INSERT INTO "companies" ("name", "slug", "sector", "website_url", "context") VALUES
('Weborama', 'weborama', 'AdTech · Data marketing', 'https://www.weborama.com/',
'Weborama est une entreprise française d’AdTech et de data marketing, créée en 1998, spécialisée dans l’exploitation de données et l’intelligence artificielle sémantique pour optimiser la connaissance client, le ciblage publicitaire et les campagnes digitales.

Elle emploie près de 250 personnes dans 30 pays différents et génère des dizaines de millions d’euros de chiffre d’affaires annuel, avec une forte orientation data. Elle possède l’un des plus grands écosystèmes de signaux d’Europe : plus de 200 millions de profils, 10 milliards de signaux et 500 millions d’URL analysés, au service d’annonceurs comme IKEA, Lacoste, Peugeot ou le Crédit Agricole.

Référent Front-End au sein d’une équipe pluridisciplinaire dans un environnement agile incluant :
- un Scrum Master
- un Product Owner
- 2 développeurs Front-End
- 4 développeurs Back-End'),
('Ipocamp', 'ipocamp', 'Legal Tech · Propriété intellectuelle', 'https://ipocamp.io/',
'IPOCAMP est une start-up française de Legal Tech et de protection de la propriété intellectuelle, qui propose une plateforme en ligne permettant de protéger créations, œuvres et innovations via la blockchain.

Le principe : l’empreinte numérique de chaque fichier est calculée sur l’appareil de l’utilisateur, horodatée puis inscrite sur la blockchain Tezos. En quelques secondes, on obtient une preuve d’antériorité datée et vérifiable, recevable devant un juge, sans que le fichier ne soit jamais publié.

En 2021, la plateforme avait déjà enregistré plus de 15 000 dépôts et comptait plus de 10 000 utilisateurs dans plusieurs pays, témoignant de son adoption parmi les créateurs numériques. Aujourd’hui, elle réalise plus de 30 000 dépôts par an pour des créateurs, des start-up, des entreprises et des institutions comme la Ville de Paris ou La Maison des Artistes.'),
('Octelio Conseil', 'octelio-conseil', 'Transformation digitale · eCRM', 'https://octelio.fr/',
'Octelio Conseil est une agence spécialisée dans la transformation digitale, notamment dans l’eCRM et l’automation. Branche digitale du groupe Technology & Strategy, elle intervient de la data et de l’eCRM à l’activation digitale, en passant par le digital analytics et la création de sites et d’applications, depuis ses bureaux de Paris et de Lille.

Forte de plus de 15 ans d’expérience, elle accompagne plus de 85 clients actifs, dont TUI, pour lequel j’ai eu l’opportunité de contribuer.')
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
-- Data: any other employer already used by a position gets a bare company (slug made unique with a hash)
INSERT INTO "companies" ("name", "slug")
SELECT DISTINCT ON (lower("company")) "company",
	trim(both '-' from regexp_replace(lower(translate("company", 'àâäáãéèêëíìîïóòôöõúùûüçñÀÂÄÁÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')), '[^a-z0-9]+', '-', 'g')) || '-' || left(md5(lower("company")), 6)
FROM "experiences"
WHERE lower("company") NOT IN (SELECT lower("name") FROM "companies")
ORDER BY lower("company"), "id"
ON CONFLICT DO NOTHING;--> statement-breakpoint
-- Data: link every position to its employer, by name
UPDATE "experiences" SET "company_id" = "companies"."id" FROM "companies" WHERE lower("companies"."name") = lower("experiences"."company");--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "company_id" SET NOT NULL;
