"use client";
import { equipment } from "@/app/data";
import { SheetContext } from "@/lib/providers/SheetProvider";
import { CharacterEquipmentSchema } from "@/lib/types";
import { useContext } from "react";

const Equipment = () => {
  const { sheet, isLoading } = useContext(SheetContext);

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  // const { equipment } = sheet;

  const characterEquipment = (data: CharacterEquipmentSchema[]) => {
    return data.map((item) => {
      const equipmentData = equipment.find(
        ({ equipment_id }) => equipment_id === item.equipment_id
      );
      if (!equipmentData) {
        throw new Error();
      }
      return { ...equipmentData, ...item };
    });
  };

  return (
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
      <h3 className="text-lg font-semibold text-[#f0e4cf]">Equipment</h3>
      {equipment.length === 0 ? (
        <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
          {characterEquipment(sheet.equipment).map((equipment, key) => (
            <li
              className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
              key={key}
            >
              {equipment.name}: {equipment.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Equipment;
