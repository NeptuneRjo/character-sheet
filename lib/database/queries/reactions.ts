import { eq } from "drizzle-orm";
import { db } from "..";
import { characterReactions } from "../schema";

export const getReactions = async (characterId: string) => {
  const query = await db
    .select()
    .from(characterReactions)
    .where(eq(characterReactions.character_id, characterId));
  return query;
};
