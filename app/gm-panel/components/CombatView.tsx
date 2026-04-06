"use client";

import { Button } from "@/components";
import { Combatant, CombatSheet, Sheet } from "@/lib/types";
import { useEffect, useState } from "react";
import { PlayerCombatPanel, CombatantCombatPanel } from "./index";

interface Props {
  sheets: Sheet[];
}

const CombatView = ({ sheets }: Props) => {
  const [playerOrder, setPlayerOrder] = useState<CombatSheet[]>([]);
  const [combatantOrder, setCombatantOrder] = useState<Combatant[]>([]);

  const [combatantName, setCombatantName] = useState<string>("");
  const [turnOrder, setTurnOrder] = useState<number>(0);

  useEffect(() => {
    const storedPlayers = localStorage.getItem("player-combat-order");
    const storedCombatants = localStorage.getItem("combatant-combat-order");

    if (storedPlayers) {
      (async () => {
        const players = await JSON.parse(storedPlayers);
        setPlayerOrder(players);
      })();
    }

    if (storedCombatants) {
      (async () => {
        const combatants = await JSON.parse(storedCombatants);
        setCombatantOrder(combatants);
      })();
    }

    if (playerOrder.length <= 0) {
      // creates our list of players in combat.
      const combatants: CombatSheet[] = sheets.map((sheet) => {
        return { ...sheet, turnOrder: 0 };
      });
      setPlayerOrder(combatants);
    }
  }, [sheets]);

  useEffect(() => {
    if (playerOrder.length > 0) {
      localStorage.setItem("player-combat-order", JSON.stringify(playerOrder));
    } else {
      localStorage.removeItem("player-combat-order");
    }
    if (combatantOrder.length > 0) {
      localStorage.setItem(
        "combatant-combat-order",
        JSON.stringify(combatantOrder)
      );
    } else {
      localStorage.removeItem("combatant-combat-order");
    }
  }, [playerOrder, combatantOrder]);

  const updatePlayerTurnOrder = (characterId: string, newTurnOrder: number) => {
    const updatedCombatOrder = playerOrder.map((sheet) => {
      if (sheet.character.id === characterId) {
        return { ...sheet, turnOrder: newTurnOrder };
      }
      return sheet;
    });
    setPlayerOrder(updatedCombatOrder);
  };

  const updateCombatantTurnOrder = (name: string, newTurnOrder: number) => {
    const updatedCombatOrder = combatantOrder.map((combatant) => {
      if (combatant.name === name) {
        return { ...combatant, turnOrder: newTurnOrder };
      }
      return combatant;
    });
    setCombatantOrder(updatedCombatOrder);
  };

  const addCombatant = () => {
    if (combatantName === "") {
      return;
    }

    const count = combatantOrder.filter(
      (combatant) => combatant.name === combatantName
    ).length;

    if (count > 0) {
      // so we can differentiate between like-named combatants without generating some form of ID.
      setCombatantOrder([
        ...combatantOrder,
        { name: `${combatantName} ${count + 1}`, turnOrder },
      ]);
    } else {
      setCombatantOrder([
        ...combatantOrder,
        { name: combatantName, turnOrder },
      ]);
    }
    setCombatantName("");
    setTurnOrder(0);
  };

  const removeCombatant = (name: string) => {
    const updatedCombatantList = combatantOrder.filter(
      (combatant) => combatant.name !== name
    );
    setCombatantOrder(updatedCombatantList);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6 grid grid-cols-3">
        <div className="flex justify-around items-end gap-3 p-4 col-span-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Name
            <input
              type="text"
              placeholder="Tony Gobliano"
              value={combatantName}
              onChange={(event) => setCombatantName(event.target.value)}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Turn Order
            <input
              type="number"
              placeholder="0"
              value={turnOrder}
              onChange={(event) => setTurnOrder(Number(event.target.value))}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <Button onClick={() => addCombatant()}>Add Entry</Button>
        </div>
        <div className="flex justify-center flex-col items-end gap-4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Start Combat
          </p>
          <Button onClick={() => console.log()}>Start</Button>
        </div>
      </section>
      {[...playerOrder, ...combatantOrder]
        ?.sort((a, b) => b.turnOrder - a.turnOrder)
        .map((value, key) => {
          if ("character" in value) {
            return (
              <PlayerCombatPanel
                key={key}
                sheet={value}
                updatePlayerTurnOrder={updatePlayerTurnOrder}
              />
            );
          } else {
            return (
              <CombatantCombatPanel
                key={key}
                combatant={value}
                removeCombatant={removeCombatant}
                updateCombatantTurnOrder={updateCombatantTurnOrder}
              />
            );
          }
        })}
    </div>
  );
};

export default CombatView;
