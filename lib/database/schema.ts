import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, check } from "drizzle-orm/pg-core";

export const characters = pgTable(
  "characters",
  {
    id: serial("id").primaryKey(),
    resilienceCurrent: integer("resilience_current").notNull().default(0),
    resilienceMax: integer("resilience_max").notNull().default(1),
    resilienceReserves: integer("resilience_reserves").notNull().default(1),
    actionPoints: integer("action_points").notNull().default(4),
    wardCurrent: integer("ward_current").notNull().default(0),
    hitclass: integer().notNull().default(8),
    physicalBuild: text("physical_build").notNull(),
    movespeed: integer().notNull().default(8),
    characterUID: text("character_uid").notNull().unique(),
  },
  (table) => [
    check(
      "ck_phys_build",
      sql`${table.physicalBuild} IN ('Lithe', 'Average', 'Hulking')`
    ),
  ]
);

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    name: text().notNull(),
    ability: text().notNull(),
    utility: integer().notNull().default(0),
  },
  (table) => [
    sql`${table.ability} IN ('Physicality', 'Acuity', 'Sense', 'Presence', 'Vitality')`,
  ]
);

export const wounds = pgTable(
  "wounds",
  {
    id: serial("id").primaryKey(),
    name: text().notNull(),
    tier: text().notNull().default("Trivial"),
    severity: integer().notNull().default(0),
    characterId: integer("character_id").references(() => characters.id),
  },
  (table) => [
    "ck_wound_tier",
    sql`${table.tier} IN ('Trivial', 'Light', 'Medium', 'Heavy', 'Bleeding')`,
  ]
);

export const traits = pgTable("traits", {
  id: serial("id").primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  characterId: integer("character_id").references(() => characters.id),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  characterId: integer("character_id").references(() => characters.id),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  phy: integer().notNull().default(0),
  vit: integer().notNull().default(0),
  sen: integer().notNull().default(0),
  wil: integer().notNull().default(0),
  acu: integer().notNull().default(0),
  pre: integer().notNull().default(0),
  characterId: integer("character_id").references(() => characters.id),
});

export const characterSkills = pgTable("character_skills", {
  characterId: integer("character_id")
    .notNull()
    .references(() => characters.id),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id),
  flatModifier: integer("flat_modifier").notNull().default(0),
  bonusDice: text("bonus_dice").notNull().default("1d4"),
});
