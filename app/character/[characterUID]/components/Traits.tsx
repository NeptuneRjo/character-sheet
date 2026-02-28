"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { useContext } from "react";

const Traits = () => {
  const { sheet, isLoading } = useContext(SheetContext);

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  const { traits } = sheet;

  return (
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
      <h3 className="text-lg font-semibold text-[#f0e4cf]">Traits</h3>
      {traits.length === 0 ? (
        <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
          {traits.map((trait, key) => (
            <li
              className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
              key={key}
            >
              {trait.name}: {trait.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Traits;
