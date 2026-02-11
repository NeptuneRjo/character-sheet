import { Dispatch, SetStateAction } from "react";
import * as schema from "./database/schema";

// Use when typing any object that's directly from the database.
export type Character = typeof schema.characters.$inferSelect;
export type Wound = typeof schema.wounds.$inferSelect;
export type Trait = typeof schema.traits.$inferSelect;
export type Skill = typeof schema.skills.$inferSelect;
export type Equipment = typeof schema.equipment.$inferSelect;
export type Stats = typeof schema.stats.$inferSelect;
export type CharacterSkill = Skill & typeof schema.characterSkills.$inferSelect;
export type Action = typeof schema.actions.$inferSelect;
export type Reaction = typeof schema.reactions.$inferSelect;

export type Sheet = Character & {
  traits: Trait[];
  stats: Stats;
  wounds: Wound[];
  equipment: Equipment[];
  skills: CharacterSkill[];
  actions: Action[];
  reactions: Reaction[];
};

// Use when typing any object that's not directly from the database.
export type InsCharacter = typeof schema.characters.$inferInsert;
export type InsWound = typeof schema.wounds.$inferInsert;
export type InsTrait = typeof schema.traits.$inferInsert;
export type InsSkill = typeof schema.skills.$inferInsert;
export type InsEquipment = typeof schema.equipment.$inferInsert;
export type InsStats = typeof schema.equipment.$inferInsert;
export type InsCharacterSkill = typeof schema.characterSkills.$inferInsert;
export type InsAction = typeof schema.actions.$inferInsert;
export type InsReaction = typeof schema.reactions.$inferInsert;

const physicalBuildTypes = ["Lithe", "Average", "Hulking"] as const;

// Lets us check if a value exists in the physical builds list.
export const PhysicalBuildTypes = physicalBuildTypes as readonly string[];
export type PhysicalBuilds = (typeof physicalBuildTypes)[number];

export type BuildModifiers = {
  hitclassBonus: number;
  movespeedBonus: number;
  thresholdBonus: number;
  woundPointBonus: number;
  carryMultiplier: number;
  grappleDefense: number;
  grappleOffense: number;
  force: number;
};

const damageThresholdTypes = [
  "Trivial",
  "Light",
  "Medium",
  "Heavy",
  "Deadly",
] as const;
// Lets us check if a value exists in the damage threshold list.
export const DamageThresholdTypes = damageThresholdTypes as readonly string[];
export type DamageThresholds = (typeof damageThresholdTypes)[number];

const physicalDamageTypes = [
  "Piercing",
  "Slashing",
  "Bludgeoning",
  "Cleaving",
] as const;

// Lets us check if a value exists in the damage type list.
export const PhysicalDamageTypes = physicalDamageTypes as readonly string[];
export type PhysicalDamage = (typeof physicalDamageTypes)[number];

export type CurrentEffect = {
  label: string;
  detail: string;
};

export type CurrentPenalties = {
  movementPenalty: number;
  statPenalty: number;
};

export const woundDefinitions = {
  "Generic Trivial Wound": {
    tier: "Trivial",
    severity: 1,
  },
  "Generic Light Wound": {
    tier: "Light",
    severity: 2,
  },
  "Generic Medium Wound": {
    tier: "Medium",
    severity: 3,
  },
  "Generic Heavy Wound": {
    tier: "Heavy",
    severity: 4,
  },
  "Bleeding Gash": {
    tier: "Bleeding",
    severity: 2,
  },
} as const;

export type PostWoundBody = {
  threshold: string;
  damageType: string;
  characterUID: string;
};

export type SheetContextType = {
  character: Sheet | null;
  isLoading: boolean;
  setCharacter: Dispatch<SetStateAction<Sheet | null>>;
  getCharacter: (characterUID: string) => Promise<void>;
};
