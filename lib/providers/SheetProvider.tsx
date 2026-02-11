"use client";

import { createContext, ReactNode, useState } from "react";
import { Sheet, SheetContextType } from "../types";

export const SheetContext = createContext<SheetContextType>({
  character: null,
  isLoading: true,
  setCharacter: () => {
    throw new Error(
      "setCharacter was called before SheetContext was initialized."
    );
  },
  getCharacter: async () => {
    throw new Error(
      "getCharacter was called before SheetContext was initialized."
    );
  },
});

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getCharacter = async (characterUID: string) => {
    fetch(`/api/character/${characterUID}`)
      .then((res) => res.json())
      .then((data) => {
        setCharacter(data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const values = {
    character,
    isLoading,
    setCharacter,
    getCharacter,
  };

  return (
    <SheetContext.Provider value={values}>{children}</SheetContext.Provider>
  );
};
