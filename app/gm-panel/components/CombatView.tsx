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
    const combatants: CombatSheet[] = sheets.map((sheet) => {
      return { ...sheet, turnOrder: 0 };
    });
    setPlayerOrder(combatants);
  }, [sheets]);

  const updateTurnOrder = (characterId: string, newTurnOrder: number) => {
    // creates our list of players in combat.
    const updatedCombatOrder = playerOrder.map((sheet) => {
      if (sheet.character.id === characterId) {
        return { ...sheet, turnOrder: newTurnOrder };
      }
      return sheet;
    });
    setPlayerOrder(updatedCombatOrder);
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
        { name: `${combatantName} ${count}`, turnOrder },
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
                updateTurnOrder={updateTurnOrder}
              />
            );
          } else {
            return (
              <CombatantCombatPanel
                key={key}
                combatant={value}
                updateTurnOrder={updateTurnOrder}
              />
            );
          }
        })}
    </div>
  );
};

export default CombatView;
