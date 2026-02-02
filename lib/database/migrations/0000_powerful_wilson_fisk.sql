CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"resilience_max" integer,
	"resilience_reserves" integer,
	"action_points" integer,
	"ward_current" integer,
	"hitclass" integer,
	"physical_build" text,
	"movespeed" integer,
	CONSTRAINT "ck_phys_build" CHECK ("characters"."physical_build" IN ('Lithe', 'Average', 'Hulking'))
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"character_id" integer NOT NULL,
	"skill_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"character_id" integer
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"ability" text,
	"utility" integer
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"phy" integer,
	"vit" integer,
	"sen" integer,
	"wil" integer,
	"acu" integer,
	"pre" integer,
	"character_id" integer
);
--> statement-breakpoint
CREATE TABLE "traits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"character_id" integer
);
--> statement-breakpoint
CREATE TABLE "wounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"tier" text,
	"severity" integer,
	"character_id" integer
);
--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traits" ADD CONSTRAINT "traits_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wounds" ADD CONSTRAINT "wounds_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;