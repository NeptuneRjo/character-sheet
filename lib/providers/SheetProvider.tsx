"use client";

import { createContext, ReactNode, useMemo, useState } from "react";
import {
  DamageThresholds,
  PostWoundBody,
  Sheet,
  SheetContextType,
} from "../types";
import {
  getHealedWound,
  getIncreasedReserves,
  getIncreasedResilience,
  spendAP,
} from "../utils";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before SheetContext was initialized`);
};

export const SheetContext = createContext<SheetContextType>({
  sheet: null,
  isLoading: true,
  setSheet: () => initializationError("setSheet"),
  getSheet: async () => initializationError("getsheet"),
  handlers: {
    handleSpendAp: () => initializationError("handleSpendAp"),
    handleSpendWard: () => initializationError("handleSpendWard"),
    handleRefillWard: () => initializationError("handleRefillWard"),
    handleResilienceDecrease: () =>
      initializationError("handleResilienceDecrease"),
    handleResilienceIncrease: (value?: number) =>
      initializationError("handleResilienceIncrease"),
    handleReservesIncrease: (value?: number) =>
      initializationError("handleReservesIncrease"),
    handleHealWound: (woundId: number) =>
      initializationError("handleHealWound"),
    handleApplyDamage: (damageAmount: number, damageType: string) =>
      initializationError("handleApplyDamage"),
  },
  modifiers: {
    maxResilience: 10,
    effectiveResilience: 10,
    maxReserves: 0,
    buildModifiers: {
      hitclassBonus: 0,
      movespeedBonus: 0,
      thresholdBonus: 0,
      woundPointBonus: 0,
      carryMultiplier: 0,
      grappleDefense: 0,
      grappleOffense: 0,
      force: 0,
    },
    penalties: {
      movementPenalty: 0,
      statPenalty: 0,
    },
    hitClass: 8,
    effectivePhysicality: 0,
    reactionPhysicalityBonus: 0,
    maxWard: 0,
    effectiveMoveSpeed: 0,
    carryCapacityKg: 0,
    baseDamageThreshold: 11,
    damageThresholds: {
      trivialMax: 2,
      lightMax: 4,
      mediumMax: 7,
      heavyMax: 10,
    },
    currentEffect: {
      label: "Trivial",
      detail: "No negatives",
    },
  },
});

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const maxResilience = useMemo(() => {
    if (sheet) {
      const base = 4 + 2 * sheet.stats.vit;
      return Math.max(0, base);
    }
    return 0;
  }, [sheet?.stats, sheet?.wounds]);

  const effectiveResilience = useMemo(() => {
    if (sheet) {
      const severity = Array.from(sheet.wounds).reduce(
        (total, wound) => total + wound.severity,
        0
      );

      const base = 4 + 2 * sheet.stats.vit;
      return Math.max(0, base - severity);
    }
    return 0;
  }, [sheet?.stats, sheet?.wounds]);

  const maxReserves = useMemo(() => {
    if (maxResilience && sheet) {
      return Math.max(
        sheet.character.resilienceReserves,
        Math.floor(maxResilience / 3)
      );
    }
    return 0;
  }, [maxResilience, sheet?.character.resilienceReserves]);

  const buildModifiers = useMemo(() => {
    if (sheet) {
      switch (sheet.character.physicalBuild) {
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
    }
    return {
      hitclassBonus: 0,
      movespeedBonus: 0,
      thresholdBonus: 0,
      woundPointBonus: 0,
      carryMultiplier: 0,
      grappleDefense: 0,
      grappleOffense: 0,
      force: 0,
    };
  }, [sheet?.character.physicalBuild]);

  const penalties = useMemo(() => {
    if (sheet && maxResilience) {
      const { resilienceCurrent } = sheet.character;
      let movementPenalty = 0;
      let statPenalty = 0;

      if (maxResilience > 0 && resilienceCurrent < maxResilience / 2) {
        movementPenalty = 1;
      }
      if (maxResilience > 0 && resilienceCurrent < maxResilience / 4) {
        statPenalty = 1;
      }
      if (maxResilience > 0 && resilienceCurrent < maxResilience / 8) {
        movementPenalty = 2;
        statPenalty = 2;
      }

      return { movementPenalty, statPenalty };
    }
    return {
      movementPenalty: 0,
      statPenalty: 0,
    };
  }, [maxResilience, sheet?.character.resilienceCurrent]);

  const effectivePhysicality = useMemo(() => {
    if (sheet && penalties) {
      return Math.max(0, sheet.stats.phy - penalties.statPenalty);
    }
    return 0;
  }, [sheet?.stats, penalties]);

  const reactionPhysicalityBonus = useMemo(() => {
    if (sheet && effectivePhysicality) {
      const { physicalBuild } = sheet.character;
      const multiplier =
        physicalBuild === "Lithe" ? 1 : physicalBuild === "Average" ? 0.5 : 0;

      return Math.floor(effectivePhysicality * multiplier);
    }
    return 0;
  }, [sheet?.character.physicalBuild, effectivePhysicality]);

  const maxWard = useMemo(() => {
    if (sheet) {
      return sheet.stats.wil * 4;
    }
    return 0;
  }, [sheet?.stats]);

  const effectiveMoveSpeed = useMemo(() => {
    if (buildModifiers && penalties) {
      const { movespeedBonus } = buildModifiers;
      const { movementPenalty } = penalties;

      return Math.max(0, 5 + movespeedBonus - movementPenalty);
    }
    return 0;
  }, [buildModifiers, penalties]);

  const carryCapacityKg = useMemo(() => {
    if (sheet && buildModifiers) {
      const base = 20 + sheet.stats.phy * 10;
      return Math.max(0, Math.round(base * buildModifiers.carryMultiplier));
    }
    return 0;
  }, [sheet?.stats, buildModifiers]);

  const hitClass = useMemo(() => {
    if (buildModifiers) {
      return 8 + buildModifiers.hitclassBonus;
    }
    return 8;
  }, [buildModifiers]);

  const baseDamageThreshold = useMemo(() => {
    if (sheet) {
      return 8 + 3 * sheet.stats.vit + sheet.stats.phy;
    }
    return 11;
  }, [sheet?.stats]);

  const damageThresholds = useMemo(() => {
    if (sheet && baseDamageThreshold && buildModifiers) {
      return {
        trivialMax:
          Math.floor(baseDamageThreshold * 0.25) +
          buildModifiers.thresholdBonus,
        lightMax:
          Math.floor(baseDamageThreshold * 0.5) + buildModifiers.thresholdBonus,
        mediumMax:
          Math.floor(baseDamageThreshold * 0.9) + buildModifiers.thresholdBonus,
        heavyMax:
          Math.floor(baseDamageThreshold * 1.25) +
          buildModifiers.thresholdBonus,
      };
    }

    return {
      trivialMax: 2,
      lightMax: 4,
      mediumMax: 7,
      heavyMax: 10,
    };
  }, [baseDamageThreshold, buildModifiers]);

  const currentEffect = useMemo(() => {
    return { label: "", detail: "" };
  }, []);

  const getSheet = async (sheetUID: string) => {
    fetch(`/api/sheets/${sheetUID}`)
      .then((res) => res.json())
      .then((data) => {
        setSheet(data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const handleSpendAp = (cost: number) => {
    if (cost <= 0 || !sheet) {
      return;
    }

    const { nextAp, nextResilience } = spendAP(
      cost,
      sheet.character.actionPoints,
      sheet.character.resilienceCurrent
    );

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilienceCurrent: nextResilience,
        actionPoints: nextAp,
      },
    });
  };

  const handleSpendWard = (cost: number) => {
    if (Number.isNaN(cost) || cost <= 0 || !sheet) {
      return;
    }

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        wardCurrent: Math.min(0, sheet.character.wardCurrent - cost),
      },
    });
  };

  const handleRefillWard = () => {
    if (!sheet || !maxWard) {
      return;
    }

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        wardCurrent: Math.min(maxWard, 20),
      },
    });
  };

  const handleResilienceDecrease = () => {
    if (!sheet) {
      return;
    }

    let resilience = sheet.character.resilienceCurrent;
    let reserves = sheet.character.resilienceReserves;

    if (reserves > 0) {
      reserves = Math.max(0, reserves - 1);
    } else if (resilience > 0) {
      resilience -= 1;
    }

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilienceCurrent: resilience,
        resilienceReserves: reserves,
      },
    });
  };

  const handleResilienceIncrease = (value?: number) => {
    if (!sheet || !effectiveResilience) {
      return;
    }
    if (value) {
      setSheet({
        ...sheet,
        character: {
          ...sheet.character,
          resilienceCurrent: value,
        },
      });
    } else {
      const increasedResilience = Math.min(
        sheet.character.resilienceCurrent + 1,
        effectiveResilience
      );
      setSheet({
        ...sheet,
        character: {
          ...sheet.character,
          resilienceCurrent: increasedResilience,
        },
      });
    }
  };

  const handleReservesIncrease = () => {
    if (!sheet || !maxResilience) {
      return;
    }

    if (sheet.character.resilienceReserves >= maxReserves) {
      return;
    }

    const increasedReserves = getIncreasedReserves(
      sheet.character.resilienceReserves,
      maxResilience
    );
    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilienceReserves: increasedReserves,
      },
    });
  };

  const handleHealWound = (woundId: number) => {
    if (!sheet || !maxResilience) {
      return;
    }

    const wound = sheet.wounds.find((wound) => wound.id === woundId);

    if (!wound) {
      return;
    }

    const healed = getHealedWound(wound);

    if (healed === null) {
      fetch(`/api/wounds/${woundId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSheet({
            ...sheet,
            wounds: data,
          });
        });
      return;
    } else {
      fetch(`/api/wounds/${woundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healed),
      })
        .then((res) => res.json())
        .then((data) => {
          const severityDelta = wound.severity - healed.severity;
          setSheet({
            ...sheet,
            wounds: data,
          });
        });
    }
  };

  const handleApplyDamage = (damageAmount: number, damageType: string) => {
    if (!sheet || !maxResilience || !damageThresholds) {
      return;
    }

    const { trivialMax, lightMax, mediumMax, heavyMax } = damageThresholds;

    let threshold: DamageThresholds = "Trivial";
    if (damageAmount > trivialMax) threshold = "Light";
    if (damageAmount > lightMax) threshold = "Medium";
    if (damageAmount > mediumMax) threshold = "Heavy";
    if (damageAmount > heavyMax) threshold = "Deadly";

    if (threshold === "Deadly") return;

    const body: PostWoundBody = {
      threshold,
      damageType,
      characterUID: sheet?.character.characterUID,
    };

    fetch("/api/wounds", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const newResilienceCurrent = Math.min(
          sheet.character.resilienceCurrent - data.severity,
          effectiveResilience
        );
        setSheet({
          ...sheet,
          wounds: [...sheet.wounds, data],
          character: {
            ...sheet.character,
            resilienceCurrent: newResilienceCurrent,
          },
        });
      });
  };

  const values = {
    sheet,
    isLoading,
    setSheet,
    getSheet,
    handlers: {
      handleSpendAp,
      handleSpendWard,
      handleRefillWard,
      handleResilienceDecrease,
      handleResilienceIncrease,
      handleReservesIncrease,
      handleHealWound,
      handleApplyDamage,
    },
    modifiers: {
      maxResilience,
      effectiveResilience,
      maxReserves,
      buildModifiers,
      penalties,
      effectivePhysicality,
      reactionPhysicalityBonus,
      maxWard,
      effectiveMoveSpeed,
      carryCapacityKg,
      hitClass,
      baseDamageThreshold,
      damageThresholds,
      currentEffect,
    },
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
