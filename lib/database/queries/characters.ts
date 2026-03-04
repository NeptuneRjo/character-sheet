import { Character, Sheet, Stats } from "@/lib/types";
import { db } from "../index";
import {
  actions,
  characters,
  characterSkills,
  equipment,
  reactions,
  skills,
  stats,
  traits,
  wounds,
} from "../schema";
import { eq, getTableColumns, sql } from "drizzle-orm";

/**
 * Retrieves the list of characters.
 */
export const getCharacters = async (): Promise<Character[]> => {
  const query = await db.select().from(characters);
  return query;
};

/**
 * Retrieves individual character.
 */
export const getCharacter = async (character_uid: string): Promise<Sheet> => {
  const traitsSubquery = db
    .select()
    .from(traits)
    .where(eq(traits.character_id, characters.id))
    .as("traits");
  const statsSubquery = db
    .select()
    .from(stats)
    .where(eq(stats.character_id, characters.id))
    .as("stats");
  const woundsSubquery = db
    .select()
    .from(wounds)
    .where(eq(wounds.character_id, characters.id))
    .as("wounds");
  const equipmentSubquery = db
    .select()
    .from(equipment)
    .where(eq(equipment.character_id, characters.id))
    .as("equipment");
  const actionsSubquery = db
    .select()
    .from(actions)
    .where(eq(actions.character_id, characters.id))
    .as("actions");
  const reactionsSubquery = db
    .select()
    .from(reactions)
    .where(eq(reactions.character_id, characters.id))
    .as("reactions");
  const skillsSubquery = db
    .select({
      skills,
      skill_id: characterSkills.skill_id,
      character_id: characterSkills.character_id,
      flat_modifier: characterSkills.flat_modifier,
      bonus_dice: characterSkills.bonus_dice,
    })
    .from(characterSkills)
    .leftJoin(skills, eq(characterSkills.skill_id, skills.id))
    .where(eq(characterSkills.character_id, characters.id))
    .as("skills");

  const query = await db
    .select({
      characters,
      traits,
      stats,
      wounds,
      equipment,
      actions,
      reactions,
      skills: {
        id: skills.id,
        name: skills.name,
        ability: skills.ability,
        utility: skills.utility,
        skill_id: skillsSubquery.skill_id,
        character_id: skillsSubquery.character_id,
        flat_modifier: skillsSubquery.flat_modifier,
        bonus_dice: skillsSubquery.bonus_dice,
      },
    })
    .from(characters)
    .leftJoinLateral(traitsSubquery, sql`true`)
    .leftJoinLateral(statsSubquery, sql`true`)
    .leftJoinLateral(woundsSubquery, sql`true`)
    .leftJoinLateral(equipmentSubquery, sql`true`)
    .leftJoinLateral(actionsSubquery, sql`true`)
    .leftJoinLateral(reactionsSubquery, sql`true`)
    .leftJoinLateral(skillsSubquery, sql`true`)
    .where(eq(characters.character_uid, character_uid));

  const result = query.reduce<Sheet>((acc, cv) => {
    // the objects for this iteration
    const {
      characters,
      traits,
      stats,
      wounds,
      equipment,
      actions,
      reactions,
      skills,
    } = cv;

    // if the last iteration's object is not the same as this iteration's object, create a new object
    // doesn't work if there is no optional (?) chaining
    if (acc?.character?.character_uid !== characters!.character_uid) {
      // const { id, ...rest } = characters!;
      acc = {
        character: {} as Character,
        traits: [],
        stats: {} as Stats,
        wounds: [],
        equipment: [],
        skills: [],
        reactions: [],
        actions: [],
      };
    }

    if (characters) {
      acc.character = characters;
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

    if (actions) {
      const isDupe = acc.actions.some((action) => action.id === actions.id);

      if (!isDupe) {
        acc.actions.push(actions);
      }
    }

    if (reactions) {
      const isDupe = acc.reactions.some(
        (reaction) => reaction.id === reactions.id
      );

      if (!isDupe) {
        acc.reactions.push(reactions);
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
export const updateCharacter = async (
  character_uid: string,
  update: Partial<Character>
): Promise<Character> => {
  const updated = await db
    .update(characters)
    .set(update)
    .where(eq(characters.character_uid, character_uid))
    .returning();

  if (!updated[0]) {
    throw new Error(
      `The character with character_uid ${character_uid} was not updated`
    );
  }

  // should be the updated character
  return updated[0];
};
