"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { useContext } from "react";

const DamageThresholds = () => {
  const { character, isLoading, modifiers } = useContext(SheetContext);

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { buildModifiers, maxResilience } = modifiers;

  const trivialMax =
    Math.floor(maxResilience * 0.25) + buildModifiers.thresholdBonus;
  const lightMax =
    Math.floor(maxResilience * 0.5) + buildModifiers.thresholdBonus;
  const mediumMax =
    Math.floor(maxResilience * 0.9) + buildModifiers.thresholdBonus;
  const heavyMax =
    Math.floor(maxResilience * 1.25) + buildModifiers.thresholdBonus;
  const ranges = [
    { label: "Trivial", range: `0-${trivialMax}` },
    { label: "Light", range: `${trivialMax + 1}-${lightMax}` },
    { label: "Medium", range: `${lightMax + 1}-${mediumMax}` },
    { label: "Heavy", range: `${mediumMax + 1}-${heavyMax}` },
    { label: "Deadly", range: `${heavyMax + 1}+` },
  ];
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#f0e4cf]">
          Damage Thresholds
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ranges.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-[#f0d9a8]">
                {item.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DamageThresholds;
