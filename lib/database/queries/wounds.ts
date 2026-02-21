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

export const deleteWound = async (woundId: number) => {
  // returns the deleted wound
  const deleted = await db
    .delete(wounds)
    .where(eq(wounds.id, woundId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The wound with id ${woundId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(wounds)
    .where(eq(wounds.characterId, deleted[0].characterId!));

  return query;
};

export const updateWound = async (woundId: number) => {};
