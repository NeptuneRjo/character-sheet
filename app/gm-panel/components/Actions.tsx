"use client";

import {
  Action,
  CharacterAction,
  CharacterActionSchema,
  InsCharacterAction,
  Sheet,
} from "@/lib/types";
import { actions } from "@/app/data";
import { useContext, useState } from "react";
import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { Button } from "@/components";

interface Props {
  sheet: Sheet;
}

const Actions = ({ sheet }: Props) => {
  const { addAction, removeAction } = useContext(GMPanelContext);
  const [selectedAction, setSelectedAction] = useState<string>(
    actions[0].action_id
  );

  const handleAddAction = () => {
    const action = actions.find(
      (action) => action.action_id === selectedAction
    );

    if (!action) {
      return;
    }

    const characterAction: InsCharacterAction = {
      action_id: action.action_id,
      character_id: sheet.character.id,
    };

    addAction(sheet.character.id, characterAction);
  };

  const handleRemoveAction = (action: CharacterAction) => {
    removeAction(sheet.character.id, action);
  };

  const characterActions = (data: CharacterActionSchema[]) => {
    return data.map((action) => {
      const actionData = actions.find(
        ({ action_id }) => action_id === action.action_id
      );
      if (!actionData) {
        throw new Error();
      }
      return { ...actionData, ...action };
    });
  };

  return (
    <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Actions
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value)}
          className="flex-1 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
        >
          {actions.map((action, key) => (
            <option key={key} value={action.action_id}>
              {action.name}
            </option>
          ))}
        </select>
        <Button onClick={() => handleAddAction()}>Add</Button>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-[#f0e4cf]">
        {characterActions(sheet.actions).map((action, key) => (
          <li
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2"
          >
            <div>
              <span>{action.name}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {action.cost} AP
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              <Button
                variant="secondary"
                onClick={() => handleRemoveAction(action)}
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

export default Actions;
