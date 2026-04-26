"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Combatant, CombatContextType, CombatSheet, Sheet } from "../types";
import { supabase } from "../supabaseClient";
import { GMPanelContext } from "./GMPanelProvider";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before CombatContext was initialized`);
};

export const CombatContext = createContext<CombatContextType>({
  currentTurn: 0,
  currentRound: 1,
  inCombat: false,
  combatOrder: [],
  addCombatant: () => initializationError("addCombatant"),
  removeCombatant: () => initializationError("removeCombatant"),
  updatePlayerOrder: () => initializationError("updatePlayerOrder"),
  updateCombatantOrder: () => initializationError("updateCombatantOrder"),
  updateCombatantStatus: () => initializationError("updateCombatantStatus"),
  handlers: {
    startCombat: () => initializationError("startCombat"),
    endCombat: () => initializationError("endCombat"),
    nextTurn: () => initializationError("nextTurn"),
    nextRound: () => initializationError("nextRound"),
  },
});

export const CombatProvider = ({ children }: { children: ReactNode }) => {
  const { characters } = useContext(GMPanelContext);

  const [inCombat, setInCombat] = useState<boolean>(false);

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
    const saved = localStorage.getItem("player-order");

    if (saved && playerCombatOrder.length <= 0) {
      (async () => {
        const data = JSON.parse(saved);
        setPlayerCombatOrder(data);
      })();
      return;
    }
    // We store a list of references instead of the sheets to reduce the number of places that the sheets need to be updated.
    const order: CombatSheet[] = characters.map((sheet) => {
      return { id: sheet.character.id, initiative: 0 };
    });

    localStorage.setItem("player-order", JSON.stringify(order));
    setPlayerCombatOrder(order);
  }, [characters]);

  useEffect(() => {
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

        setInCombat(data.combatStart);
        setCurrentRound(data.currentRound);
        setCurrentTurn(data.currentTurn);
      }
    })();
  }, []);

  useEffect(() => {
    if (inCombat && playerCombatOrder.length > 0) {
      playerCombatOrder.forEach(({ id }) => {
        const sheet = characters.find(({ character }) => character.id === id);
        if (!sheet) return;
        const channel = supabase.channel(`player:${sheet.character.id}`);
        channel.send({
          type: "broadcast",
          event: "combat-start",
          payload: { isTurn: true },
        });
      });
    }
  }, [inCombat]);

  const updatePlayerOrder = (id: string, newTurnOrder: number) => {
    const updatedCombatOrder = playerCombatOrder.map((sheet) => {
      if (sheet.id === id) {
        return { ...sheet, initiative: newTurnOrder };
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
        incapacitated: false,
      },
    ]);
  };

  const updateCombatantOrder = (name: string, newTurnOrder: number) => {
    const updatedCombatOrder = combatantCombatOrder.map((combatant) => {
      if (combatant.name === name) {
        return { ...combatant, initiative: newTurnOrder };
      }
      return combatant;
    });
    setCombatantCombatOrder(updatedCombatOrder);
  };

  const updateCombatantStatus = (name: string, incapacitated: boolean) => {
    const updatedCombatOrder = combatantCombatOrder.map((combatant) => {
      if (combatant.name === name) {
        return { ...combatant, incapacitated };
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
    setInCombat(true);
    setCurrentTurn(0);

    localStorage.setItem(
      "in-combat",
      JSON.stringify({
        combatStart: true,
        currentRound: 1,
        currentTurn: 0,
      })
    );

    if ("id" in combatOrder[currentTurn]) {
      alertPlayer(combatOrder[currentTurn].id, true);
    }
  };

  const endCombat = (sheets: Sheet[]) => {
    setInCombat(false);
    setCurrentTurn(0);
    setCurrentRound(1);

    const updatedCombatantOrder = combatantCombatOrder.filter(
      (combatant) => !combatant.incapacitated
    );
    setCombatantCombatOrder(updatedCombatantOrder);

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

    if ("id" in combatant) {
      alertPlayer(combatant.id, true);
    }

    // Alerts the player that their turn is over.
    if ("id" in prevCombatant) {
      alertPlayer(prevCombatant.id, false);
    }
  };

  const nextRound = () => {
    const prevCombatant = combatOrder[currentTurn];

    if ("id" in prevCombatant) {
      alertPlayer(prevCombatant.id, false);
    }

    setCurrentTurn(0);
    setCurrentRound(currentRound + 1);

    const combatant = combatOrder[0];

    if ("id" in combatant) {
      alertPlayer(combatant.id, true);
    }
  };

  const alertPlayer = (id: string, isTurn: boolean) => {
    const channel = supabase.channel(`player:${id}`);
    channel.send({
      type: "broadcast",
      event: "combat-turn",
      payload: { isTurn },
    });
  };

  const values = {
    handlers: {
      startCombat,
      endCombat,
      nextTurn,
      nextRound,
    },
    currentRound,
    currentTurn,
    inCombat,
    combatOrder,
    addCombatant,
    removeCombatant,
    updatePlayerOrder,
    updateCombatantOrder,
    updateCombatantStatus,
  };

  return (
    <CombatContext.Provider value={values}>{children}</CombatContext.Provider>
  );
};
