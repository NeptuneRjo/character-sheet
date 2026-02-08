export type SheetState = {
  resilienceCurrent: number;
  resilienceMax: number;
  resilienceReserves: number;
  actionPoints: number;
  wardCurrent: number;
  hitClass: number;
  physicalBuild: PhysicalBuild;
  stats: {
    phy: number;
    vit: number;
    sen: number;
    wil: number;
    acu: number;
    pre: number;
  };
  moveSpeed: number;
  wounds: WoundEntry[];
  skills: SkillBonuses;
};

export type Character = {
  resilienceCurrent: number;
  resilienceMax: number;
  resilienceReserves: number;
  actionPoints: number;
  wardCurrent: number;
  hitclass: number;
  characterUID: string;
  movespeed: number;
  name: string;
  physicalBuild: PhysicalBuild;
  stats: Stats;
  wounds: Wound[];
  skills: Skills[];
  traits: Trait[];
};

export type CharacterList = Omit<
  Character,
  "stats" | "wounds" | "skills" | "traits"
>;

export type Skills = {
  name: string;
  ability: string;
  flatModifier: number;
  bonusDice: string;
  utility: number;
};

export type Stats = {
  phy: number;
  vit: number;
  sen: number;
  wil: number;
  acu: number;
  pre: number;
};

export type Trait = {
  name: string;
  description: string;
};

export type PhysicalBuild = string | "Lithe" | "Average" | "Hulking";

export type WoundTier = "Trivial" | "Light" | "Medium" | "Heavy" | "Bleeding";

export type Wound = {
  name: string;
  tier: WoundTier;
  severity: number;
};

export type WoundEntry = {
  id: string;
  name: string;
  tier: WoundTier;
  severity: number;
};

export type SkillBonus = {
  flat: number;
  bonusDice: string;
};

export type CharacterEntry = {
  id: string;
  name: string;
};

export type SkillCatalog = {
  name: string;
  ability: string;
}[];

export type SkillName = SkillCatalog[number]["name"];

export type SkillBonuses = Record<SkillName, SkillBonus>;
