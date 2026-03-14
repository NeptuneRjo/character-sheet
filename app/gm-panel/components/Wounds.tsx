"use client";

import {
  DamageThresholds,
  Sheet,
  Wound,
  woundDefinitions,
  WoundLabels,
  woundTypes,
} from "@/lib/types";
import { useContext, useEffect, useMemo, useState } from "react";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { createWound, getHealedWound, getWoundName } from "@/lib/utils";
import { updateWound } from "@/lib/database/queries";
import { useCharacterModifiers } from "@/lib/hooks/useCharacterModifiers";

interface Props {
  sheet: Sheet;
}

const Wounds = ({ sheet }: Props) => {
  const { wounds, character } = sheet;
  const { addWound, healWound } = useContext(GMPanelContext);

  const [woundName, setWoundName] = useState<WoundLabels>(woundTypes[0]);
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [damageType, setDamageType] = useState("Physical");

  const { setCharacter, modifiers } = useCharacterModifiers(sheet);

  useEffect(() => {
    setCharacter(sheet);
  }, [sheet]);

  const { damageThresholds } = modifiers;

  const handleApplyDamage = () => {
    const { trivialMax, lightMax, mediumMax, heavyMax } = damageThresholds;

    let threshold: DamageThresholds = "Trivial";
    if (damageAmount > trivialMax) threshold = "Light";
    if (damageAmount > lightMax) threshold = "Medium";
    if (damageAmount > mediumMax) threshold = "Heavy";
    if (damageAmount > heavyMax) threshold = "Deadly";

    if (threshold === "Deadly") return;

    const woundName = getWoundName(threshold, damageType);
    const wound = createWound(woundName);

    addWound(character.id, wound);
  };

  const handleApplyWound = () => {
    const wound = createWound(woundName);

    addWound(character.id, wound);
  };

  const handleHealWound = (wound: Wound) => {
    const healed = getHealedWound(wound);

    healWound(character.id, wound, healed);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex-1 flex gap-3">
          <select
            value={woundName}
            onChange={(event) =>
              setWoundName(event.target.value as WoundLabels)
            }
            className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          >
            {woundTypes.map((wound, key) => (
              <option key={key} value={wound}>
                {wound}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleApplyWound()}
            className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
          >
            Add Wound
          </button>
        </div>
        <div className="flex-1 flex gap-3">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={0}
              value={damageAmount}
              onChange={(event) => setDamageAmount(Number(event.target.value))}
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
            onClick={() => handleApplyDamage()}
            className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
          >
            Apply
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
          Current Wounds
        </p>
        {wounds.length === 0 ? (
          <p className="mt-2 text-sm text-[#b7a387]">No wounds listed.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
            {wounds.map((wound, key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-2"
              >
                <div>
                  <span>{wound.name}</span>
                  <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    Sev {wound.severity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleHealWound(wound)}
                  className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                >
                  Heal
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Wounds;
