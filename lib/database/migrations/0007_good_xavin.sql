ALTER TABLE "character_skills" DROP CONSTRAINT "character_skills_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "character_skills" DROP CONSTRAINT "character_skills_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "name" text DEFAULT 'john' NOT NULL;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;