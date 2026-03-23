"use client";

import { SheetContext } from "@/lib/providers/SheetProvider";
import { useContext } from "react";

const Stats = () => {
  const { sheet, isLoading, modifiers } = useContext(SheetContext);
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

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  const { stats } = sheet;
  const { penalties } = modifiers;

  const shouldDisplayStat = (stat: string) => {
    return !(
      stat === null ||
      stat.toLowerCase() === "id" ||
      stat.toLowerCase() === "character_id"
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            ACU
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Acuity</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.acu - penalties.statPenalty)}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            PHY
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Physicality</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.phy - penalties.statPenalty)}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            PRE
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Presence</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.pre - penalties.statPenalty)}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            SEN
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Sense</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.sen - penalties.statPenalty)}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            VIT
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Vitality</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.vit - penalties.statPenalty)}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#140f0a] px-5 py-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            WIL
          </p>
          <p className="text-lg font-semibold text-[#f0e4cf]">Willpower</p>
        </div>
        <div className="text-2xl font-semibold text-[#f0d9a8]">
          {penalties && Math.max(-2, stats.wil - penalties.statPenalty)}
        </div>
      </div>
    </div>
  );
};

export default Stats;
