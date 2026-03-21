import { eq } from "drizzle-orm";
import { db } from "..";
import { characterTraits } from "../schema";
import { InsCharacterTrait } from "@/lib/types";

export const insertTrait = async (
  characterId: string,
  trait: InsCharacterTrait
) => {
  const query = await db
    .insert(characterTraits)
    .values({ ...trait, character_id: characterId })
    .returning();

  return query[0];
};

export const deleteTrait = async (traitId: number) => {
  // returns the deleted trait
  const deleted = await db
    .delete(characterTraits)
    .where(eq(characterTraits.id, traitId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The trait with id ${traitId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(characterTraits)
    .where(eq(characterTraits.character_id, deleted[0].character_id!));

  return query;
};
