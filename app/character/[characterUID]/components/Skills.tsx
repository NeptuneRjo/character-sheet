"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { BuildModifiers, PhysicalBuilds } from "@/lib/types";
import { getBuildModifiers } from "@/lib/utils";
import { useContext } from "react";

const Skills = () => {
  const { character, isLoading } = useContext(SheetContext);

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { physicalBuild, skills } = character;
  const buildModifiers = getBuildModifiers(physicalBuild as PhysicalBuilds);

  const hasBuildModifier = (skillName: string) => {
    let normalizedSkillName = skillName.replace(" ", "").toLowerCase();

    for (let key in buildModifiers) {
      if (Object.hasOwn(buildModifiers, key)) {
        if (key.toLowerCase() === normalizedSkillName) return true;
      }
    }
    return false;
  };

  return (
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
      <h3 className="text-lg font-semibold text-[#f0e4cf]">Skills</h3>
      {skills.length === 0 ? (
        <p className="mt-2 text-sm text-[#b7a387]">None listed.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-[#f0e4cf]">
          {skills.map(({ name, bonusDice, flatModifier, ability }) => {
            return (
              <li
                key={name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2"
              >
                <div>
                  <span>{name}</span>
                  <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    ({ability})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                  {flatModifier !== 0 && (
                    <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                      Flat{" "}
                      {flatModifier > 0 ? `+${flatModifier}` : flatModifier}
                    </span>
                  )}
                  <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                    Bonus {bonusDice}
                  </span>
                  {hasBuildModifier(name) && (
                    <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                      Build x{buildModifiers[name as keyof BuildModifiers]}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Skills;
