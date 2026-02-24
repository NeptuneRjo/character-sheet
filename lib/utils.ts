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
  resilienceMax: number,
  amount: number = 1
) => {
  return Math.min(resilienceCurrent + amount, resilienceMax);
};

export const getResilienceReserves = (
  maxResilience: number,
  resilienceReserves: number = 0
) => {
  return Math.max(resilienceReserves, Math.floor(maxResilience / 3));
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
  resilienceReserves: number,
  maxReserves: number
) => {
  if (maxResilience <= 0) {
    return {
      currentPercent: 0,
      reservesPercent: 0,
    };
  }
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
      woundCopy.severity = 2;
      break;
    case "Generic Heavy Wound":
      woundCopy.name = "Generic Medium Wound";
      woundCopy.severity = 3;
      break;
    case "Generic Medium Wound":
      woundCopy.name = "Generic Light Wound";
      woundCopy.severity = 2;
      break;
    case "Generic Light Wound":
      woundCopy.name = "Generic Trivial Wound";
      woundCopy.severity = 1;
      break;
    default:
      return null;
  }

  return woundCopy;
};
