"use client";

import {
  DamageThresholds,
  Equipment,
  Header,
  Resilience,
  Skills,
  Stats,
  Traits,
  Wounds,
  Actions,
  Reactions,
} from ".";
import { useContext, useEffect } from "react";
import { SheetContext } from "@/lib/providers/SheetProvider";

interface Props {
  characterUID: string;
}

const CharacterSheet = ({ characterUID }: Props) => {
  const { sheet, isLoading, getSheet, isTurn, combatStart } =
    useContext(SheetContext);

  useEffect(() => {
    if (!sheet) {
      (async () => {
        await getSheet(characterUID);
      })();
    }
  }, []);

  if (!sheet || isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {combatStart && (
        <section
          className={`rounded-2xl border flex items-center justify-between ${isTurn ? "border-[#ba9a71]" : "border-[#5c4a33]"} bg-[#140f0a] p-6`}
        >
          <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
            Combat Mode
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-[#b7a387]">
            {isTurn && "It's Your Turn!"}
          </p>
        </section>
      )}
      <div
        className={`rounded-2xl border ${isTurn ? "border-[#ba9a71]" : "border-[#5c4a33]"} bg-[#140f0a] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.35)]`}
      >
        <section className="flex flex-col gap-8">
          <Header />
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Resilience />
              <Stats />
            </div>
            <DamageThresholds />
            <Wounds />
            <Actions />
            <Reactions />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Traits />
            <Equipment />
            <Skills />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CharacterSheet;
