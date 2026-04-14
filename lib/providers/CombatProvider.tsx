"use client";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { Combatant, CombatContextType, CombatSheet, Sheet } from "../types";
import { supabase } from "../supabaseClient";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before CombatContext was initialized`);
};

export const CombatContext = createContext<CombatContextType>({
  currentTurn: 0,
  currentRound: 0,
  combatStart: false,
  combatOrder: [],
  addCombatant: () => initializationError("addCombatant"),
  removeCombatant: () => initializationError("removeCombatant"),
  updatePlayerOrder: () => initializationError("updatePlayerOrder"),
  updateCombatantOrder: () => initializationError("updateCombatantOrder"),
  handlers: {
    handleCombatStart: () => initializationError("handleCombatStart"),
  },
  setters: {
    setPlayerOrder: () => initializationError("setPlayerOrder"),
  },
});

export const CombatProvider = ({ children }: { children: ReactNode }) => {
  const [combatStart, setCombatStart] = useState<boolean>(false);

  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const [playerCombatOrder, setPlayerCombatOrder] = useState<CombatSheet[]>([]);
  const [combatantCombatOrder, setCombatantCombatOrder] = useState<Combatant[]>(
    []
  );

  const combatOrder = useMemo(() => {
    return [...playerCombatOrder, ...combatantCombatOrder]?.sort(
      (a, b) => b.turnOrder - a.turnOrder
    );
  }, [playerCombatOrder, combatantCombatOrder]);

  useEffect(() => {
    (async () => {
      if (playerCombatOrder.length <= 0) {
        const stored = localStorage.getItem("player-order");
        if (stored) {
          const data = await JSON.parse(stored);
          setPlayerCombatOrder(data);
        }
      }
    })();
    (async () => {
      if (combatantCombatOrder.length <= 0) {
        const stored = localStorage.getItem("combatant-order");
        if (stored) {
          const data = await JSON.parse(stored);
          setCombatantCombatOrder(data);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (playerCombatOrder.length > 0) {
      playerCombatOrder.forEach((sheet) => {
        const channel = supabase.channel(`player:${sheet.character.id}`);
        channel.send({ type: "broadcast", event: "combat", payload: sheet });
      });
    }
  }, [playerCombatOrder]);

  useEffect(() => {
    if (playerCombatOrder.length > 0) {
      localStorage.setItem("player-order", JSON.stringify(playerCombatOrder));
    } else {
      localStorage.removeItem("player-order");
    }
    if (combatantCombatOrder.length > 0) {
      localStorage.setItem(
        "combatant-order",
        JSON.stringify(combatantCombatOrder)
      );
    } else {
      localStorage.removeItem("combatant-order");
    }
  }, [playerCombatOrder, combatantCombatOrder]);

  const setPlayerOrder = (sheets: Sheet[]) => {
    if (
      playerCombatOrder.length <= 0 ||
      playerCombatOrder.length < sheets.length
    ) {
      // creates our list of players in combat.
      const combatants: CombatSheet[] = sheets.map((sheet) => {
        return { ...sheet, turnOrder: 0 };
      });
      setPlayerCombatOrder(combatants);
    }
  };

  const updatePlayerOrder = (id: string, newTurnOrder: number) => {
    const updatedCombatOrder = playerCombatOrder.map((sheet) => {
      if (sheet.character.id === id) {
        return { ...sheet, turnOrder: newTurnOrder };
      }
      return sheet;
    });
    setPlayerCombatOrder(updatedCombatOrder);
  };

  const handleCombatStart = (playerCombatOrder: CombatSheet[]) => {};

  const addCombatant = (name: string, turnOrder: number) => {
    if (name === "") {
      return;
    }

    const count = combatantCombatOrder.filter(
      (combatant) => combatant.name === name
    ).length;

    setCombatantCombatOrder([
      ...combatantCombatOrder,
      {
        // so we can differentiate between like-named combatants without generating some form of ID.
        name: count > 0 ? `${name} ${count + 1}` : name,
        turnOrder,
      },
    ]);
  };

  const updateCombatantOrder = (name: string, newTurnOrder: number) => {
    const updatedCombatOrder = combatantCombatOrder.map((combatant) => {
      if (combatant.name === name) {
        return { ...combatant, turnOrder: newTurnOrder };
      }
      return combatant;
    });
    setCombatantCombatOrder(updatedCombatOrder);
  };

  const removeCombatant = (name: string) => {
    const updatedCombatantList = combatantCombatOrder.filter(
      (combatant) => combatant.name !== name
    );
    setCombatantCombatOrder(updatedCombatantList);
  };

  const values = {
    handlers: {
      handleCombatStart,
    },
    setters: {
      setPlayerOrder,
    },
    currentRound,
    currentTurn,
    combatStart,
    combatOrder,
    addCombatant,
    removeCombatant,
    updatePlayerOrder,
    updateCombatantOrder,
  };

  return (
    <CombatContext.Provider value={values}>{children}</CombatContext.Provider>
  );
};
