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
  character: null,
  isLoading: true,
  setCharacter: () => initializationError("setCharacter"),
  getCharacter: async () => initializationError("getCharacter"),
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
  const [character, setCharacter] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const maxResilience = useMemo(() => {
    if (character) {
      const base = 4 + 2 * character.stats.vit;
      return Math.max(0, base);
    }
    return 0;
  }, [character?.stats, character?.wounds]);

  const effectiveResilience = useMemo(() => {
    if (character) {
      const severity = Array.from(character.wounds).reduce(
        (total, wound) => total + wound.severity,
        0
      );

      const base = 4 + 2 * character.stats.vit;
      return Math.max(0, base - severity);
    }
    return 0;
  }, [character?.stats, character?.wounds]);

  const maxReserves = useMemo(() => {
    if (maxResilience && character) {
      return Math.max(
        character.resilienceReserves,
        Math.floor(maxResilience / 3)
      );
    }
    return 0;
  }, [maxResilience, character?.resilienceReserves]);

  const buildModifiers = useMemo(() => {
    if (character) {
      switch (character.physicalBuild) {
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
  }, [character?.physicalBuild]);

  const penalties = useMemo(() => {
    if (character && maxResilience) {
      const { resilienceCurrent } = character;
      let movementPenalty = 0;
      let statPenalty = 0;

      if (maxResilience > 0 && resilienceCurrent < maxResilience / 2) {
        movementPenalty = 1;
      } else if (maxResilience > 0 && resilienceCurrent < maxResilience / 4) {
        statPenalty = 1;
      } else if (maxResilience > 0 && resilienceCurrent < maxResilience / 8) {
        movementPenalty = 2;
        statPenalty = 2;
      }

      return { movementPenalty, statPenalty };
    }
    return {
      movementPenalty: 0,
      statPenalty: 0,
    };
  }, [maxResilience, character?.resilienceCurrent]);

  const effectivePhysicality = useMemo(() => {
    if (character && penalties) {
      return Math.max(0, character.stats.phy - penalties.statPenalty);
    }
    return 0;
  }, [character?.stats, penalties]);

  const reactionPhysicalityBonus = useMemo(() => {
    if (character && effectivePhysicality) {
      const { physicalBuild } = character;
      const multiplier =
        physicalBuild === "Lithe" ? 1 : physicalBuild === "Average" ? 0.5 : 0;

      return Math.floor(effectivePhysicality * multiplier);
    }
    return 0;
  }, [character?.physicalBuild, effectivePhysicality]);

  const maxWard = useMemo(() => {
    if (character) {
      return character.stats.wil * 4;
    }
    return 0;
  }, [character?.stats]);

  const effectiveMoveSpeed = useMemo(() => {
    if (buildModifiers && penalties) {
      const { movespeedBonus } = buildModifiers;
      const { movementPenalty } = penalties;

      return Math.max(0, 5 + movespeedBonus - movementPenalty);
    }
    return 0;
  }, [buildModifiers, penalties]);

  const carryCapacityKg = useMemo(() => {
    if (character && buildModifiers) {
      const base = 20 + character.stats.phy * 10;
      return Math.max(0, Math.round(base * buildModifiers.carryMultiplier));
    }
    return 0;
  }, [character?.stats, buildModifiers]);

  const hitClass = useMemo(() => {
    if (buildModifiers) {
      return 8 + buildModifiers.hitclassBonus;
    }
    return 8;
  }, [buildModifiers]);

  const baseDamageThreshold = useMemo(() => {
    if (character) {
      return 8 + 3 * character.stats.vit + character.stats.phy;
    }
    return 11;
  }, [character?.stats]);

  const damageThresholds = useMemo(() => {
    if (character && baseDamageThreshold && buildModifiers) {
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

  const getCharacter = async (characterUID: string) => {
    fetch(`/api/characters/${characterUID}`)
      .then((res) => res.json())
      .then((data) => {
        setCharacter(data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const handleSpendAp = (cost: number) => {
    if (cost <= 0 || !character) {
      return;
    }

    const { nextAp, nextResilience } = spendAP(
      cost,
      character.actionPoints,
      character.resilienceCurrent
    );

    setCharacter({
      ...character,
      resilienceCurrent: nextResilience,
      actionPoints: nextAp,
    });
  };

  const handleSpendWard = (cost: number) => {
    if (Number.isNaN(cost) || cost <= 0 || !character) {
      return;
    }

    setCharacter({
      ...character,
      wardCurrent: Math.min(0, character.wardCurrent - cost),
    });
  };

  const handleRefillWard = () => {
    if (!character || !maxWard) {
      return;
    }

    setCharacter({
      ...character,
      wardCurrent: Math.min(maxWard, 20),
    });
  };

  const handleResilienceDecrease = () => {
    if (!character) {
      return;
    }

    let resilience = character.resilienceCurrent;
    let reserves = character.resilienceReserves;

    if (reserves > 0) {
      reserves = Math.max(0, reserves - 1);
    } else if (resilience > 0) {
      resilience -= 1;
    }

    setCharacter({
      ...character,
      resilienceCurrent: resilience,
      resilienceReserves: reserves,
    });
  };

  const handleResilienceIncrease = (value?: number) => {
    if (!character || !effectiveResilience) {
      return;
    }
    if (value) {
      setCharacter({ ...character, resilienceCurrent: value });
    } else {
      const increasedResilience = Math.min(
        character.resilienceCurrent + 1,
        effectiveResilience
      );
      setCharacter({ ...character, resilienceCurrent: increasedResilience });
    }
  };

  const handleReservesIncrease = () => {
    if (!character || !maxResilience) {
      return;
    }

    if (character.resilienceReserves >= maxReserves) {
      return;
    }

    const increasedReserves = getIncreasedReserves(
      character.resilienceReserves,
      maxResilience
    );
    setCharacter({ ...character, resilienceReserves: increasedReserves });
  };

  const handleHealWound = (woundId: number) => {
    if (!character || !maxResilience) {
      return;
    }

    const wound = character.wounds.find((wound) => wound.id === woundId);

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
          setCharacter({
            ...character,
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
          setCharacter({
            ...character,
            wounds: data,
          });
        });
    }
  };

  const handleApplyDamage = (damageAmount: number, damageType: string) => {
    if (!character || !maxResilience || !damageThresholds) {
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
      characterUID: character?.characterUID,
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
          character.resilienceCurrent - data.severity,
          effectiveResilience
        );
        setCharacter({
          ...character,
          wounds: [...character.wounds, data],
          resilienceCurrent: newResilienceCurrent,
        });
      });
  };

  const values = {
    character,
    isLoading,
    setCharacter,
    getCharacter,
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
