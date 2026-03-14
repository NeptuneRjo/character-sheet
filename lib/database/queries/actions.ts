import { eq } from "drizzle-orm";
import { db } from "..";
import { characterActions } from "../schema";

export const getActions = async (characterId: string) => {
  const query = await db
    .select()
    .from(characterActions)
    .where(eq(characterActions.character_id, characterId));
  return query;
};
