CREATE TABLE "actions" (
	"character_id" integer NOT NULL,
	"name" text NOT NULL,
	"cost" smallint DEFAULT 1 NOT NULL,
	"note" text,
	"difficulty" smallint
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"character_id" integer NOT NULL,
	"name" text NOT NULL,
	"cost" smallint DEFAULT 1 NOT NULL,
	"note" text,
	"difficulty" smallint
);
--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;