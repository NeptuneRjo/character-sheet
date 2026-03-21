import { eq } from "drizzle-orm";
import { db } from "..";
import { InsCharacterAction } from "@/lib/types";
import { characterActions } from "../schema";

export const insertAction = async (
  characterId: string,
  action: InsCharacterAction
) => {
  const query = await db
    .insert(characterActions)
    .values({ ...action, character_id: characterId })
    .returning();

  return query[0];
};

export const deleteAction = async (actionId: number) => {
  // returns the deleted action
  const deleted = await db
    .delete(characterActions)
    .where(eq(characterActions.id, actionId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The action with id ${actionId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(characterActions)
    .where(eq(characterActions.character_id, deleted[0].character_id!));

  return query;
};
