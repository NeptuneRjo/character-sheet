import { InsWound, Wound } from "@/lib/types";
import { characters, wounds } from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";

export const insertWound = async (characterId: string, wound: InsWound) => {
  const query = await db
    .insert(wounds)
    .values({ ...wound, character_id: characterId })
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
    .where(eq(wounds.character_id, deleted[0].character_id!));

  return query;
};

export const updateWound = async (woundUpdate: Wound) => {
  const updated = await db
    .update(wounds)
    .set(woundUpdate)
    .where(eq(wounds.id, woundUpdate.id))
    .returning();

  if (!updated[0]) {
    throw new Error(`The wound with id ${woundUpdate.id} was not updated.`);
  }

  const query = await db
    .select()
    .from(wounds)
    .where(eq(wounds.character_id, updated[0].character_id!));

  return query;
};
