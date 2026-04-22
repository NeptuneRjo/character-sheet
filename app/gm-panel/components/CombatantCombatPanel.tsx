"use client";

import { Button } from "@/components";
import { Combatant } from "@/lib/types";

interface Props {
  combatant: Combatant;
  updateCombatantTurnOrder: (name: string, newTurnOrder: number) => void;
  removeCombatant: (name: string) => void;
  isTurn: boolean;
}

const CombatPanel = ({
  combatant,
  updateCombatantTurnOrder,
  removeCombatant,
  isTurn,
}: Props) => {
  return (
    <section
      className={`rounded-2xl border ${isTurn ? "border-[#ba9a71]" : "border-[#5c4a33]"} bg-[#140f0a] p-6`}
    >
      <div className="mb-4 flex items-center justify-between gap-6 py-2">
        <h2 className="text-xl font-semibold text-[#f0e4cf] flex-1">
          {combatant.name}
        </h2>
        <Button onClick={() => removeCombatant(combatant.name)}>
          Remove Entry
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Initiative
          <input
            type="number"
            value={combatant.initiative}
            onChange={(event) =>
              updateCombatantTurnOrder(
                combatant.name,
                Number(event.target.value)
              )
            }
            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          />
        </label>
      </div>
    </section>
  );
};

export default CombatPanel;
