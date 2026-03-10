import { useMemo, useState } from "react";
import { Sheet } from "../types";

export function useCharacterModifiers(initialValue: Sheet | null) {
  const [character, setCharacter] = useState<Sheet | null>(initialValue);

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
        character.character.resilience_reserves,
        Math.floor(maxResilience / 3)
      );
    }
    return 0;
  }, [maxResilience, character?.character?.resilience_reserves]);

  const buildModifiers = useMemo(() => {
    if (character) {
      switch (character.character.physical_build) {
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
  }, [character?.character?.physical_build]);

  const penalties = useMemo(() => {
    if (character && maxResilience) {
      const { resilience_current } = character.character;
      let movementPenalty = 0;
      let statPenalty = 0;

      if (maxResilience > 0 && resilience_current < maxResilience / 2) {
        movementPenalty = 1;
      }
      if (maxResilience > 0 && resilience_current < maxResilience / 4) {
        statPenalty = 1;
      }
      if (maxResilience > 0 && resilience_current < maxResilience / 8) {
        movementPenalty = 2;
        statPenalty = 2;
      }

      return { movementPenalty, statPenalty };
    }
    return {
      movementPenalty: 0,
      statPenalty: 0,
    };
  }, [maxResilience, character?.character?.resilience_current]);

  const effectivePhysicality = useMemo(() => {
    if (character && penalties) {
      return Math.max(0, character.stats.phy - penalties.statPenalty);
    }
    return 0;
  }, [character?.stats, penalties]);

  const reactionPhysicalityBonus = useMemo(() => {
    if (character && effectivePhysicality) {
      const { physical_build } = character.character;
      const multiplier =
        physical_build === "Lithe" ? 1 : physical_build === "Average" ? 0.5 : 0;

      return Math.floor(effectivePhysicality * multiplier);
    }
    return 0;
  }, [character?.character?.physical_build, effectivePhysicality]);

  const maxWard = useMemo(() => {
    if (character) {
      return character.stats.wil * 4;
    }
    return 0;
  }, [character?.stats]);

  const effectiveMoveSpeed = useMemo(() => {
    if (buildModifiers && penalties && character) {
      const { movespeedBonus } = buildModifiers;
      const { movementPenalty } = penalties;

      return Math.max(
        0,
        character.character.baseMoveSpeed + movespeedBonus - movementPenalty
      );
    }
    return 0;
  }, [buildModifiers, penalties, character]);

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

  const modifiers = {
    maxResilience,
    penalties,
    effectiveResilience,
    maxReserves,
    buildModifiers,
    effectivePhysicality,
    reactionPhysicalityBonus,
    maxWard,
    effectiveMoveSpeed,
    carryCapacityKg,
    hitClass,
    baseDamageThreshold,
    damageThresholds,
    currentEffect,
  };

  return { setCharacter, modifiers };
}
