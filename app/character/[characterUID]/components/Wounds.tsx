"use client";

import { Button } from "@/components";
import { SheetContext } from "@/lib/providers/SheetProvider";
import { useContext, useState } from "react";

const Wounds = () => {
  const { sheet, isLoading, handlers } = useContext(SheetContext);

  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [damageType, setDamageType] = useState("Physical");

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  const { wounds } = sheet;
  const { handleHealWound, handleApplyDamage } = handlers;

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
          {/* <button
            type="button"
            onClick={() => handleApplyDamage(damageAmount, damageType)}
            className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
          >
            Apply
          </button> */}
          <Button onClick={() => handleApplyDamage(damageAmount, damageType)}>
            Apply
          </Button>
        </div>
        {wounds.length === 0 ? (
          <p className="mt-2 text-sm text-[#b7a387]">No wounds listed.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
            {wounds.map((wound, key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
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
    </div>
  );
};

export default Wounds;
