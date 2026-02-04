ALTER TABLE "characters" ALTER COLUMN "resilience_max" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_max" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_reserves" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "resilience_reserves" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "action_points" SET DEFAULT 4;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "action_points" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "hitclass" SET DEFAULT 8;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "hitclass" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "physical_build" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "movespeed" SET DEFAULT 8;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "movespeed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "resilience_current" integer DEFAULT 0 NOT NULL;