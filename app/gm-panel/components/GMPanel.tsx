"use client";

import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { useContext, useEffect, useState } from "react";
import {
  Actions,
  Equipment,
  Login,
  Reactions,
  Skills,
  Traits,
  Wounds,
} from ".";
import { PhysicalBuilds, StatLabels, Stats, Wound } from "@/lib/types";

const GMPanel = () => {
  const { characters, isLoading, getCharacters, setters } =
    useContext(GMPanelContext);

  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  const labels = (stat: string) => {
    switch (stat.toLowerCase()) {
      case "phy":
        return "Physicality";
      case "vit":
        return "Vitality";
      case "sen":
        return "Sense";
      case "wil":
        return "Willpower";
      case "acu":
        return "Acuity";
      case "pre":
        return "Presence";
    }
  };

  const shouldDisplayStat = (stat: string) => {
    return !(
      stat === null ||
      stat.toLowerCase() === "id" ||
      stat.toLowerCase() === "character_id"
    );
  };

  useEffect(() => {
    (async () => {
      if (isAuthorized) {
        await getCharacters();
      }
    })();
  }, [isAuthorized]);

  const {
    setMoveSpeed,
    setResilienceCurrent,
    setResilienceReserves,
    setActionPoints,
    setPhysicalBuild,
    setStats,
  } = setters;

  const maxResilience = (stats: Stats) => {
    const base = 4 + 2 * stats.vit;
    return Math.max(0, base);
  };

  if (!isAuthorized) {
    return <Login setIsAuthorized={setIsAuthorized} />;
  }
  if (isLoading || characters.length <= 0) {
    return <div>loading...</div>;
  }

  return (
    <div className="grid gap-6">
      {characters?.map((character, key) => (
        <section
          key={key}
          className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#f0e4cf]">
              {character.character.name}
            </h2>
            <a
              href={`/character/${character.character.id}`}
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
                  value={character.character.resilience_current}
                  onChange={(event) =>
                    setResilienceCurrent(
                      character.character.id,
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
                  value={character.character.resilience_reserves}
                  onChange={(event) =>
                    setResilienceReserves(
                      character.character.id,
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
                  value={character.character.action_points}
                  onChange={(event) =>
                    setActionPoints(
                      character.character.id,
                      Number(event.target.value)
                    )
                  }
                  className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                />
              </label>
            </div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8b6a3f]">
              Derived Max Resilience: {maxResilience(character.stats)}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                Move Speed (m)
                <input
                  type="number"
                  value={character.character.baseMoveSpeed}
                  onChange={(event) =>
                    setMoveSpeed(
                      character.character.id,
                      Number(event.target.value)
                    )
                  }
                  className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                Physical Build
                <select
                  value={character.character.physical_build}
                  onChange={(event) =>
                    setPhysicalBuild(
                      character.character.id,
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
              {Object.entries(character.stats).map(([stat, value], key) => {
                if (shouldDisplayStat(stat) && value !== null) {
                  return (
                    <label
                      key={key}
                      className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]"
                    >
                      {labels(stat)}
                      <input
                        type="number"
                        value={value}
                        onChange={(event) =>
                          setStats(
                            character.character.id,
                            stat as StatLabels,
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
            <Skills character={character} />
            <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                Traits, Equipment, Actions, Reactions
              </p>
              <div className="mt-3 grid gap-3 grid-cols-2">
                <Traits character={character} />
                <Equipment character={character} />
              </div>
              <div className="mt-3 grid gap-3 grid-cols-2">
                <Actions character={character} />
                <Reactions character={character} />
              </div>
            </div>
            <Wounds sheet={character} />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                // onClick={() => handleStartTurn(character.id)}
                className="rounded-full border border-[#8b6a3f] bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Start Turn
              </button>
              <button
                type="button"
                // onClick={() => handleReset(character.id)}
                className="rounded-full border border-[#5c4a33] bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b7a387]"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default GMPanel;
