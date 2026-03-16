"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { CharacterModifiers, Payload, Sheet, SheetContextType } from "../types";
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
    const channel = supabase.channel(`player:${sheet?.character.id}`);
    channel
      .on("broadcast", { event: "*" }, ({ payload }) => {
        if (!sheet) return;

        console.log(payload);

        setSheet(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sheet, setSheet]);

  useEffect(() => {
    if (sheet) {
      localStorage.setItem(
        `player:${sheet?.character.id}`,
        JSON.stringify(sheet)
      );
    }
    setCharacter(sheet);
    // Send the updated character sheet to the gm when changes are made
    const channel = supabase.channel("gm-sync");
    channel.send({ type: "broadcast", event: "shout", sheet });
  }, [supabase, sheet]);

  const getSheet = async (characterId: string) => {
    const stored = localStorage.getItem(`player:${characterId}`);

    if (stored) {
      const character = await JSON.parse(stored);
      setSheet(character);
      setIsLoading(false);
      return;
    }

    fetch(`/api/characters/${characterId}`)
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

  const handleHealWound = (woundId: number) => {};

  const handleApplyDamage = (damageAmount: number, damageType: string) => {};

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
    modifiers,
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
