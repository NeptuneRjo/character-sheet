"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { PhysicalBuilds, PostWoundBody, Wound } from "@/lib/types";
import {
  derivedThreshholdBase,
  getBuildModifiers,
  getDamageThreshold,
  getDerivedResilience,
  getDerivedResilienceMax,
  getHealedWound,
} from "@/lib/utils";
import { useContext, useState } from "react";

const Wounds = () => {
  const { character, isLoading, setCharacter, modifiers } =
    useContext(SheetContext);

  const [damageAmount, setDamageAmount] = useState("0");
  const [damageType, setDamageType] = useState("Physical");

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { wounds, stats, characterUID, resilienceCurrent } = character;
  const { buildModifiers } = modifiers;

  const handleApplyDamage = () => {
    const damageValue = Number(damageAmount);
    if (Number.isNaN(damageValue)) return;

    // const buildModifiers = getBuildModifiers(physicalBuild as PhysicalBuilds);
    const max = derivedThreshholdBase(stats);
    const threshold = getDamageThreshold(
      max,
      buildModifiers.thresholdBonus,
      damageValue
    );

    if (threshold === "Deadly") {
      return;
    }

    const body: PostWoundBody = {
      threshold,
      damageType,
      characterUID,
    };

    fetch("/api/wounds", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const newMax = getDerivedResilienceMax(stats, data);
        const newCurrent = getDerivedResilience(
          character?.resilienceCurrent,
          data.severity,
          newMax
        );
        setCharacter({
          ...character,
          wounds: [...character.wounds, data],
          // resilienceMax: newMax,
          resilienceCurrent: newCurrent,
        });
      });
  };

  const handleHealWound = (indexToRemove: number) => {
    const wound = wounds[indexToRemove];

    if (!wound) {
      return;
    }

    const healed = getHealedWound(wound);
    let updatedWounds: Wound[] = [];

    if (healed === null) {
      fetch(`/api/wounds/${indexToRemove}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          updatedWounds = data;
        });
      return;
    } else {
      fetch(`/api/wounds/${indexToRemove}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application-json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          updatedWounds = data;
        });
    }

    const maxResilience = getDerivedResilienceMax(stats, updatedWounds);
    const severityDelta = wound.severity - (healed.severity ?? 0);

    setCharacter({
      ...character,
      wounds,
      resilienceCurrent: Math.min(
        resilienceCurrent + severityDelta,
        maxResilience
      ),
    });
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
        <h2 className="text-lg font-semibold text-[#f0e4cf]">Wounds</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={0}
              value={damageAmount}
              onChange={(event) => setDamageAmount(event.target.value)}
              className="w-full rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
              placeholder="Damage"
            />
            <select
              value={damageType}
              onChange={(event) => setDamageType(event.target.value)}
              className="w-full rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            >
              <option>Piercing</option>
              <option>Slashing</option>
              <option>Bludgeoning</option>
              <option>Cleaving</option>
              <option>Fire</option>
              <option>Cold</option>
              <option>Lightning</option>
              <option>Poison</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleApplyDamage}
            className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
          >
            Apply
          </button>
        </div>
        {wounds.length === 0 ? (
          <p className="mt-2 text-sm text-[#b7a387]">No wounds listed.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
            {wounds.map(({ name, severity, id }, key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
              >
                <div>
                  <span>{name}</span>
                  <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    Sev {severity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleHealWound(id)}
                  className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                >
                  Heal
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wounds;
