import { eq } from "drizzle-orm";
import { db } from "..";
import { characterEquipment } from "../schema";

export const getEquipment = async (characterId: string) => {
  const query = await db
    .select()
    .from(characterEquipment)
    .where(eq(characterEquipment.character_id, characterId));
  return query;
};
