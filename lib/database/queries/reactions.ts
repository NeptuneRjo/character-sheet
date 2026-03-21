import { eq } from "drizzle-orm";
import { db } from "..";
import { InsCharacterReaction } from "@/lib/types";
import { characterReactions } from "../schema";

export const insertReaction = async (
  characterId: string,
  reaction: InsCharacterReaction
) => {
  const query = await db
    .insert(characterReactions)
    .values({ ...reaction, character_id: characterId })
    .returning();

  return query[0];
};

export const deleteReaction = async (reactionId: number) => {
  // returns the deleted reaction
  const deleted = await db
    .delete(characterReactions)
    .where(eq(characterReactions.id, reactionId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The reaction with id ${reactionId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(characterReactions)
    .where(eq(characterReactions.character_id, deleted[0].character_id!));

  return query;
};
