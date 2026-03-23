"use client";

import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { useContext, useEffect, useState } from "react";
import { Login, Panel } from ".";
import { Button } from "@/components";

const GMPanel = () => {
  const { characters, isLoading, getCharacters, createCharacter } =
    useContext(GMPanelContext);

  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [characterName, setCharacterName] = useState<string>("");

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
    <div className="grid gap-6">
      <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6 grid grid-cols-2">
        <div className="flex flex-col gap-3 p-4">
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
          <Button onClick={() => handleCreateCharacter()} className="w-50">
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
    </div>
  );
};

export default GMPanel;
