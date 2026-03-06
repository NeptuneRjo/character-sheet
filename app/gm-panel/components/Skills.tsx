"use client";

import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { CharacterSkill, InsCharacterSkill, Sheet, Skill } from "@/lib/types";
import { useContext, useState } from "react";

interface Props {
  skills: Skill[];
  character: Sheet;
}

const Skills = ({ skills, character }: Props) => {
  const { addSkill, removeSkill } = useContext(GMPanelContext);

  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(0);
  const [flatModifier, setFlatModifier] = useState<number>(2);
  const [bonusDice, setBonusDice] = useState<string>("1d4");

  const handleAddSkill = () => {
    const modifiers: InsCharacterSkill = {
      character_id: character.character.id,
      skill_id: skills[selectedSkillIndex].id,
      flat_modifier: flatModifier,
      bonus_dice: bonusDice,
    };
    addSkill(
      character.character.character_uid,
      skills[selectedSkillIndex],
      modifiers
    );
  };

  const handleRemoveSkill = (skill: CharacterSkill) => {
    removeSkill(character.character.character_uid, skill);
  };

  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Skill Bonuses
      </p>
      <div className="mt-3 grid gap-3">
        <div className="grid gap-3 rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Skill
            <select
              value={selectedSkillIndex}
              onChange={(event) =>
                setSelectedSkillIndex(Number(event.target.value))
              }
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            >
              {skills.map(({ name, ability }, key) => (
                <option key={key} value={key}>
                  {name} ({ability})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Flat Modifier
            <input
              type="number"
              value={flatModifier}
              onChange={(event) => setFlatModifier(Number(event.target.value))}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Bonus Dice
            <input
              type="text"
              value={bonusDice}
              onChange={(event) => setBonusDice(event.target.value)}
              className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
              placeholder="e.g. d6, 2d4"
            />
          </label>
          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="self-end rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
          >
            Add
          </button>
        </div>

        <div className="rounded-lg border border-[#5c4a33] bg-[#140f0a] px-3 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
            Modified Skills
          </p>
          {character.skills.length === 0 ? (
            <p className="mt-2 text-sm text-[#b7a387]">
              No skill bonuses applied.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
              {character.skills.map((skill, key) => (
                <li
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
                >
                  <div>
                    <span>{skill.name}</span>
                    <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                      ({skill.ability})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                    {skill.flat_modifier !== 0 && (
                      <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                        Flat{" "}
                        {skill.flat_modifier > 0
                          ? `+${skill.flat_modifier}`
                          : skill.flat_modifier}
                      </span>
                    )}
                    {skill.bonus_dice !== "" && (
                      <span className="rounded-full border border-[#5c4a33] px-2 py-1">
                        Bonus {skill.bonus_dice}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full border border-[#8b6a3f] bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Skills;
