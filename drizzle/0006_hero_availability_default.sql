ALTER TABLE "hero" ALTER COLUMN "availability_text" SET DEFAULT 'Ouvert aux opportunités, Île-de-France';--> statement-breakpoint
-- Data: the hero still showing the old default text gets the new one (a customized text is left as is)
UPDATE "hero" SET "availability_text" = 'Ouvert aux opportunités, Île-de-France' WHERE "availability_text" = 'Ouvert aux opportunités, Paris';
