"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { useContext } from "react";

const Header = () => {
  const { character, isLoading, modifiers } = useContext(SheetContext);

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { name, physicalBuild } = character;
  const { carryCapacityKg, hitClass } = modifiers;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b7a387]">
          Character Sheet
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
          {name}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Hit Class
          </p>
          <p className="text-lg font-semibold text-[#f0d9a8]">{hitClass}</p>
        </div>
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Physical Build
          </p>
          <p className="text-lg font-semibold text-[#f0d9a8]">
            {physicalBuild}
          </p>
        </div>
        <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Carry Capacity
          </p>
          <p className="text-lg font-semibold text-[#f0d9a8]">
            {carryCapacityKg} kg
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
