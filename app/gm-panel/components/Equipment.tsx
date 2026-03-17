"use client";

import { CharacterEquipment, InsCharacterEquipment, Sheet } from "@/lib/types";
import { equipment } from "@/app/data";
import { useContext, useState } from "react";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";

interface Props {
  sheet: Sheet;
}

const Equipment = ({ sheet }: Props) => {
  const { addEquipment, removeEquipment } = useContext(GMPanelContext);
  const [selectedEquipment, setSelectedEquipment] = useState<string>(
    equipment[0].equipment_id
  );

  const handleAddTrait = () => {
    const item = equipment.find(
      (equipment) => equipment?.equipment_id === selectedEquipment
    );

    if (!item) {
      return;
    }

    const characterEquipment: InsCharacterEquipment = {
      ...item,
      character_id: sheet.character.id,
    };

    addEquipment(sheet.character.id, characterEquipment);
  };

  const handleRemoveEquipment = (equipment: CharacterEquipment) => {
    removeEquipment(sheet.character.id, equipment);
  };

  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Equipment
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={selectedEquipment}
          onChange={(event) => setSelectedEquipment(event.target.value)}
          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
        >
          {equipment.map((equipment, key) => (
            <option key={key} value={equipment.equipment_id}>
              {equipment.name}
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
        {sheet.equipment.map((equipment, key) => (
          <li
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
          >
            <div>
              <span>{equipment.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {equipment.description}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              <button
                type="button"
                onClick={() => handleRemoveEquipment(equipment)}
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

export default Equipment;
