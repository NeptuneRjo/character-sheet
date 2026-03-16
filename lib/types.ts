import { Dispatch, SetStateAction } from "react";
import * as schema from "./database/schema";

// Use when typing any object that's directly from the database.
export type Character = typeof schema.characters.$inferSelect;
export type Wound = typeof schema.wounds.$inferSelect;
export type Stats = typeof schema.stats.$inferSelect;

export type CharacterTrait = typeof schema.characterTraits.$inferSelect;
export type Trait = Omit<CharacterTrait, "id" | "character_id">;

export type CharacterSkill = typeof schema.characterSkills.$inferSelect;
export type Skill = Omit<
  CharacterSkill,
  "flat_modifier" | "bonus_dice" | "character_id" | "id"
>;

export type CharacterEquipment = typeof schema.characterEquipment.$inferSelect;
export type Equipment = Omit<
  CharacterEquipment,
  "id" | "character_id" | "quantity"
>;

export type CharacterAction = typeof schema.characterActions.$inferSelect;
export type Action = Omit<CharacterAction, "id" | "character_id">;

export type CharacterReaction = typeof schema.characterReactions.$inferSelect;
export type Reaction = Omit<CharacterReaction, "id" | "character_id">;

export type Sheet = {
  character: Character;
  traits: CharacterTrait[];
  stats: Stats;
  wounds: Wound[];
  equipment: CharacterEquipment[];
  skills: CharacterSkill[];
  actions: CharacterAction[];
  reactions: CharacterReaction[];
};

// Use when typing any object that's not directly from the database.
export type InsCharacter = typeof schema.characters.$inferInsert;
export type InsWound = typeof schema.wounds.$inferInsert;
export type InsStats = typeof schema.stats.$inferInsert;

export type InsCharacterTrait = typeof schema.characterTraits.$inferInsert;
export type InsCharacterEquipment =
  typeof schema.characterEquipment.$inferInsert;
export type InsCharacterSkill = typeof schema.characterSkills.$inferInsert;
export type InsCharacterAction = typeof schema.characterActions.$inferInsert;
export type InsCharacterReaction =
  typeof schema.characterReactions.$inferInsert;

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

export type DamageMaxes = {
  trivialMax: number;
  lightMax: number;
  mediumMax: number;
  heavyMax: number;
};

const physicalDamageTypes = [
  "Piercing",
  "Slashing",
  "Bludgeoning",
  "Cleaving",
] as const;

// Lets us check if a value exists in the damage type list.
export const PhysicalDamageTypes = physicalDamageTypes as readonly string[];
export type PhysicalDamage = (typeof physicalDamageTypes)[number];

const statTypes = ["phy", "vit", "sen", "wil", "acu", "pre"] as const;

// Lets us check if a value exists in the damage type list.
export const StatTypes = statTypes as readonly string[];
export type StatLabels = (typeof statTypes)[number];

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

export const woundTypes = [
  "Generic Trivial Wound",
  "Generic Light Wound",
  "Generic Medium Wound",
  "Generic Heavy Wound",
  "Bleeding Gash",
] as const;

// Lets us check if a value exists in the wound type list.
export const WoundTypes = woundTypes as readonly string[];
export type WoundLabels = (typeof woundTypes)[number];

export type PostWoundBody = {
  threshold: string;
  damageType: string;
  characterUID: string;
};

export type SheetContextType = {
  sheet: Sheet | null;
  isLoading: boolean;
  setSheet: Dispatch<SetStateAction<Sheet | null>>;
  getSheet: (characterUID: string) => Promise<void>;
  handlers: {
    handleSpendAp: (cost: number) => void;
    handleSpendWard: (cost: number) => void;
    handleRefillWard: () => void;
    handleResilienceDecrease: () => void;
    handleResilienceIncrease: (value?: number) => void;
    handleReservesIncrease: (value?: number) => void;
    handleHealWound: (woundId: number) => void;
    handleApplyDamage: (damageAmount: number, damageType: string) => void;
  };
  modifiers: CharacterModifiers;
};

export type GMPanelContextType = {
  characters: Sheet[];
  isLoading: boolean;
  setters: {
    setMoveSpeed: (characterUID: string, newBaseSpeed: number) => void;
    setActionPoints: (characterUID: string, value: number) => void;
    setResilienceReserves: (characterUID: string, value: number) => void;
    setResilienceCurrent: (characterUID: string, value: number) => void;
    setPhysicalBuild: (characterUID: string, value: PhysicalBuilds) => void;
    setStats: (characterUID: string, stat: StatLabels, value: number) => void;
  };
  addSkill: (characterId: string, skill: InsCharacterSkill) => void;
  addWound: (characterUID: string, wound: InsWound) => void;
  getCharacters: () => Promise<void>;
  removeSkill: (characterUID: string, skill: CharacterSkill) => void;
  healWound: (characterUID: string, wound: Wound, healed: Wound | null) => void;
};

const eventTypes = ["INSERT", "UPDATE", "DELETE"] as const;
const tableTypes = [
  "characters",
  "wounds",
  "traits",
  "stats",
  "character_skills",
  "actions",
  "equipment",
  "reactions",
  "skills",
] as const;

/**
 * Defines the structure of the payload being sent via websockets
 */
export type Payload = {
  data: any;
  event: (typeof eventTypes)[number] | "GM-SYNC";
  table: (typeof tableTypes)[number] | "GM-SYNC";
};

export type RequestBody<t> = {
  characterUID: string;
  body: t;
};

export type CharacterContextType = {
  penalties: CurrentPenalties | null;
  maxResilience: number;
  effectiveResilience: number;
  maxReserves: number;
  buildModifiers: BuildModifiers;
  effectivePhysicality: number;
  reactionPhysicalityBonus: number;
  maxWard: number;
  effectiveMoveSpeed: number;
  carryCapacityKg: number;
  hitClass: number;
  baseDamageThreshold: number;
  damageThresholds: DamageMaxes;
  currentEffect: CurrentEffect;
  setCharacter: Dispatch<SetStateAction<Sheet | undefined>>;
};

export type CharacterModifiers = {
  penalties: CurrentPenalties | null;
  maxResilience: number;
  effectiveResilience: number;
  maxReserves: number;
  buildModifiers: BuildModifiers;
  effectivePhysicality: number;
  reactionPhysicalityBonus: number;
  maxWard: number;
  effectiveMoveSpeed: number;
  carryCapacityKg: number;
  hitClass: number;
  baseDamageThreshold: number;
  damageThresholds: DamageMaxes;
  currentEffect: CurrentEffect;
};

const abilities = [
  "Physicality",
  "Acuity",
  "Sense",
  "Presence",
  "Vitality",
] as const;
export type Abilities = (typeof abilities)[number];
