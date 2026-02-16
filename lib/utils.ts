import {
  BuildModifiers,
  DamageThresholds,
  InsWound,
  PhysicalBuilds,
  Stats,
  Wound,
  PhysicalDamageTypes,
  woundDefinitions,
  CurrentEffect,
} from "./types";

export const getBuildModifiers = (build: PhysicalBuilds): BuildModifiers => {
  switch (build) {
    case "Lithe":
      return {
        hitclassBonus: 2,
        movespeedBonus: 1,
        thresholdBonus: 0,
        woundPointBonus: 0,
        carryMultiplier: 0.5,
        grappleDefense: 2,
        grappleOffense: 0,
        force: 0,
      };
    case "Hulking":
      return {
        hitclassBonus: -2,
        movespeedBonus: -1,
        thresholdBonus: 2,
        woundPointBonus: 4,
        carryMultiplier: 1.5,
        grappleDefense: 0.5,
        grappleOffense: 2,
        force: 2,
      };
    default:
      return {
        hitclassBonus: 0,
        movespeedBonus: 0,
        thresholdBonus: 0,
        woundPointBonus: 0,
        carryMultiplier: 1,
        grappleDefense: 1,
        grappleOffense: 1,
        force: 1,
      };
  }
};

export const getTotalSeverity = (wounds: Wound[]) =>
  wounds.reduce((total, wound) => total + wound.severity, 0);

export const getPenalties = (resMax: number, resCurrent: number) => {
  let movementPenalty = 0;
  let statPenalty = 0;

  if (resMax > 0 && resCurrent < resMax / 2) {
    movementPenalty = 1;
  } else if (resMax > 0 && resCurrent < resMax / 4) {
    statPenalty = 1;
  } else if (resMax > 0 && resCurrent < resMax / 8) {
    movementPenalty = 2;
    statPenalty = 2;
  }

  return { movementPenalty, statPenalty };
};

export const getDerivedResilienceMax = (stats: Stats, wounds: Wound[]) => {
  const base = 4 + 2 * stats.vit;
  return Math.max(0, base - getTotalSeverity(wounds));
};

export const getDerivedResilience = (
  resilienceCurrent: number,
  severity: number,
  maxResilience: number
) => {
  return Math.min(resilienceCurrent, severity, maxResilience);
};

export const derivedThreshholdBase = (stats: Stats) => {
  return 8 + 3 * stats.vit + stats.phy;
};

export const createWound = (name: string): InsWound => {
  const definition = woundDefinitions[name as keyof typeof woundDefinitions];
  if (!definition) {
    return {
      name,
      tier: "Trivial",
      severity: 1,
    };
  }
  return {
    name,
    tier: definition.tier,
    severity: definition.severity,
  };
};

export const getDamageThreshold = (
  thresholdBase: number,
  thresholdBonus: number,
  damage: number
): DamageThresholds => {
  const threshold = (mult: number) =>
    Math.floor(thresholdBase * mult) + thresholdBonus;
  const trivialMax = threshold(0.25);
  const lightMax = threshold(0.9);
  const mediumMax = threshold(1.25);
  const heavyMax = threshold(1.25);

  if (damage > heavyMax) return "Deadly";
  else if (damage > mediumMax) return "Heavy";
  else if (damage > lightMax) return "Medium";
  else if (damage > trivialMax) return "Light";
  else return "Trivial";
};

export const getWoundName = (threshold: string, damageType: string) => {
  // const physicalTypes = PhysicalDamageTypes as readonly string[];
  const isLightPhysical =
    threshold === "Light" && PhysicalDamageTypes.includes(damageType);
  const woundName =
    isLightPhysical && Math.random() < 0.5
      ? "Bleeding Gash"
      : threshold === "Light"
        ? "Generic Light Wound"
        : `Generic ${threshold} Wound`;
  return woundName;
};

export const spendAP = (
  cost: number,
  actionPoints: number,
  resilienceCurrent: number
) => {
  let remaining = cost;
  let nextAp = actionPoints;
  let nextResilience = resilienceCurrent;

  while (remaining > 0) {
    if (nextAp > 0) {
      nextAp -= 1;
      remaining -= 1;
      continue;
    } else if (nextAp > -2) {
      nextAp -= 1;
      nextResilience -= 1;
      remaining -= 1;
      continue;
    }
    break;
  }
  return {
    nextAp,
    nextResilience,
  };
};

