"use client";

import { createContext, ReactNode, useMemo, useState } from "react";
import { PhysicalBuilds, Sheet, SheetContextType } from "../types";
import {
  getBuildModifiers,
  getDerivedResilienceMax,
  getEffectiveMoveSpeed,
  getEffectivePhysicality,
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
  },
});

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const maxResilience = useMemo(() => {
    if (character) {
      return getDerivedResilienceMax(character?.stats, character?.wounds);
    }
    return 0;
  }, [character?.stats, character?.skills]);

  const maxReserves = useMemo(() => {
    if (maxResilience) {
      return getResilienceReserves(maxResilience);
    }
    return 0;
  }, [maxResilience]);

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
    const increasedReserves = getIncreasedReserves(
      character.resilienceReserves,
      maxResilience
    );
    setCharacter({ ...character, resilienceReserves: increasedReserves });
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
    },
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
