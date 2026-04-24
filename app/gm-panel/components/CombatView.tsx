"use client";

import { Button } from "@/components";
import { Combatant, CombatSheet, Sheet } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { PlayerCombatPanel, CombatantCombatPanel } from "./index";
import { CombatContext } from "@/lib/providers/CombatProvider";

interface Props {
  sheets: Sheet[];
}

const CombatView = ({ sheets }: Props) => {
  const {
    currentTurn,
    inCombat,
    handlers,
    addCombatant,
    combatOrder,
    setters,
    removeCombatant,
    updateCombatantOrder,
    updatePlayerOrder,
    currentRound,
    updateCombatantStatus,
  } = useContext(CombatContext);

  const [combatantName, setCombatantName] = useState<string>("");
  const [initiative, setInitiative] = useState<number>(0);

  useEffect(() => {
    setters.setPlayerOrder(sheets);
  }, [sheets]);

  const handleAddCombatant = () => {
    addCombatant(combatantName, initiative);
    setCombatantName("");
    setInitiative(0);
  };

  return (
    <div className="grid gap-6">
      {inCombat ? (
        <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6 flex flex-row justify-between">
          <div className="flex flex-row gap-4">
            <Button onClick={() => handlers.nextTurn()}>Next Turn</Button>
            <Button onClick={() => handlers.nextRound()}>Next Round</Button>
            <Button
              variant="secondary"
              onClick={() => handlers.endCombat(sheets)}
            >
              End Combat
            </Button>
          </div>
          <div className="flex items-center px-6 gap-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
              Current Round: {currentRound}
            </p>
            <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
              Current turn: {currentTurn + 1}
            </p>
          </div>
        </section>
      ) : (
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
                value={initiative}
                onChange={(event) => setInitiative(Number(event.target.value))}
                className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
              />
            </label>
            <Button onClick={() => handleAddCombatant()}>Add Entry</Button>
          </div>
          <div className="flex justify-center flex-col items-end gap-4 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              Start Combat
            </p>
            <Button onClick={() => handlers.startCombat()}>Start</Button>
          </div>
        </section>
      )}
      {combatOrder.map((value, key) => {
        if ("character" in value) {
          return (
            <PlayerCombatPanel
              key={key}
              sheet={value}
              isTurn={key === currentTurn && inCombat}
              updatePlayerTurnOrder={updatePlayerOrder}
              inCombat={inCombat}
            />
          );
        } else {
          return (
            <CombatantCombatPanel
              key={key}
              combatant={value}
              isTurn={key === currentTurn && inCombat}
              removeCombatant={removeCombatant}
              updateCombatantTurnOrder={updateCombatantOrder}
              updateCombatantStatus={updateCombatantStatus}
              inCombat={inCombat}
            />
          );
        }
      })}
    </div>
  );
};

export default CombatView;
