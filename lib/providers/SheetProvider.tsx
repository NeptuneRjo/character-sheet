"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import {
  CharacterModifiers,
  DamageThresholds,
  InsWound,
  Payload,
  RequestBody,
  Sheet,
  SheetContextType,
  Wound,
} from "../types";
import {
  createWound,
  getHealedWound,
  getIncreasedReserves,
  getIncreasedResilience,
  getWoundName,
  spendAP,
} from "../utils";
import { supabase } from "../supabaseClient";
import { useCharacterModifiers } from "../hooks/useCharacterModifiers";

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
  modifiers: {} as CharacterModifiers,
});

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { setCharacter, modifiers } = useCharacterModifiers(sheet);

  useEffect(() => {
    // Save to local host first- debounce to db after x amount of time
    const channel = supabase.channel(
      `player:${sheet?.character.character_uid}`
    );
    channel
      .on("broadcast", { event: "*" }, ({ payload }) => {
        if (!sheet) return;
        const { data, event, table } = payload as Payload;
        if (table === "characters") {
          switch (event) {
            case "UPDATE":
              setSheet({
                ...sheet,
                character: {
                  ...sheet.character,
                  ...data,
                },
              });
              break;
            default:
              break;
          }
        }
        if (table === "stats") {
          switch (event) {
            case "UPDATE":
              setSheet({
                ...sheet,
                stats: {
                  ...sheet.stats,
                  ...data,
                },
              });
              break;
            default:
              break;
          }
        }
        if (table === "character_skills") {
          switch (event) {
            case "DELETE":
              const updatedSkills = sheet.skills.filter(
                (skill) => skill.id !== data.id
              );
              setSheet({
                ...sheet,
                skills: [...updatedSkills],
              });
              break;
            case "INSERT":
              setSheet({
                ...sheet,
                skills: [...sheet.skills, data],
              });
              break;
          }
        }
        if (table === "wounds") {
          switch (event) {
            case "INSERT":
              setSheet({
                ...sheet,
                wounds: [...sheet.wounds, data],
              });
              break;
            case "DELETE":
              const updatedWounds = sheet.wounds.filter(
                (wounds) => wounds.id !== data.id
              );
              setSheet({
                ...sheet,
                wounds: [...updatedWounds],
              });
              break;
            case "UPDATE":
              const healedWounds = sheet.wounds.map((wound) => {
                if (wound.id === data.id) {
                  return data;
                }
                return wound;
              });
              console.log(data);
              setSheet({
                ...sheet,
                wounds: [...healedWounds],
              });
              break;
            default:
              break;
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sheet, setSheet]);

  useEffect(() => {
    setCharacter(sheet);
    // Send the updated character sheet to the gm when changes are made
    const channel = supabase.channel("gm-sync");
    const payload: Payload = {
      event: "GM-SYNC",
      table: "GM-SYNC",
      data: sheet,
    };
    channel.send({ type: "broadcast", event: "shout", payload });
  }, [supabase, sheet]);

  const getSheet = async (sheetUID: string) => {
    fetch(`/api/characters/${sheetUID}`)
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
      sheet.character.action_points,
      sheet.character.resilience_current
    );

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilience_current: nextResilience,
        action_points: nextAp,
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
        ward_current: Math.min(0, sheet.character.ward_current - cost),
      },
    });
  };

  const handleRefillWard = () => {
    if (!sheet || !modifiers.maxWard) {
      return;
    }

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        ward_current: Math.min(modifiers.maxWard, 20),
      },
    });
  };

  const handleResilienceDecrease = () => {
    if (!sheet) {
      return;
    }

    let resilience = sheet.character.resilience_current;
    let reserves = sheet.character.resilience_reserves;

    if (reserves > 0) {
      reserves = Math.max(0, reserves - 1);
    } else if (resilience > 0) {
      resilience -= 1;
    }

    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilience_current: resilience,
        resilience_reserves: reserves,
      },
    });
  };

  const handleResilienceIncrease = (value?: number) => {
    if (!sheet || !modifiers.effectiveResilience) {
      return;
    }
    if (value) {
      setSheet({
        ...sheet,
        character: {
          ...sheet.character,
          resilience_current: value,
        },
      });
    } else {
      const increasedResilience = Math.min(
        sheet.character.resilience_current + 1,
        modifiers.effectiveResilience
      );
      setSheet({
        ...sheet,
        character: {
          ...sheet.character,
          resilience_current: increasedResilience,
        },
      });
    }
  };

  const handleReservesIncrease = () => {
    if (!sheet || !modifiers.maxResilience) {
      return;
    }

    if (sheet.character.resilience_reserves >= modifiers.maxReserves) {
      return;
    }

    const increasedReserves = getIncreasedReserves(
      sheet.character.resilience_reserves,
      modifiers.maxResilience
    );
    setSheet({
      ...sheet,
      character: {
        ...sheet.character,
        resilience_reserves: increasedReserves,
      },
    });
  };

  const handleHealWound = (woundId: number) => {
    // if (!sheet || !maxResilience) {
    //   return;
    // }
    // const wound = sheet.wounds.find((wound) => wound.id === woundId);
    // if (!wound) {
    //   return;
    // }
    // const healed = getHealedWound(wound);
    // const body: RequestBody<typeof healed> = {
    //   characterUID: sheet.character.character_uid,
    //   body: healed,
    // };
    // if (healed === null) {
    //   fetch(`/api/wounds/${woundId}`, {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(body),
    //   });
    //   return;
    // } else {
    //   fetch(`/api/wounds/${woundId}`, {
    //     method: "PATCH",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(body),
    //   });
    // }
  };

  const handleApplyDamage = (damageAmount: number, damageType: string) => {
    // if (!sheet || !maxResilience || !damageThresholds) {
    //   return;
    // }
    // const { trivialMax, lightMax, mediumMax, heavyMax } = damageThresholds;
    // let threshold: DamageThresholds = "Trivial";
    // if (damageAmount > trivialMax) threshold = "Light";
    // if (damageAmount > lightMax) threshold = "Medium";
    // if (damageAmount > mediumMax) threshold = "Heavy";
    // if (damageAmount > heavyMax) threshold = "Deadly";
    // if (threshold === "Deadly") return;
    // const woundName = getWoundName(threshold, damageType);
    // const wound = createWound(woundName);
    // const body: RequestBody<InsWound> = {
    //   body: wound,
    //   characterUID: sheet.character.character_uid,
    // };
    // fetch("/api/wounds", {
    //   method: "POST",
    //   body: JSON.stringify(body),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
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
    // modifiers: {
    //   maxResilience,
    //   effectiveResilience,
    //   maxReserves,
    //   buildModifiers,
    //   penalties,
    //   effectivePhysicality,
    //   reactionPhysicalityBonus,
    //   maxWard,
    //   effectiveMoveSpeed,
    //   carryCapacityKg,
    //   hitClass,
    //   baseDamageThreshold,
    //   damageThresholds,
    //   currentEffect,
    // },
    modifiers,
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
