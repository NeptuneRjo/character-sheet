"use client";

import {
  CharacterReaction,
  CharacterReactionSchema,
  InsCharacterReaction,
  Reaction,
  Sheet,
} from "@/lib/types";
import { reactions } from "@/app/data";
import { useContext, useState } from "react";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { Button } from "@/components";

interface Props {
  sheet: Sheet;
}

const Reactions = ({ sheet }: Props) => {
  const { addReaction, removeReaction } = useContext(GMPanelContext);
  const [selectedReaction, setSelectedReaction] = useState<string>(
    reactions[0].reaction_id
  );

  const handleAddReaction = () => {
    const reaction = reactions.find(
      (reaction) => reaction.reaction_id === selectedReaction
    );

    if (!reaction) {
      return;
    }

    const characterReaction: InsCharacterReaction = {
      reaction_id: reaction.reaction_id,
      character_id: sheet.character.id,
    };

    addReaction(sheet.character.id, characterReaction);
  };

  const handleRemoveReaction = (action: CharacterReaction) => {
    removeReaction(sheet.character.id, action);
  };

  const characterReactions = (data: CharacterReactionSchema[]) => {
    return data.map((reaction) => {
      const reactionData = reactions.find(
        ({ reaction_id }) => reaction_id === reaction.reaction_id
      );
      if (!reactionData) {
        throw new Error();
      }
      return { ...reactionData, ...reaction };
    });
  };

  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Reactions
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={""}
          onChange={(event) => console.log()}
          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
        >
          {reactions.map((reaction, key) => (
            <option key={key} value={reaction.name}>
              {reaction.name}
            </option>
          ))}
        </select>
        <Button onClick={() => handleAddReaction()}>Add</Button>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
        {characterReactions(sheet.reactions).map((reaction, key) => (
          <li
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
          >
            <div>
              <span>{reaction.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {reaction.cost} AP
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              <Button
                onClick={() => handleRemoveReaction(reaction)}
                variant="secondary"
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reactions;
