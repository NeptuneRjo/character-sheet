import "dotenv";
import { defineConfig } from "drizzle-kit";
// dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the .env.local file.");
}

export default defineConfig({
  schema: "./lib/database/schema.ts",
  out: "./lib/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});

// run migrations:
// npx drizzle-kit push:pg
