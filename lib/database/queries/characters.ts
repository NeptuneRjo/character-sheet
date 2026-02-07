import { CharacterList } from "@/lib/types";
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

type Character = typeof characters.$inferSelect;
type Traits = typeof traits.$inferSelect;
type Stats = typeof stats.$inferSelect;
type Wounds = typeof wounds.$inferSelect;
type Equipment = typeof equipment.$inferSelect;
type Skills = typeof skills.$inferSelect & typeof characterSkills.$inferSelect;

type FullCharacter = Character & {
  traits: Traits[];
  stats: Stats | {};
  wounds: Wounds[];
  equipment: Equipment[];
  skills: Skills[];
};
/**
 * Retrieves the list of characters.
 */
export const getCharacters = async (): Promise<CharacterList[]> => {
  const query = await db.select().from(characters);
  return query;
};

/**
 * Retrieves individual character.
 */
export const getCharacter = async (
  characterUID: string
): Promise<FullCharacter> => {
  const traitsSubquery = db
    .select()
    .from(traits)
    .where(eq(traits.characterId, characters.id))
    .as("traits");
  const statsSubquery = db
    .select()
    .from(stats)
    .where(eq(stats.characterId, characters.id))
    .as("stats");
  const woundsSubquery = db
    .select()
    .from(wounds)
    .where(eq(wounds.characterId, characters.id))
    .as("wounds");
  const equipmentSubquery = db
    .select()
    .from(equipment)
    .where(eq(equipment.characterId, characters.id))
    .as("equipment");
  const skillsSubquery = db
    .select({
      skills,
      skillId: characterSkills.skillId,
      characterId: characterSkills.characterId,
      flatModifier: characterSkills.flatModifier,
      bonusDice: characterSkills.bonusDice,
    })
    .from(characterSkills)
    .leftJoin(skills, eq(characterSkills.skillId, skills.id))
    .where(eq(characterSkills.characterId, characters.id))
    .as("skills");

  const query = await db
    .select({
      characters,
      traits,
      stats,
      wounds,
      equipment,
      skills: {
        id: skills.id,
        name: skills.name,
        ability: skills.ability,
        utility: skills.utility,
        skillId: skillsSubquery.skillId,
        characterId: skillsSubquery.characterId,
        flatModifier: skillsSubquery.flatModifier,
        bonusDice: skillsSubquery.bonusDice,
      },
    })
    .from(characters)
    .leftJoinLateral(traitsSubquery, sql`true`)
    .leftJoinLateral(statsSubquery, sql`true`)
    .leftJoinLateral(woundsSubquery, sql`true`)
    .leftJoinLateral(equipmentSubquery, sql`true`)
    .leftJoinLateral(skillsSubquery, sql`true`)
    .where(eq(characters.characterUID, characterUID));

  const result = query.reduce<FullCharacter>((acc, cv) => {
    // the objects for this iteration
    const { characters, traits, stats, wounds, equipment, skills } = cv;

    // if the last iteration's object is not the same as this iteration's object, create a new object
    if (acc["characterUID"] !== characters!.characterUID) {
      // const { id, ...rest } = characters!;
      acc = {
        ...characters,
        traits: [],
        stats: {},
        wounds: [],
        equipment: [],
        skills: [],
      };
    }

    if (traits) {
      const isDupe = acc.traits.some((trait) => trait.id === traits.id);

      if (!isDupe) {
        acc.traits.push(traits);
      }
    }

    if (stats) {
      acc.stats = stats;
    }

    if (wounds) {
      const isDupe = acc.wounds.some((wound) => wound.id === wounds.id);

      if (!isDupe) {
        acc.wounds.push(wounds);
      }
    }

    if (equipment) {
      const isDupe = acc.equipment.some((item) => item.id === equipment.id);

      if (!isDupe) {
        acc.equipment.push(equipment);
      }
    }

    if (skills && characterSkills) {
      const isDupe = acc.skills.some((skill) => skill.id === skills.id);

      if (!isDupe) {
        acc.skills.push(skills);
      }
    }

    return acc;
  }, {} as any);

  return result;
};

/**
 * Create and retrieve a character.
 */
// export const createCharacter = async (): Promise<Character> => {};

/**
 * Update and retrieve a character.
 */
// export const updateCharacter = async (): Promise<Character> => {};
