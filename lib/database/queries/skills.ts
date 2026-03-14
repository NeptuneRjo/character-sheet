import { eq } from "drizzle-orm";
import { db } from "..";
import { characterSkills } from "../schema";

export const getSkills = async (characterId: string) => {
  const query = await db
    .select()
    .from(characterSkills)
    .where(eq(characterSkills.character_id, characterId));
  return query;
};
