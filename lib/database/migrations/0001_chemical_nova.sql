ALTER TABLE "characters" ADD COLUMN "character_uid" text NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_character_uid_unique" UNIQUE("character_uid");