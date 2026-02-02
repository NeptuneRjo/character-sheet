import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, check } from "drizzle-orm/pg-core";

export const character = pgTable(
  "characters",
  {
    id: serial("id").primaryKey(),
    resilienceMax: integer("resilience_max"),
    resilienceReserves: integer("resilience_reserves"),
    actionPoints: integer("action_points"),
    wardCurrent: integer("ward_current"),
    hitclass: integer(),
    physicalBuild: text("physical_build"),
    movespeed: integer(),
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
    name: text(),
    ability: text(),
    utility: integer(),
  },
  (table) => [
    sql`${table.ability} IN ('Physicality', 'Acuity', 'Sense', 'Presence', 'Vitality')`,
  ]
);

export const wounds = pgTable(
  "wounds",
  {
    id: serial("id").primaryKey(),
    name: text(),
    tier: text(),
    severity: integer(),
    characterId: integer("character_id").references(() => character.id),
  },
  (table) => [
    "ck_wound_tier",
    sql`${table.tier} IN ('Trivial', 'Light', 'Medium', 'Heavy', 'Bleeding')`,
  ]
);

export const traits = pgTable("traits", {
  id: serial("id").primaryKey(),
  name: text(),
  description: text(),
  characterId: integer("character_id").references(() => character.id),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text(),
  description: text(),
  characterId: integer("character_id").references(() => character.id),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  phy: integer(),
  vit: integer(),
  sen: integer(),
  wil: integer(),
  acu: integer(),
  pre: integer(),
  characterId: integer("character_id").references(() => character.id),
});

export const characterSkills = pgTable("character_skills", {
  characterId: integer("character_id")
    .notNull()
    .references(() => character.id),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id),
});
