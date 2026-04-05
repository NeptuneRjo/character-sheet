"use client";

import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { useContext, useEffect, useState } from "react";
import { CombatView, Login, Panel } from ".";
import { Button } from "@/components";

const GMPanel = () => {
  const { characters, isLoading, getCharacters, createCharacter } =
    useContext(GMPanelContext);

  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [characterName, setCharacterName] = useState<string>("");

  const [isCombatView, setIsCombatView] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (isAuthorized) {
        await getCharacters();
      }
    })();
  }, [isAuthorized]);

  const handleCreateCharacter = () => {
    createCharacter(characterName.length <= 0 ? undefined : characterName);
    setCharacterName("");
  };

  if (!isAuthorized) {
    return <Login setIsAuthorized={setIsAuthorized} />;
  }
  if (isLoading || characters.length <= 0) {
    return <div>loading...</div>;
  }

  return (
    <>
      <a
        href="/"
        className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
      >
        ← Back to selection
      </a>
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b7a387]">
          GM Panel
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
          {isCombatView ? "Combat View" : "Adventure Mode"}
        </h1>
        <p className="text-sm text-[#b7a387]">
          {isCombatView
            ? "Track initiative, turn flow, and combat state."
            : "Update character values and pass turns to reset AP and tick wounds."}
        </p>
      </header>
      <div className="grid gap-6">
        <div className="flex gap-4">
          <Button
            variant={isCombatView ? "secondary" : "primary"}
            onClick={() => setIsCombatView(false)}
          >
            Adventure Mode
          </Button>
          <Button
            variant={isCombatView ? "primary" : "secondary"}
            onClick={() => setIsCombatView(true)}
          >
            Combat View
          </Button>
        </div>
        {isCombatView ? (
          <CombatView sheets={characters} />
        ) : (
          <>
            <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6 grid grid-cols-2">
              <div className="flex flex-col align-end gap-3 p-4">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                  Create a Character
                  <input
                    type="text"
                    placeholder="Tony Gobliano"
                    value={characterName}
                    onChange={(event) => setCharacterName(event.target.value)}
                    className="rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
                  />
                </label>
                <Button
                  onClick={() => handleCreateCharacter()}
                  className="w-50"
                >
                  Create
                </Button>
              </div>
              <div className="flex justify-center flex-col items-end gap-4 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#b7a387]">
                  Enter Combat Mode
                </p>
                <Button onClick={() => console.log()}>Start</Button>
              </div>
            </section>
            {characters?.map((character, key) => (
              <Panel sheet={character} key={key} />
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default GMPanel;
