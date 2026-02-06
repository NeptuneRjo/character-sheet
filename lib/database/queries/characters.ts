import { Character, CharacterList } from "@/lib/types";
import { db } from "../index";
import {
  characters,
  characterSkills,
  equipment,
  skills,
  stats,
  traits,
  wounds,
} from "../schema";
import { eq, getTableColumns, sql } from "drizzle-orm";

/**
 * Retrieves the list of characters.
 */
export const getCharacters = async (): Promise<CharacterList> => {
  const query = await db.select().from(characters);
  return query;
};

/**
 * Retrieves individual character.
 */
export const getCharacter = async (
  characterUID: string
): Promise<Character> => {
  const query = await db
    .select({
      characters,
      traits,
      stats,
      wounds,
      equipment,
      characterSkills,
      skills,
    })
    .from(characters)
    .fullJoin(traits, eq(characters.id, traits.characterId))
    .fullJoin(stats, eq(characters.id, stats.characterId))
    .fullJoin(wounds, eq(characters.id, wounds.characterId))
    .fullJoin(equipment, eq(characters.id, equipment.characterId))
    .fullJoin(characterSkills, eq(characters.id, characterSkills.characterId))
    .fullJoin(skills, eq(characterSkills.skillId, skills.id))
    .where(eq(characters.characterUID, characterUID));

  type Character = typeof characters.$inferSelect;
  type Traits = typeof traits.$inferSelect;
  type Stats = typeof stats.$inferSelect;
  type Wounds = typeof wounds.$inferSelect;
  type Equipment = typeof equipment.$inferSelect;
  type Skills = typeof skills.$inferSelect &
    typeof characterSkills.$inferSelect;

  type FullCharacter = Omit<Character, "id"> & {
    traits: Omit<Traits, "id" | "characterId">[];
    stats: Omit<Stats, "id" | "characterId"> | {};
    wounds: Omit<Wounds, "id" | "characterId">[];
    equipment: Omit<Equipment, "id" | "characterId">[];
    skills: Omit<Skills, "id" | "characterId" | "skillId">[];
  };

  const result = query.reduce<FullCharacter>((acc, cv) => {
    // the objects for this iteration
    const {
      characters,
      traits,
      stats,
      wounds,
      equipment,
      skills,
      characterSkills,
    } = cv;

    // if the last iteration's object is not the same as this iteration's object, create a new object
    if (acc["characterUID"] !== characters!.characterUID) {
      const { id, ...rest } = characters!;
      acc = {
        ...rest,
        traits: [],
        stats: {},
        wounds: [],
        equipment: [],
        skills: [],
      };
    }

    if (traits) {
      const { id, characterId, ...rest } = traits;

      // I think CharacterSkills is forcing *-to-many relationships to return   twice.
      // Maybe fixable within the query itself but I couldnt figure it out.
      const isDupe = acc.traits.some((trait) => trait.name === traits.name);

      if (!isDupe) {
        acc.traits.push({ ...rest });
      }
    }

    if (stats) {
      const { id, characterId, ...rest } = stats;
      acc.stats = { ...rest };
    }

    if (wounds) {
      const { id, characterId, ...rest } = wounds;

      const isDupe = acc.wounds.some((wound) => wound.name === wounds.name);

      if (!isDupe) {
        acc.wounds.push({ ...rest });
      }
    }

    if (equipment) {
      const { id, characterId, ...rest } = equipment;

      const isDupe = acc.equipment.some((item) => item.name === equipment.name);

      if (!isDupe) {
        acc.equipment.push({ ...rest });
      }
    }

    if (skills && characterSkills) {
      const { id, ...rest } = skills;
      const { bonusDice, flatModifier } = characterSkills;

      const isDupe = acc.skills.some((skill) => skill.name === skills.name);

      if (!isDupe) {
        acc.skills.push({ bonusDice, flatModifier, ...rest });
      }
    }

    return acc;
  }, {} as any);

  return result as any;
};

/**
 * Create and retrieve a character.
 */
// export const createCharacter = async (): Promise<Character> => {};

/**
 * Update and retrieve a character.
 */
// export const updateCharacter = async (): Promise<Character> => {};
