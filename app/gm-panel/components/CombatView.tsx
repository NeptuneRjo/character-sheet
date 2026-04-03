"use client";

import { Button } from "@/components";
import { CombatSheet, Sheet } from "@/lib/types";
import { useEffect, useState } from "react";
import { CombatPanel } from ".";

interface Props {
  characters: Sheet[];
}

const CombatView = ({ characters }: Props) => {
  const [combatOrder, setCombatOrder] = useState<CombatSheet[]>([]);

  useEffect(() => {
    const combatants: CombatSheet[] = characters.map((character) => {
      return { ...character, turnOrder: 0 };
    });
    setCombatOrder(combatants);
  }, [characters]);

  const updateTurnOrder = (characterId: string, newTurnOrder: number) => {
    const updatedCombatOrder = combatOrder.map((sheet) => {
      if (sheet.character.id === characterId) {
        return { ...sheet, turnOrder: newTurnOrder };
      }
      return sheet;
    });
    setCombatOrder(updatedCombatOrder);
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
              // value={characterName}
              // onChange={(event) => setCharacterName(event.target.value)}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Turn Order
            <input
              type="number"
              placeholder="9"
              // value={characterName}
              // onChange={(event) => setCharacterName(event.target.value)}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <Button className="">Add Entry</Button>
        </div>
        <div className="flex justify-center flex-col items-end gap-4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Start Combat
          </p>
          <Button onClick={() => console.log()}>Start</Button>
        </div>
      </section>
      {combatOrder
        ?.sort((a, b) => b.turnOrder - a.turnOrder)
        .map((sheet, key) => (
          <CombatPanel
            sheet={sheet}
            key={key}
            updateTurnOrder={updateTurnOrder}
          />
        ))}
    </div>
  );
};

export default CombatView;
