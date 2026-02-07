ALTER TABLE "equipment" DROP CONSTRAINT "equipment_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "stats" DROP CONSTRAINT "stats_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "traits" DROP CONSTRAINT "traits_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "wounds" DROP CONSTRAINT "wounds_character_id_characters_id_fk";
--> statement-breakpoint
ALTER TABLE "character_skills" ALTER COLUMN "skill_id" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "character_skills" ALTER COLUMN "flat_modifier" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_current" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_max" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_max" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_reserves" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_reserves" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "action_points" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "action_points" SET DEFAULT 4;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "hitclass" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "hitclass" SET DEFAULT 8;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "movespeed" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "movespeed" SET DEFAULT 8;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "quantity" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "utility" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "phy" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "vit" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "sen" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "wil" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "acu" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "stats" ALTER COLUMN "pre" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "wounds" ALTER COLUMN "severity" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traits" ADD CONSTRAINT "traits_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wounds" ADD CONSTRAINT "wounds_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;