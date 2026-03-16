"use client";

import { GMPanelContext } from "@/lib/providers/GMPanelProvider";
import { useContext, useEffect, useState } from "react";
import { Login, Panel } from ".";

const GMPanel = () => {
  const { characters, isLoading, getCharacters } = useContext(GMPanelContext);

  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if (isAuthorized) {
        await getCharacters();
      }
    })();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return <Login setIsAuthorized={setIsAuthorized} />;
  }
  if (isLoading || characters.length <= 0) {
    return <div>loading...</div>;
  }

  return (
    <div className="grid gap-6">
      {characters?.map((character, key) => (
        <Panel character={character} key={key} />
      ))}
    </div>
  );
};

export default GMPanel;
