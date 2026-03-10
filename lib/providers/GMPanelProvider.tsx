"use client";

import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import {
  Character,
  Sheet,
  GMPanelContextType,
  Skill,
  RequestBody,
  Payload,
  PhysicalBuilds,
  Stats,
  StatLabels,
  CharacterSkill,
  InsCharacterSkill,
  Wound,
  DamageMaxes,
  InsWound,
} from "../types";
import { supabase } from "../supabaseClient";
import { DamageThresholds } from "@/app/character/[characterUID]/components";

const initializationError = (func: string) => {
  throw new Error(`${func} was called before PanelContext was initialized`);
};

export const GMPanelContext = createContext<GMPanelContextType>({
  characters: [],
  isLoading: true,
  skills: [],
  getModifiers: () => initializationError("getModifiers"),
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
  getSkills: () => initializationError("getSkills"),
  removeSkill: () => initializationError("removeSkill"),
  healWound: () => initializationError("healWound"),
});

export const GMPanelProvider = ({ children }: { children: ReactNode }) => {
  const [characters, setCharacters] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const channel = supabase.channel("gm-sync");
    channel
      .on("broadcast", { event: "*" }, ({ payload }) => {
        const { data, table, event } = payload as Payload;
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, characters, setCharacters]);

  const getCharacters = async () => {
    setIsLoading(true);
    fetch("/api/gm-panel")
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const getSkills = async () => {
    setIsLoading(true);
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        setSkills(data);
        setIsLoading(false);
      });
  };

  const getModifiers = (
    character: Sheet
  ): {
    maxResilience: number;
    effectiveMoveSpeed: number;
    damageThresholds: DamageMaxes;
  } => {
    const { stats } = character;

    const base = 4 + 2 * stats.vit;
    const maxResilience = Math.max(0, base);

    return {
      maxResilience: 0,
      effectiveMoveSpeed: 0,
      damageThresholds: {
        lightMax: 0,
        trivialMax: 0,
        heavyMax: 0,
        mediumMax: 0,
      },
    };
  };

  useEffect(() => {
    const channel = supabase.channel("gm-sync");
    channel
      .on("broadcast", { event: "*" }, ({ payload }) => {
        const { data, table, event } = payload as Payload;
        if (characters.length <= 0) return;
        if (table === "GM-SYNC" && event === "GM-SYNC") {
          const updatedCharacters = characters.map((character) => {
            if (
              character?.character?.character_uid ===
              data?.character?.character_uid
            ) {
              // data should just be the updated sheet, but we destructure the current sheet just in case.
              return { ...character, ...data };
            }
            return character;
          });
          setCharacters(updatedCharacters);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setCharacters, characters]);

  /**
   * Update the character section of the player's sheet
   * @param characterUID
   * @param update
   */
  const updateCharacter = (
    characterUID: string,
    update: Partial<Character>
  ) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "UPDATE",
      table: "characters",
      data: update,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Update the stats section of the player's sheet
   * @param characterUID
   * @param update
   */
  const updateStats = (characterUID: string, update: Partial<Stats>) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "UPDATE",
      table: "stats",
      data: update,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Add a skill to the skills section of the player's sheet
   * @param characterUID
   * @param skill
   */
  const addSkills = (characterUID: string, skill: CharacterSkill) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "INSERT",
      table: "character_skills",
      data: skill,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Remove a skill from the skills section of the player's sheet
   * @param characterUID
   * @param skill
   */
  const removeSkills = (characterUID: string, skill: CharacterSkill) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "DELETE",
      table: "character_skills",
      data: skill,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Add a wound to the wounds section of the player's sheet
   * @param characterUID
   * @param wound
   */
  const addWounds = (characterUID: string, wound: Wound | InsWound) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "INSERT",
      table: "wounds",
      data: wound,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Remove a wound from the wounds section of the player's sheet
   * @param characterUID
   * @param wound
   */
  const removeWounds = (characterUID: string, wound: Wound) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "DELETE",
      table: "wounds",
      data: wound,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  /**
   * Update a wound in the wounds section of the player's sheet
   * @param characterUID
   * @param update
   */
  const updateWounds = (characterUID: string, update: Partial<Wound>) => {
    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      event: "UPDATE",
      table: "wounds",
      data: update,
    };
    channel.send({ type: "broadcast", event: "shout", payload: payload });
  };

  const setMoveSpeed = (characterUID: string, newBaseSpeed: number) => {
    updateCharacter(characterUID, { baseMoveSpeed: newBaseSpeed });
  };

  const setActionPoints = (characterUID: string, value: number) => {
    updateCharacter(characterUID, { action_points: value });
  };

  const setResilienceCurrent = (characterUID: string, value: number) => {
    updateCharacter(characterUID, { resilience_current: value });
  };

  const setResilienceReserves = (characterUID: string, value: number) => {
    updateCharacter(characterUID, { resilience_reserves: value });
  };

  const setPhysicalBuild = (characterUID: string, value: PhysicalBuilds) => {
    updateCharacter(characterUID, { physical_build: value });
  };

  const setStats = (characterUID: string, stat: StatLabels, value: number) => {
    updateStats(characterUID, { [stat]: value });
  };

  const addSkill = (
    characterUID: string,
    skill: Skill,
    modifiers: InsCharacterSkill
  ) => {
    const character = characters.find(
      ({ character }) => character.character_uid === characterUID
    );

    if (!character) return;

    const charSkill = {
      ...skill,
      ...{
        skill_id: modifiers.skill_id ?? skill.id,
        character_id: modifiers.character_id ?? character.character.id,
        flat_modifier: modifiers.flat_modifier ?? 2,
        bonus_dice: modifiers.bonus_dice ?? "1d4",
      },
    };

    addSkills(characterUID, charSkill);
  };

  const removeSkill = (characterUID: string, skill: CharacterSkill) => {
    removeSkills(characterUID, skill);
  };

  const addWound = (characterUID: string, wound: InsWound) => {
    addWounds(characterUID, wound);
  };

  const healWound = (
    characterUID: string,
    wound: Wound,
    healed: Wound | null
  ) => {
    if (healed) {
      updateWounds(characterUID, healed);
    } else {
      removeWounds(characterUID, wound);
    }
  };

  const values = {
    characters,
    isLoading,
    skills,
    getModifiers,
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
    getSkills,
    removeSkill,
    healWound,
  };

  return (
    <GMPanelContext.Provider value={values}>{children}</GMPanelContext.Provider>
  );
};
