"use client";

import { useCharacterModifiers } from "@/lib/hooks/useCharacterModifiers";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { Combatant, CombatSheet, Stats } from "@/lib/types";
import { getStatLabel } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";

interface Props {
  combatant: Combatant;
  updateTurnOrder: (characterId: string, newTurnOrder: number) => void;
}

const CombatPanel = ({ combatant, updateTurnOrder }: Props) => {
  return (
    <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6">
      {/* <div className="mb-4 flex items-center justify-between gap-6 py-2">
        <h2 className="text-xl font-semibold text-[#f0e4cf] flex-1">
          {sheet.character.name}
        </h2>
        <a
          href={`/character/${sheet.character.id}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
        >
          View Sheet →
        </a>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Turn Order
          <input
            type="number"
            value={sheet.turnOrder}
            onChange={(event) =>
              updateTurnOrder(sheet.character.id, Number(event.target.value))
            }
            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Resilience ({effectiveResilience} / {maxResilience})
          <input
            type="number"
            max={effectiveResilience}
            value={sheet.character.resilience_current}
            onChange={(event) =>
              setResilienceCurrent(
                sheet.character.id,
                Number(event.target.value)
              )
            }
            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Reserves ({maxReserves})
          <input
            type="number"
            value={sheet.character.resilience_reserves}
            onChange={(event) =>
              setResilienceReserves(
                sheet.character.id,
                Number(event.target.value)
              )
            }
            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Action Points
          <input
            type="number"
            value={sheet.character.action_points}
            onChange={(event) =>
              setActionPoints(sheet.character.id, Number(event.target.value))
            }
            className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          />
        </label>
      </div>
      <div className="flex justify-around py-4 gap-2">
        {Object.entries(sheet.stats)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, value], k) => {
            if (key !== "character_id" && key !== "id") {
              return (
                <div
                  className="flex justify-around items-center rounded-2xl py-3 px-2 border border-[#5c4a33] bg-[#140f0a] flex-1"
                  key={k}
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
                    {key}
                  </p>
                  <div className="grid grid-cols-3 text-2xl font-semibold text-[#f0d9a8] text-center">
                    <p>
                      {penalties &&
                        Math.max(-2, Number(value) - penalties.statPenalty)}
                    </p>
                    <span className="font-extralight">/</span>
                    <p>{value}</p>
                  </div>
                </div>
              );
            }
          })}
      </div> */}
    </section>
  );
};

export default CombatPanel;
