"use client";

import {
  CharacterTrait,
  CharacterTraitSchema,
  InsCharacterTrait,
  Sheet,
  Trait,
} from "@/lib/types";
import { traits } from "@/app/data";
import { useContext, useState } from "react";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";

interface Props {
  sheet: Sheet;
}

const Traits = ({ sheet }: Props) => {
  const { addTrait, removeTrait } = useContext(GMPanelContext);
  const [selectedTrait, setSelectedTrait] = useState<string>(
    traits[0].trait_id
  );

  const handleAddTrait = () => {
    const trait = traits.find((trait) => trait.trait_id === selectedTrait);

    if (!trait) {
      return;
    }

    const characterTrait: InsCharacterTrait = {
      ...trait,
      character_id: sheet.character.id,
    };

    addTrait(sheet.character.id, characterTrait);
  };

  const handleRemoveTrait = (trait: CharacterTrait) => {
    removeTrait(sheet.character.id, trait);
  };

  const characterTraits = (data: CharacterTraitSchema[]) => {
    return data.map((trait) => {
      const traitData = traits.find(
        ({ trait_id }) => trait_id === trait.trait_id
      );
      if (!traitData) {
        throw new Error();
      }
      return { ...traitData, ...trait };
    });
  };

  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Traits
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={selectedTrait}
          onChange={(event) => setSelectedTrait(event.target.value)}
          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
        >
          {traits.map((trait, key) => (
            <option key={key} value={trait.trait_id}>
              {trait.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleAddTrait()}
          className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
        >
          Add
        </button>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
        {characterTraits(sheet.traits).map((trait, key) => (
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
                onClick={() => handleRemoveTrait(trait)}
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
