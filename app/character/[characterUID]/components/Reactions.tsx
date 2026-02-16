"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { PhysicalBuilds } from "@/lib/types";
import {
  getEffectivePhysicality,
  getPenalties,
  getReactionPhysicalityBonus,
  getWardMax,
  spendAP,
} from "@/lib/utils";
import { useContext, useState } from "react";

const Reactions = () => {
  const { character, isLoading, setCharacter } = useContext(SheetContext);
  const [wardSpendAmount, setWardSpendAmount] = useState<number>(0);

  if (!character || isLoading) {
    return <div>Loading...</div>;
  }

  const {
    stats,
    resilienceMax,
    resilienceCurrent,
    physicalBuild,
    reactions,
    wardCurrent,
    isCaster,
    actionPoints,
  } = character;

  const wardMax = getWardMax(stats.wil);
  const penalties = getPenalties(resilienceMax, resilienceCurrent);
  const effectivePhysicality = getEffectivePhysicality(
    stats.phy,
    penalties.statPenalty
  );
  const reactionPhysicalityBonus = getReactionPhysicalityBonus(
    physicalBuild as PhysicalBuilds,
    effectivePhysicality
  );

  const defaultReactions = [
    {
      name: "Dodge",
      note: `Add 1d4 + ${reactionPhysicalityBonus} to Hit Class for a specific attack. Move one melee range out. If the attack still hits but could have caused it to miss, take half damage.`,
      cost: 1,
    },
    {
      name: "Parry",
      note: `Roll a weapon attack, if the roll matches or exceeds the attack roll, cause the attack to miss, if the attack still hits but the roll was over half the attack roll, you may take the dodge action for free.`,
      cost: 1,
    },
  ];

  const handleSpendApCost = (cost: number) => {
    if (cost <= 0) {
      return;
    }

    const { nextAp, nextResilience } = spendAP(
      cost,
      actionPoints,
      resilienceCurrent
    );

    setCharacter({
      ...character,
      resilienceCurrent: nextResilience,
      actionPoints: nextAp,
    });
  };

  const handleSpendWardCost = (cost: number) => {
    // const amount = Number(wardSpendAmount);
    if (Number.isNaN(cost) || cost <= 0) {
      return;
    }
    setCharacter({
      ...character,
      wardCurrent: Math.min(0, wardCurrent - cost),
    });
    // setSheet((prev) => ({
    //   ...prev,
    //   wardCurrent: Math.max(0, prev.wardCurrent - amount),
    // }));
  };

  const handleRefillWard = () => {
    // setSheet((prev) => ({
    //   ...prev,
    //   wardCurrent: Math.min(wardMax, 20),
    // }));
    setCharacter({ ...character, wardCurrent: Math.min(wardMax, 20) });
  };

  return (
    <div className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
      <h2 className="text-lg font-semibold text-[#f0e4cf]">Reactions</h2>
      <div className="mt-4 grid gap-2 text-sm text-[#f0e4cf]">
        {defaultReactions.map(({ name, cost, note }, key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSpendApCost(cost)}
            className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{name}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {cost} AP
              </span>
            </div>
            <p className="mt-2 text-sm text-[#b7a387]">{note}</p>
          </button>
        ))}
        {reactions.map(({ name, cost, note }, key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSpendApCost(cost)}
            className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-left text-sm text-[#f0e4cf] transition hover:border-[#8b6a3f]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{name}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                {cost} AP
              </span>
            </div>
            <p className="mt-2 text-sm text-[#b7a387]">{note}</p>
          </button>
        ))}
        {isCaster && (
          <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Ward</span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                2 AP
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8b6a3f]">
              Difficulty 8
            </p>
            <p className="mt-2 text-sm text-[#b7a387]">
              Track your ward points (max {wardMax}).
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSpendApCost(2);
                  handleRefillWard();
                  // setSheet((prev) => ({
                  //   ...prev,
                  //   wardCurrent: Math.min(wardMax, 20),
                  // }));
                }}
                className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Ward to 20
              </button>
              <span className="text-lg font-semibold text-[#f0d9a8]">
                {Math.min(wardCurrent, wardMax)}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                / {wardMax}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                value={wardSpendAmount}
                onChange={(event) =>
                  setWardSpendAmount(Number(event.target.value))
                }
                className="w-28 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                placeholder="Reduce"
              />
              <button
                type="button"
                onClick={() => {
                  handleSpendWardCost(wardSpendAmount);
                  // const amount = Number(wardSpendAmount);
                  // if (Number.isNaN(amount) || amount <= 0) {
                  //   return;
                  // }
                  // setSheet((prev) => ({
                  //   ...prev,
                  //   wardCurrent: Math.max(0, prev.wardCurrent - amount),
                  // }));
                }}
                className="rounded-full border border-[#8b6a3f] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8]"
              >
                Reduce Ward
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reactions;
