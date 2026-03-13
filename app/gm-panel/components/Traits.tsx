"use client";

import { Sheet, Trait } from "@/lib/types";

interface Props {
  traits: Trait[];
  character: Sheet;
}

const Traits = ({ traits, character }: Props) => {
  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Traits
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={""}
          onChange={(event) => console.log()}
          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
        >
          {traits.map((trait, key) => (
            <option key={key} value={trait.name}>
              {trait.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          // onClick={() => handleApplyWound()}
          className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
        >
          Add
        </button>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
        {character.traits.map((trait, key) => (
          <li
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
          >
            <div>
              <span>{trait.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {trait.description}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              <button
                type="button"
                // onClick={() => handleRemoveSkill(skill)}
                className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Traits;
