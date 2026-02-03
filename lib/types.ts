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
  hitClass: number;
  physicalBuild: PhysicalBuild;
  characterUID: string;
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

export type CharacterList = Omit<Character, "stats" | "wounds" | "skills">[];

export type PhysicalBuild = "Lithe" | "Average" | "Hulking";

export type WoundTier = "Trivial" | "Light" | "Medium" | "Heavy" | "Bleeding";

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
