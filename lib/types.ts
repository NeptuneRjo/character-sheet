import * as schema from "./database/schema";

export type Character = typeof schema.characters.$inferSelect;
export type Wound = typeof schema.wounds.$inferSelect;
export type Trait = typeof schema.traits.$inferSelect;
export type Skill = typeof schema.skills.$inferSelect;
export type Equipment = typeof schema.equipment.$inferSelect;
export type Stats = typeof schema.stats.$inferSelect;
export type CharacterSkill = Skill & typeof schema.characterSkills.$inferSelect;

export type Sheet = Character & {
  traits: Trait[];
  stats: Stats | {};
  wounds: Wound[];
  equipment: Equipment[];
  skills: CharacterSkill[];
};

export type InsCharacter = typeof schema.characters.$inferInsert;
export type InsWound = typeof schema.wounds.$inferInsert;
export type InsTrait = typeof schema.traits.$inferInsert;
export type InsSkill = typeof schema.skills.$inferInsert;
export type InsEquipment = typeof schema.equipment.$inferInsert;
export type InsStats = typeof schema.equipment.$inferInsert;
export type InsCharacterSkill = typeof schema.characterSkills.$inferInsert;

const physicalBuilds = ["Lithe", "Average", "Hulking"] as const;
export type PhysicalBuild = (typeof physicalBuilds)[number];

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

const damageThresholds = [
  "Trivial",
  "Light",
  "Medium",
  "Heavy",
  "Deadly",
] as const;
export type DamageThresholds = (typeof damageThresholds)[number];

const physicalDamageTypes = [
  "Piercing",
  "Slashing",
  "Bludgeoning",
  "Cleaving",
] as const;
export type PhysicalDamageTypes = (typeof physicalDamageTypes)[number];

export type CurrentEffect = {
  label: string;
  detail: string;
};

export type CurrentPenalties = {
  movementPenalty: number;
  statPenalty: number;
};
