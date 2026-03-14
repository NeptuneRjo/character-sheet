import { eq } from "drizzle-orm";
import { db } from "..";
import { characterTraits } from "../schema";

export const getTraits = async (characterId: string) => {
  const query = await db
    .select()
    .from(characterTraits)
    .where(eq(characterTraits.character_id, characterId));
  return query;
};
