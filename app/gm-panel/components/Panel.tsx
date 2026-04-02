"use client";

import { useCharacterModifiers } from "@/lib/hooks/useCharacterModifiers";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { PhysicalBuilds, Sheet, StatLabels, Stats } from "@/lib/types";
import { useContext, useEffect } from "react";
import { Actions, Equipment, Reactions, Skills, Traits, Wounds } from ".";
import { Button } from "@/components";
import { getStatLabel } from "@/lib/utils";

interface Props {
  sheet: Sheet;
}

const Panel = ({ sheet }: Props) => {
  const { setters, saveCharacter } = useContext(GMPanelContext);
  const {
    setResilienceCurrent,
    setResilienceReserves,
    setStats,
    setActionPoints,
    setMoveSpeed,
    setPhysicalBuild,
  } = setters;

  const { modifiers, setCharacter } = useCharacterModifiers(sheet);

  useEffect(() => {
    setCharacter(sheet);
  }, [sheet]);

  const { maxResilience, effectiveResilience } = modifiers;

  return (
    <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6">
      <div className="mb-4 flex items-center justify-between gap-6 py-2">
        <h2 className="text-xl font-semibold text-[#f0e4cf] flex-1">
          {sheet.character.name}
        </h2>
        <Button
          variant="primary"
          onClick={() => saveCharacter(sheet.character.id)}
        >
          Save Character
        </Button>
        <a
          href={`/character/${sheet.character.id}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
        >
          View Sheet →
        </a>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Resilience Current
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
            Resilience Reserves
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
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8b6a3f]">
          Derived Max Resilience: {maxResilience} | Effective Resilience:
          {effectiveResilience}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Move Speed (m)
            <input
              type="number"
              value={sheet.character.baseMoveSpeed}
              onChange={(event) =>
                setMoveSpeed(sheet.character.id, Number(event.target.value))
              }
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Physical Build
            <select
              value={sheet.character.physical_build}
              onChange={(event) =>
                setPhysicalBuild(
                  sheet.character.id,
                  event.target.value as PhysicalBuilds
                )
              }
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            >
              <option value="Lithe">Lithe</option>
              <option value="Average">Average</option>
              <option value="Hulking">Hulking</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(sheet.stats)
            // sorts by the key values of stats
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value], k) => {
              if (key !== "character_id" && key !== "id") {
                return (
                  <label
                    className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]"
                    key={k}
                  >
                    {getStatLabel(key as keyof Stats)}
                    <input
                      type="number"
                      value={Number(value)}
                      onChange={(event) =>
                        setStats(
                          sheet.character.id,
                          key as keyof Omit<Stats, "character_id" | "id">,
                          Number(event.target.value)
                        )
                      }
                      className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                    />
                  </label>
                );
              }
            })}
        </div>
        <Skills sheet={sheet} />
        <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Traits, Equipment, Actions, Reactions
          </p>
          <div className="mt-3 grid gap-3 grid-cols-2">
            <Traits sheet={sheet} />
            <Equipment sheet={sheet} />
          </div>
          <div className="mt-3 grid gap-3 grid-cols-2">
            <Actions sheet={sheet} />
            <Reactions sheet={sheet} />
          </div>
        </div>
        <Wounds sheet={sheet} />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Start Turn</Button>
          <Button
            variant="primary"
            onClick={() => saveCharacter(sheet.character.id)}
          >
            Save Character
          </Button>
          <Button variant="secondary">Reset</Button>
        </div>
      </div>
    </section>
  );
};

export default Panel;
