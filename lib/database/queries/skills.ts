import { eq } from "drizzle-orm";
import { db } from "..";
import { characterSkills } from "../schema";
import { InsCharacterSkill } from "@/lib/types";

export const insertSkill = async (
  characterId: string,
  skill: InsCharacterSkill
) => {
  const query = await db
    .insert(characterSkills)
    .values({ ...skill, character_id: characterId })
    .returning();

  return query[0];
};

export const deleteSkill = async (skillId: number) => {
  // returns the deleted skill
  const deleted = await db
    .delete(characterSkills)
    .where(eq(characterSkills.id, skillId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The skill with id ${skillId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(characterSkills)
    .where(eq(characterSkills.character_id, deleted[0].character_id!));

  return query;
};
