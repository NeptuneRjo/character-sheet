"use client";

import { actions } from "@/app/data";
import { SheetContext } from "@/lib/providers/SheetProvider";
import { CharacterActionSchema } from "@/lib/types";
import { useContext } from "react";

const Actions = () => {
  const { sheet, isLoading, modifiers, handlers } = useContext(SheetContext);

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  const { action_points } = sheet.character;
  const { effectiveMoveSpeed } = modifiers;
  const { handleSpendAp } = handlers;

  const defaultActions = [
    { name: `Move (${effectiveMoveSpeed}m)`, cost: 1 },
    { name: "Take Cover", cost: 1 },
    { name: "Hide", cost: 1 },
    { name: "Weapon Attack", cost: 2 },
  ];

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
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#f0e4cf]">Actions</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSpendAp(1)}
            className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
            aria-label="Spend action point"
          >
            -
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        Action Points
      </p>
      <div className="mt-2 flex items-center gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-4 w-4 rounded-full border border-[#8b6a3f] ${
              index < action_points ? "bg-[#f0d9a8]" : "bg-[#19130d]"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
        {action_points} / 4
      </p>
      <div className="mt-4 grid gap-2 text-sm text-[#f0e4cf]">
        {defaultActions.map((action, key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSpendAp(action.cost)}
            className="flex items-center justify-between rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
          >
            <div>
              <span>{action.name}</span>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              {action.cost} AP
            </span>
          </button>
        ))}
        {characterActions(sheet.actions).map((action, key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSpendAp(action.cost)}
            className="flex items-center justify-between rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
          >
            <div>
              <span>{action.name}</span>
              {action.note && (
                <p className="mt-1 text-xs text-[#b7a387]">{action.note}</p>
              )}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
              {action.cost} AP
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Actions;
