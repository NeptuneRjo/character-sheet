"use client";

import { createContext, ReactNode, useMemo, useState } from "react";
import {
  DamageThresholds,
  PhysicalBuilds,
  PostWoundBody,
  Sheet,
  SheetContextType,
  Wound,
} from "../types";
import {
  derivedThreshholdBase,
  getBuildModifiers,
  getDerivedResilience,
  getDerivedResilienceMax,
  getEffectiveMoveSpeed,
  getEffectivePhysicality,
  getHealedWound,
  getIncreasedReserves,
  getIncreasedResilience,
  getPenalties,
  getReactionPhysicalityBonus,
  getResilienceReserves,
  getWardMax,
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
    maxResilience: 0,
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
  },
});

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const maxResilience = useMemo(() => {
    if (character) {
      return getDerivedResilienceMax(character.stats, character.wounds);
    }
    return 0;
  }, [character?.stats, character?.wounds]);

  const maxReserves = useMemo(() => {
    if (maxResilience && character) {
      return getResilienceReserves(
        maxResilience,
        character?.resilienceReserves
      );
    }
    return 0;
  }, [maxResilience, character?.resilienceReserves]);

  const buildModifiers = useMemo(() => {
    if (character) {
      return getBuildModifiers(character.physicalBuild as PhysicalBuilds);
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
      return getPenalties(maxResilience, character.resilienceCurrent);
    }
    return {
      movementPenalty: 0,
      statPenalty: 0,
    };
  }, [maxResilience, character?.resilienceCurrent]);

  const effectivePhysicality = useMemo(() => {
    if (character && penalties) {
      return getEffectivePhysicality(
        character.stats.phy,
        penalties.statPenalty
      );
    }
    return 0;
  }, [character?.stats, penalties]);

  const reactionPhysicalityBonus = useMemo(() => {
    if (character && effectivePhysicality) {
      return getReactionPhysicalityBonus(
        character.physicalBuild as PhysicalBuilds,
        effectivePhysicality
      );
    }
    return 0;
  }, [character?.physicalBuild, effectivePhysicality]);

  const maxWard = useMemo(() => {
    if (character) {
      return getWardMax(character.stats.wil);
    }
    return 0;
  }, [character?.stats]);

  const effectiveMoveSpeed = useMemo(() => {
    if (buildModifiers && penalties) {
      return getEffectiveMoveSpeed(
        5,
        buildModifiers.movespeedBonus,
        penalties.movementPenalty
      );
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
      return derivedThreshholdBase(character.stats);
    }
    return 11;
  }, [character?.stats]);

  const damageThresholds = useMemo(() => {
    if (character && maxResilience && buildModifiers) {
      return {
        trivialMax:
          Math.floor(maxResilience * 0.25) + buildModifiers.thresholdBonus,
        lightMax:
          Math.floor(maxResilience * 0.5) + buildModifiers.thresholdBonus,
        mediumMax:
          Math.floor(maxResilience * 0.9) + buildModifiers.thresholdBonus,
        heavyMax:
          Math.floor(maxResilience * 1.25) + buildModifiers.thresholdBonus,
      };
    }
    return {
      trivialMax: 2,
      lightMax: 4,
      mediumMax: 7,
      heavyMax: 10,
    };
  }, [maxResilience, buildModifiers]);

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
    // const { resilienceReserves } = character;
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
    if (!character || !maxResilience) {
      return;
    }
    if (value) {
      setCharacter({ ...character, resilienceCurrent: value });
    } else {
      const increasedResilience = getIncreasedResilience(
        character.resilienceCurrent,
        maxResilience
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
            resilienceCurrent: Math.min(
              character.resilienceCurrent + wound.severity,
              maxResilience
            ),
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
            resilienceCurrent: Math.min(
              character.resilienceCurrent + severityDelta,
              maxResilience
            ),
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
          character.resilienceCurrent,
          data.severity,
          maxResilience
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
    },
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
