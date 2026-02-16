"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { getPenalties } from "@/lib/utils";
import { useContext } from "react";

const Stats = () => {
  const { character, isLoading } = useContext(SheetContext);
  const labels = (stat: string) => {
    switch (stat.toLowerCase()) {
      case "phy":
        return "Physicality";
      case "vit":
        return "Vitality";
      case "sen":
        return "Sense";
      case "wil":
        return "Willpower";
      case "acu":
        return "Acuity";
      case "pre":
        return "Presence";
    }
  };

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  const { resilienceCurrent, resilienceMax, stats } = character;

  const shouldDisplayStat = (stat: string) => {
    return !(
      stat === null ||
      stat.toLowerCase() === "id" ||
      stat.toLowerCase() === "characterid"
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(stats).map(([stat, value], key) => (
        <>
          {shouldDisplayStat(stat) && value !== null && (
            <div
              key={key}
              className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
                  {stat}
                </p>
                <p className="text-lg font-semibold text-[#f0e4cf]">
                  {labels(stat)}
                </p>
              </div>
              <div className="text-2xl font-semibold text-[#f0d9a8]">
                {Math.max(
                  -2,
                  value -
                    getPenalties(resilienceMax, resilienceCurrent).statPenalty
                )}
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  );
};

export default Stats;
