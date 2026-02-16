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
  const { character, isLoading, getCharacter } = useContext(SheetContext);

  useEffect(() => {
    if (!character) {
      (async () => {
        await getCharacter(characterUID);
      })();
    }
  }, []);

  if (!character || isLoading) {
    return <div>loading...</div>;
  }

  return (
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
  );
};

export default CharacterSheet;
