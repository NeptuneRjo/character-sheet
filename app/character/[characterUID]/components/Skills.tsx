"use client";

import { skills } from "@/app/data";
import { SheetContext } from "@/lib/providers/SheetProvider";
import { BuildModifiers, CharacterSkillSchema } from "@/lib/types";
import { useContext } from "react";

const Skills = () => {
  const { sheet, isLoading, modifiers } = useContext(SheetContext);

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  // const { skills } = sheet;
  const { buildModifiers } = modifiers;

  const hasBuildModifier = (skillName: string) => {
    let normalizedSkillName = skillName?.replace(" ", "").toLowerCase();

    for (let key in buildModifiers) {
      if (Object.hasOwn(buildModifiers, key)) {
        if (key.toLowerCase() === normalizedSkillName) return true;
      }
    }
    return false;
  };

  const characterSkills = (data: CharacterSkillSchema[]) => {
    return data.map((skill) => {
      const skillData = skills.find(
        ({ skill_id }) => skill_id === skill.skill_id
      );
      if (!skillData) {
        throw new Error();
      }
      return { ...skillData, ...skill };
    });
  };

  return (
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
      <h3 className="text-lg font-semibold text-[#f0e4cf]">Skills</h3>
      {skills.length === 0 ? (
        <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
          {characterSkills(sheet.skills).map(
            ({ name, bonus_dice, flat_modifier, ability }, key) => {
              return (
                <li
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                >
                  <div>
                    <span>{name}</span>
                    <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      ({ability})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    {flat_modifier !== 0 && (
                      <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                        Flat{" "}
                        {flat_modifier > 0
                          ? `+${flat_modifier}`
                          : flat_modifier}
                      </span>
                    )}
                    <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                      Bonus {bonus_dice}
                    </span>
                    {hasBuildModifier(name) && (
                      <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                        Build x{buildModifiers[name as keyof BuildModifiers]}
                      </span>
                    )}
                  </div>
                </li>
              );
            }
          )}
        </ul>
      )}
    </div>
  );
};

export default Skills;
