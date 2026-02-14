ALTER TABLE "characters" ALTER COLUMN "ward_current" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "characters" ALTER COLUMN "ward_current" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "isCaster" boolean DEFAULT false NOT NULL;