export const getEffectiveMoveSpeed = (
  moveSpeed: number,
  moveSpeedBonus: number,
  movementPenalty: number
) => {
  return Math.max(0, moveSpeed + moveSpeedBonus - movementPenalty);
};

export const getEffectivePhysicality = (phy: number, statPenalty: number) => {
  return Math.max(0, phy - statPenalty);
};

export const getReactionPhysicalityBonus = (
  physicalBuild: PhysicalBuilds,
  effectivePhysicality: number
) => {
  const multiplier =
    physicalBuild === "Lithe" ? 1 : physicalBuild === "Average" ? 0.5 : 0;
  return Math.floor(effectivePhysicality * multiplier);
};

export const getWardMax = (wil: number) => wil * 4;

export const getDecreasedResilience = (
  resilienceReserves: number,
  resilienceCurrent: number
) => {
  if (resilienceReserves > 0) {
    return Math.max(0, resilienceReserves - 1);
  } else {
    return resilienceCurrent - 1;
  }
};

export const getIncreasedReserves = (
  resilienceReserves: number,
  resilienceMax: number
) => {
  return Math.min(resilienceReserves + 1, Math.floor(resilienceMax / 3));
};

export const getIncreasedResilience = (
  resilienceCurrent: number,
  resilienceMax: number
) => {
  return Math.min(resilienceCurrent + 1, resilienceMax);
};

export const getResilienceReserves = (
  maxResilience: number,
  resilienceReserves: number = 0
) => {
  return Math.min(resilienceReserves, Math.floor(maxResilience / 3));
};

export const getCurrentEffect = (
  maxResilience: number,
  resilienceCurrent: number
): CurrentEffect => {
  // const max = derivedResilienceMax;
  // const current = sheet.resilienceCurrent;
  if (maxResilience <= 0) {
    return {
      label: "Trivial",
      detail: "No negatives",
    };
  }
  const deadlyThreshold = -maxResilience / 3;
  if (resilienceCurrent <= deadlyThreshold) {
    return {
      label: "Deadly",
      detail: "Death occurs",
    };
  }
  if (resilienceCurrent <= 0) {
    return {
      label: "Extreme",
      detail: "Fall unconscious",
    };
  }
  if (resilienceCurrent < maxResilience / 8) {
    return {
      label: "Heavy",
      detail: "Movement -2m, -2 to all main stats, no crits",
    };
  }
  if (resilienceCurrent < maxResilience / 4) {
    return {
      label: "Moderate",
      detail: "Movement -1m, -1 to all main stats",
    };
  }
  if (resilienceCurrent < maxResilience / 2) {
    return {
      label: "Light",
      detail: "Movement -1m",
    };
  }
  return {
    label: "Trivial",
    detail: "No negatives",
  };
};

export const getBarColorClass = (
  maxResilience: number,
  resilienceCurrent: number
) => {
  if (maxResilience <= 0 || resilienceCurrent <= 0) {
    return "bg-red-600";
  }
  if (resilienceCurrent < maxResilience / 4) {
    return "bg-red-600";
  }
  if (resilienceCurrent < maxResilience / 2) {
    return "bg-orange-500";
  }
  return "bg-emerald-600";
};

export const getBarState = (
  maxResilience: number,
  resilienceCurrent: number,
  resilienceReserves: number
) => {
  if (maxResilience <= 0) {
    return {
      currentPercent: 0,
      reservesPercent: 0,
    };
  }
  const maxReserves = maxResilience / 3;
  const currentShown = Math.max(0, Math.min(resilienceCurrent, maxResilience));
  const reservesShown = Math.max(0, Math.min(resilienceReserves, maxReserves));
  return {
    currentPercent: (currentShown / maxResilience) * 100,
    reservesPercent: maxReserves > 0 ? (reservesShown / maxReserves) * 100 : 0,
    maxReserves,
  };
};

export const getHealedWound = (wound: Wound): Wound | null => {
  const woundCopy = { ...wound };

  switch (wound.name) {
    case "Bleeding Gash":
      woundCopy.name = "Generic Light Wound";
      break;
    case "Generic Heavy Wound":
      woundCopy.name = "Generic Medium Wound";
      break;
    case "Generic Medium Wound":
      woundCopy.name = "Generic Light Wound";
      break;
    case "Generic Light Wound":
      woundCopy.name = "Generic Trivial Wound";
      break;
    default:
      return null;
  }

  return woundCopy;
};
