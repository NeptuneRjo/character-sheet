CREATE TABLE "character_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"note" text,
	"cost" smallint DEFAULT 1 NOT NULL,
	"difficulty" smallint,
	"action_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"quantity" smallint DEFAULT 1 NOT NULL,
	"equipment_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"note" text,
	"cost" smallint DEFAULT 1 NOT NULL,
	"difficulty" smallint,
	"reaction_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"flat_modifier" smallint DEFAULT 2 NOT NULL,
	"bonus_dice" text DEFAULT '1d4' NOT NULL,
	"name" text NOT NULL,
	"ability" text NOT NULL,
	"utility" smallint DEFAULT 0 NOT NULL,
	"skill_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_traits" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"trait_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resilience_current" smallint DEFAULT 0 NOT NULL,
	"resilience_reserves" smallint DEFAULT 1 NOT NULL,
	"action_points" smallint DEFAULT 4 NOT NULL,
	"ward_current" smallint DEFAULT 0 NOT NULL,
	"physical_build" text NOT NULL,
	"baseMoveSpeed" smallint DEFAULT 5 NOT NULL,
	"name" text DEFAULT 'john' NOT NULL,
	"isCaster" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ck_phys_build" CHECK ("characters"."physical_build" IN ('Lithe', 'Average', 'Hulking'))
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"phy" smallint DEFAULT 0 NOT NULL,
	"vit" smallint DEFAULT 0 NOT NULL,
	"sen" smallint DEFAULT 0 NOT NULL,
	"wil" smallint DEFAULT 0 NOT NULL,
	"acu" smallint DEFAULT 0 NOT NULL,
	"pre" smallint DEFAULT 0 NOT NULL,
	"character_id" uuid
);
--> statement-breakpoint
CREATE TABLE "wounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier" text DEFAULT 'Trivial' NOT NULL,
	"severity" smallint DEFAULT 0 NOT NULL,
	"character_id" uuid
);
--> statement-breakpoint
ALTER TABLE "character_actions" ADD CONSTRAINT "character_actions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_equipment" ADD CONSTRAINT "character_equipment_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_reactions" ADD CONSTRAINT "character_reactions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_traits" ADD CONSTRAINT "character_traits_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wounds" ADD CONSTRAINT "wounds_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;