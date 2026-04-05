import { Dispatch, SetStateAction } from "react";
import * as schema from "./database/schema";

// Use when typing any object that's directly from the database.
export type Character = typeof schema.characters.$inferSelect;
export type Wound = typeof schema.wounds.$inferSelect;
export type Stats = typeof schema.stats.$inferSelect;

export type CharacterTraitSchema = typeof schema.characterTraits.$inferSelect;
export type Trait = {
  name: string;
  description: string;
  trait_id: string;
};
export type CharacterTrait = Trait & CharacterTraitSchema;

export type CharacterSkillSchema = typeof schema.characterSkills.$inferSelect;
export type Skill = {
  name: string;
  ability: Abilities;
  utility: number;
  skill_id: string;
};
export type CharacterSkill = Skill & CharacterSkillSchema;

export type CharacterEquipmentSchema =
  typeof schema.characterEquipment.$inferSelect;
export type Equipment = {
  name: string;
  description: string;
  equipment_id: string;
};
export type CharacterEquipment = Equipment & CharacterEquipmentSchema;

export type CharacterActionSchema = typeof schema.characterActions.$inferSelect;
export type Action = {
  name: string;
  cost: number;
  action_id: string;
  note: string | null;
  difficulty: number | null;
};
export type CharacterAction = Action & CharacterActionSchema;

export type CharacterReactionSchema =
  typeof schema.characterReactions.$inferSelect;
export type Reaction = {
  name: string;
  cost: 2;
  reaction_id: string;
  note: string | null;
  difficulty: number | null;
};
export type CharacterReaction = Reaction & CharacterReactionSchema;

export type Sheet = {
  character: Character;
  traits: CharacterTraitSchema[];
  stats: Stats;
  wounds: Wound[];
  equipment: CharacterEquipmentSchema[];
  skills: CharacterSkillSchema[];
  actions: CharacterActionSchema[];
  reactions: CharacterReactionSchema[];
};

export type CombatSheet = Sheet & { turnOrder: number };
/**
 * Defines a non-player added to the combat.
 */
export type Combatant = {
  turnOrder: number;
  name: string;
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
    handleHealWound: (wound: Wound) => void;
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
  addWound: (characterId: string, wound: InsWound) => void;
  getCharacters: () => Promise<void>;
  removeSkill: (characterId: string, skill: CharacterSkill) => void;
  healWound: (characterId: string, wound: Wound, healed: Wound | null) => void;
  addTrait: (characterId: string, trait: InsCharacterTrait) => void;
  removeTrait: (characterId: string, trait: CharacterTrait) => void;
  addEquipment: (characterId: string, equipment: InsCharacterEquipment) => void;
  removeEquipment: (characterId: string, equipment: CharacterEquipment) => void;
  updateEquipment: (characterId: string, equipment: CharacterEquipment) => void;
  addAction: (characterId: string, action: InsCharacterAction) => void;
  removeAction: (characterId: string, action: CharacterAction) => void;
  addReaction: (characterId: string, reaction: InsCharacterReaction) => void;
  removeReaction: (characterId: string, reaction: CharacterReaction) => void;
  saveCharacter: (characterId: string) => void;
  createCharacter: (name: string | undefined) => void;
};

export type RequestBody<t> = {
  characterId: string;
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
