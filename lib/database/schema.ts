import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  serial,
  integer,
  check,
  smallint,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resilience_current: smallint("resilience_current").notNull().default(0),
    resilience_reserves: smallint("resilience_reserves").notNull().default(1),
    action_points: smallint("action_points").notNull().default(4),
    ward_current: smallint("ward_current").notNull().default(0),
    physical_build: text("physical_build").notNull(),
    baseMoveSpeed: smallint().notNull().default(5),
    name: text().notNull().default("john"),
    isCaster: boolean().notNull().default(false),
  },
  (table) => [
    check(
      "ck_phys_build",
      sql`${table.physical_build} IN ('Lithe', 'Average', 'Hulking')`
    ),
  ]
);

// export const skills = pgTable(
//   "skills",
//   {
//     id: serial("id").primaryKey(),
//     name: text().notNull(),
//     ability: text().notNull(),
//     utility: smallint().notNull().default(0),
//   },
//   (table) => [
//     sql`${table.ability} IN ('Physicality', 'Acuity', 'Sense', 'Presence', 'Vitality')`,
//   ]
// );

export const characterSkills = pgTable("character_skills", {
  id: serial("id").primaryKey(),
  character_id: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  flat_modifier: smallint("flat_modifier").notNull().default(2),
  bonus_dice: text("bonus_dice").notNull().default("1d4"),
  name: text().notNull(),
  ability: text().notNull(),
  utility: smallint().notNull().default(0),
  skill_id: text("skill_id").notNull(),
});

export const wounds = pgTable(
  "wounds",
  {
    id: serial("id").primaryKey(),
    name: text().notNull(),
    tier: text().notNull().default("Trivial"),
    severity: smallint().notNull().default(0),
    character_id: uuid("character_id").references(() => characters.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    "ck_wound_tier",
    sql`${table.tier} IN ('Trivial', 'Light', 'Medium', 'Heavy', 'Deadly')`,
  ]
);

// export const traits = pgTable("traits", {
//   id: serial("id").primaryKey(),
//   name: text().notNull(),
//   description: text().notNull(),
//   character_id: integer("character_id").references(() => characters.id, {
//     onDelete: "cascade",
//   }),
// });

export const characterTraits = pgTable("character_traits", {
  id: serial("id").primaryKey(),
  character_id: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: text().notNull(),
  description: text().notNull(),
  trait_id: text("trait_id").notNull(),
});

// export const equipment = pgTable("equipment", {
//   id: serial("id").primaryKey(),
//   name: text().notNull(),
//   description: text().notNull(),
//   quantity: smallint().notNull().default(0),
//   character_id: integer("character_id").references(() => characters.id, {
//     onDelete: "cascade",
//   }),
// });

export const characterEquipment = pgTable("character_equipment", {
  id: serial("id").primaryKey(),
  character_id: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: text().notNull(),
  description: text().notNull(),
  quantity: smallint().notNull().default(1),
  equipment_id: text("equipment_id").notNull(),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  phy: smallint().notNull().default(0),
  vit: smallint().notNull().default(0),
  sen: smallint().notNull().default(0),
  wil: smallint().notNull().default(0),
  acu: smallint().notNull().default(0),
  pre: smallint().notNull().default(0),
  character_id: uuid("character_id").references(() => characters.id, {
    onDelete: "cascade",
  }),
});

// export const actions = pgTable("actions", {
//   id: serial("id").primaryKey(),
//   character_id: integer("character_id")
//     .notNull()
//     .references(() => characters.id, { onDelete: "cascade" }),
//   name: text().notNull(),
//   cost: smallint().notNull().default(1),
//   note: text(),
//   difficulty: smallint(),
// });

export const characterActions = pgTable("character_actions", {
  id: serial("id").primaryKey(),
  character_id: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: text().notNull(),
  note: text(),
  cost: smallint().notNull().default(1),
  difficulty: smallint(),
  action_id: text("action_id").notNull(),
});

// export const reactions = pgTable("reactions", {
//   id: serial("id").primaryKey(),
//   character_id: integer("character_id")
//     .notNull()
//     .references(() => characters.id, { onDelete: "cascade" }),
//   name: text().notNull(),
//   cost: smallint().notNull().default(1),
//   note: text(),
//   difficulty: smallint(),
// });

export const characterReactions = pgTable("character_reactions", {
  id: serial("id").primaryKey(),
  character_id: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  name: text().notNull(),
  note: text(),
  cost: smallint().notNull().default(1),
  difficulty: smallint(),
  reaction_id: text("reaction_id").notNull(),
});
