"use client";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { Combatant, CombatContextType, CombatSheet, Sheet } from "../types";
import { supabase } from "../supabaseClient";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before CombatContext was initialized`);
};

export const CombatContext = createContext<CombatContextType>({
  currentTurn: 0,
  currentRound: 1,
  combatStart: false,
  combatOrder: [],
  addCombatant: () => initializationError("addCombatant"),
  removeCombatant: () => initializationError("removeCombatant"),
  updatePlayerOrder: () => initializationError("updatePlayerOrder"),
  updateCombatantOrder: () => initializationError("updateCombatantOrder"),
  handlers: {
    startCombat: () => initializationError("startCombat"),
    endCombat: () => initializationError("endCombat"),
    nextTurn: () => initializationError("nextTurn"),
    nextRound: () => initializationError("nextRound"),
  },
  setters: {
    setPlayerOrder: () => initializationError("setPlayerOrder"),
  },
});

export const CombatProvider = ({ children }: { children: ReactNode }) => {
  const [combatStart, setCombatStart] = useState<boolean>(false);

  // Tells us who is currently up in initiative.
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const [playerCombatOrder, setPlayerCombatOrder] = useState<CombatSheet[]>([]);
  const [combatantCombatOrder, setCombatantCombatOrder] = useState<Combatant[]>(
    []
  );

  const combatOrder = useMemo(() => {
    return [...playerCombatOrder, ...combatantCombatOrder]?.sort(
      (a, b) => b.initiative - a.initiative
    );
  }, [playerCombatOrder, combatantCombatOrder]);

  useEffect(() => {
    // If the orders are empty we populate them with any data stored in local storage.
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

    (async () => {
      const stored = localStorage.getItem("in-combat");
      if (stored) {
        const data = await JSON.parse(stored);

        setCombatStart(data.combatStart);
        setCurrentRound(data.currentRound);
        setCurrentTurn(data.currentTurn);
      }
    })();
  }, []);

  useEffect(() => {
    if (combatStart && playerCombatOrder.length > 0) {
      playerCombatOrder.forEach((sheet) => {
        const channel = supabase.channel(`player:${sheet.character.id}`);
        channel.send({
          type: "broadcast",
          event: "combat-start",
          payload: sheet,
        });
      });
    }
  }, [combatStart]);

  useEffect(() => {
    // When the orders are updated, update the stored orders (delete if empty).
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
        return { ...sheet, initiative: 0 };
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

  const addCombatant = (name: string, initiative: number) => {
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
        initiative,
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

  const startCombat = () => {
    setCombatStart(true);
    setCurrentTurn(0);

    localStorage.setItem(
      "in-combat",
      JSON.stringify({
        combatStart: true,
        currentRound: 1,
        currentTurn: 0,
      })
    );

    if ("character" in combatOrder[currentTurn]) {
      alertPlayer(combatOrder[currentTurn], true);
    }
  };

  const endCombat = (sheets: Sheet[]) => {
    setCombatStart(false);
    setCurrentTurn(0);
    setCurrentRound(1);
    setCombatantCombatOrder([]);

    localStorage.removeItem("in-combat");

    sheets.forEach((sheet) => {
      const channel = supabase.channel(`player:${sheet.character.id}`);
      channel.send({
        type: "broadcast",
        event: "combat-end",
        payload: sheet,
      });
    });
  };

  const nextTurn = () => {
    const endOfOrder = currentTurn === combatOrder.length - 1;
    // If we reach the end of combat order go back to the start and increase the round. Otherwise go next-
    const turn = endOfOrder ? 0 : currentTurn + 1;
    const round = endOfOrder ? currentRound + 1 : currentRound;

    const combatant = combatOrder[turn];
    // If we're at the start of order, use the last index- otherwise use the normal turn value. (Prevents an undefined object).
    const prevCombatant =
      combatOrder[turn === 0 ? combatOrder.length - 1 : turn - 1];

    setCurrentTurn(turn);
    setCurrentRound(round);

    console.log(combatOrder[6]);

    if ("character" in combatant) {
      alertPlayer(combatant, true);
    }

    // Alerts the player that their turn is over.
    if ("character" in prevCombatant) {
      alertPlayer(prevCombatant, false);
    }
  };

  const nextRound = () => {
    const prevCombatant = combatOrder[currentTurn];

    if ("character" in prevCombatant) {
      alertPlayer(prevCombatant, false);
    }

    setCurrentTurn(0);
    setCurrentRound(currentRound + 1);

    const combatant = combatOrder[0];

    if ("character" in combatant) {
      alertPlayer(combatant, true);
    }
  };

  const alertPlayer = (sheet: CombatSheet, isTurn: boolean) => {
    const channel = supabase.channel(`player:${sheet.character.id}`);
    channel.send({
      type: "broadcast",
      event: "combat-turn",
      payload: isTurn,
    });
  };

  const values = {
    handlers: {
      startCombat,
      endCombat,
      nextTurn,
      nextRound,
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
