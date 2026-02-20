"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { getBarColorClass, getBarState, getCurrentEffect } from "@/lib/utils";
import { useContext } from "react";

const Resilience = () => {
  const { character, isLoading, modifiers, handlers } =
    useContext(SheetContext);

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { resilienceCurrent, resilienceReserves } = character;
  const { maxResilience, maxReserves } = modifiers;
  const {
    handleResilienceDecrease,
    handleResilienceIncrease,
    handleReservesIncrease,
  } = handlers;

  const barColorClass = getBarColorClass(maxResilience, resilienceCurrent);
  const barState = getBarState(
    maxResilience,
    resilienceCurrent,
    resilienceReserves,
    maxReserves
  );

  const currentEffect = getCurrentEffect(maxResilience, resilienceCurrent);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[#f0e4cf]">Resilience</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#b7a387]">
          <span className="font-semibold">Current / Max</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResilienceDecrease}
              className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
              aria-label="Reduce resilience"
            >
              -
            </button>
            <input
              type="number"
              value={resilienceCurrent}
              onChange={(event) =>
                handleResilienceIncrease(Number(event.target.value))
              }
              min={0}
              max={maxResilience}
              className="w-20 rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-1 text-sm text-[#f0e4cf]"
            />
            <span className="text-[#8b6a3f]">/</span>
            <span className="min-w-[3.5rem] text-sm font-semibold text-[#f0e4cf]">
              {maxResilience}
            </span>
            <button
              type="button"
              onClick={() => handleResilienceIncrease()}
              className="h-7 w-7 rounded-full border border-[#5c4a33] bg-[#19130d] text-[#f0d9a8]"
              aria-label="Increase resilience"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="relative h-4 w-full overflow-hidden rounded-full border border-[#5c4a33] bg-[#19130d]">
          <div
            className={`h-full ${barColorClass}`}
            style={{ width: `${barState.currentPercent}%` }}
          />
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#5c4a33] bg-[#19130d]">
          <div
            className="h-full bg-gradient-to-r from-[#f5c542] to-[#ffd46b]"
            style={{ width: `${barState.reservesPercent}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#b7a387]">
          <span>Resilience Reserves:</span>
          <span className="rounded-full border border-[#8b6a3f] px-3 py-1 text-xs font-semibold text-[#f0d9a8]">
            {resilienceReserves}
          </span>
          <span className="text-xs text-[#8b6a3f]">/ {maxReserves}</span>
          <button
            type="button"
            onClick={() => handleReservesIncrease()}
            className="h-7 w-7 rounded-full border border-[#8b6a3f] bg-[#19130d] text-[#f0d9a8]"
            aria-label="Increase resilience reserves"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-2 grid gap-2 text-xs text-[#b7a387]">
        <div className="rounded-xl border border-[#5c4a33] bg-[#19130d] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b6a3f]">
            Current Effect
          </p>
          <p className="mt-1 text-sm text-[#f0e4cf]">
            {currentEffect.label}: {currentEffect.detail}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resilience;
