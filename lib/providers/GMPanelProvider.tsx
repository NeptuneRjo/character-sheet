"use client";

import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import {
  Sheet,
  GMPanelContextType,
  PhysicalBuilds,
  StatLabels,
  CharacterSkill,
  InsCharacterSkill,
  Wound,
  InsWound,
  RequestBody,
  InsCharacterTrait,
  CharacterTrait,
  InsCharacterEquipment,
  CharacterEquipment,
} from "../types";
import { supabase } from "../supabaseClient";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before PanelContext was initialized`);
};

export const GMPanelContext = createContext<GMPanelContextType>({
  characters: [],
  isLoading: true,
  setters: {
    setMoveSpeed: () => initializationError("setMoveSpeed"),
    setActionPoints: () => initializationError("setActionPoints"),
    setResilienceReserves: () => initializationError("setResilienceReserves"),
    setResilienceCurrent: () => initializationError("setResilienceCurrent"),
    setPhysicalBuild: () => initializationError("setPhysicalBuild"),
    setStats: () => initializationError("setStats"),
  },
  addSkill: () => initializationError("addSkill"),
  addWound: () => initializationError("addWound"),
  getCharacters: () => initializationError("getCharacters"),
  removeSkill: () => initializationError("removeSkill"),
  healWound: () => initializationError("healWound"),
  addTrait: () => initializationError("addTrait"),
  removeTrait: () => initializationError("removeTrait"),
  addEquipment: () => initializationError("addEquipment"),
  removeEquipment: () => initializationError("removeEquipment"),
  updateEquipment: () => initializationError("updateEquipment"),
  addAction: () => initializationError("addAction"),
  removeAction: () => initializationError("removeAction"),
  addReaction: () => initializationError("addReaction"),
  removeReaction: () => initializationError("removeReaction"),
});

export const GMPanelProvider = ({ children }: { children: ReactNode }) => {
  const [characters, setCharacters] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getCharacters = async () => {
    setIsLoading(true);

    const stored = localStorage.getItem("gm-characters");
    if (stored) {
      const data = await JSON.parse(stored);
      setCharacters(data);
      setIsLoading(false);
      return;
    }

    fetch("/api/gm-panel")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("gm-characters", JSON.stringify(data));
        setCharacters(data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const channel = supabase.channel("gm-sync");
    channel
      .on("broadcast", { event: "*" }, ({ payload }) => {
        if (characters.length <= 0) return;
        const updatedCharacters = characters.map((character) => {
          // payload should just be the updated sheet
          if (character?.character?.id === payload?.character?.id) {
            return payload;
          }
          return character;
        });
        localStorage.setItem(
          "gm-characters",
          JSON.stringify(updatedCharacters)
        );
        setCharacters(updatedCharacters);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setCharacters, characters]);

  const updatePlayer = (characterId: string, sheet: Sheet) => {
    const updatedCharacters = characters.map((character) => {
      if (character.character.id === characterId) {
        return sheet;
      }
      return character;
    });

    setCharacters(updatedCharacters);
    localStorage.setItem("gm-characters", JSON.stringify(updatedCharacters));

    const channel = supabase.channel(`player:${characterId}`);
    channel.send({ type: "broadcast", event: "shout", payload: sheet });
  };

  const setMoveSpeed = (characterId: string, newBaseSpeed: number) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        character: {
          ...sheet.character,
          baseMoveSpeed: newBaseSpeed,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const setActionPoints = (characterId: string, actionPoints: number) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        character: {
          ...sheet.character,
          action_points: actionPoints,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const setResilienceCurrent = (
    characterId: string,
    resilienceCurrent: number
  ) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        character: {
          ...sheet.character,
          resilience_current: resilienceCurrent,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const setResilienceReserves = (
    characterId: string,
    resilienceReserves: number
  ) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        character: {
          ...sheet.character,
          resilience_reserves: resilienceReserves,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const setPhysicalBuild = (characterId: string, build: PhysicalBuilds) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        character: {
          ...sheet.character,
          physical_build: build,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const setStats = (characterId: string, stat: StatLabels, value: number) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const updated: Sheet = {
        ...sheet,
        stats: {
          ...sheet.stats,
          [stat]: value,
        },
      };
      updatePlayer(characterId, updated);
    }
  };

  const addSkill = (characterId: string, skill: InsCharacterSkill) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<InsCharacterSkill> = {
        characterId,
        body: skill,
      };
      fetch("/api/skills", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            skills: [...sheet.skills, data],
          };
          updatePlayer(characterId, updated);
        });
    }
  };

  const removeSkill = (characterId: string, skill: CharacterSkill) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<CharacterSkill> = {
        characterId,
        body: skill,
      };
      fetch("/api/skills", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            skills: [...data],
          };
          updatePlayer(characterId, updated);
        });
    }
  };

  const addWound = (characterId: string, wound: InsWound) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<InsWound> = {
        body: wound,
        characterId,
      };
      fetch("/api/wounds", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            wounds: [...sheet.wounds, data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const healWound = (
    characterId: string,
    wound: Wound,
    healed: Wound | null
  ) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<Wound> = {
        body: healed ?? wound,
        characterId,
      };
      fetch("/api/wounds", {
        method: healed ? "PATCH" : "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            wounds: [...data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const addTrait = (characterId: string, trait: InsCharacterTrait) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<InsCharacterTrait> = {
        body: trait,
        characterId,
      };
      fetch("/api/traits", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            traits: [...sheet.traits, data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const removeTrait = (characterId: string, trait: CharacterTrait) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<CharacterTrait> = {
        body: trait,
        characterId,
      };
      fetch("/api/traits", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            traits: [...data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const addEquipment = (
    characterId: string,
    equipment: InsCharacterEquipment
  ) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<InsCharacterEquipment> = {
        body: equipment,
        characterId,
      };
      fetch("/api/equipment", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            equipment: [...sheet.equipment, data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const removeEquipment = (
    characterId: string,
    equipment: CharacterEquipment
  ) => {
    const sheet = characters.find(
      (character) => character.character.id === characterId
    );

    if (sheet) {
      const body: RequestBody<CharacterEquipment> = {
        body: equipment,
        characterId,
      };
      fetch("/api/equipment", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          const updated: Sheet = {
            ...sheet,
            equipment: [...data],
          };
          updatePlayer(characterId, updated);
        })
        .catch((err) => console.log(err));
    }
  };

  const updateEquipment = () => {};

  const addAction = () => {};

  const removeAction = () => {};

  const addReaction = () => {};

  const removeReaction = () => {};

  const values = {
    characters,
    isLoading,
    setters: {
      setMoveSpeed,
      setActionPoints,
      setResilienceCurrent,
      setResilienceReserves,
      setPhysicalBuild,
      setStats,
    },
    addSkill,
    addWound,
    getCharacters,
    removeSkill,
    healWound,
    addTrait,
    removeTrait,
    addEquipment,
    removeEquipment,
    updateEquipment,
    addAction,
    removeAction,
    addReaction,
    removeReaction,
  };

  return (
    <GMPanelContext.Provider value={values}>{children}</GMPanelContext.Provider>
  );
};
