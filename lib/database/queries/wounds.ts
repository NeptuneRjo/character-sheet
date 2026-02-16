import { InsWound } from "@/lib/types";
import { characters, wounds } from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";

export const insertWound = async (charUID: string, wound: InsWound) => {
  const parent = await db
    .select()
    .from(characters)
    .where(eq(characters.characterUID, charUID));

  if (!parent[0]) {
    throw new Error(`Unable to find a charater with the UID: ${charUID}`);
  }

  const query = await db
    .insert(wounds)
    .values({ ...wound, characterId: parent[0].id })
    .returning();

  return query[0];
};
