import { eq } from "drizzle-orm";
import { db } from "..";
import { characterEquipment } from "../schema";
import { CharacterEquipment, InsCharacterEquipment } from "@/lib/types";

export const insertEquipment = async (
  characterId: string,
  equipment: InsCharacterEquipment
) => {
  const query = await db
    .insert(characterEquipment)
    .values({ ...equipment, character_id: characterId })
    .returning();

  return query[0];
};

export const deleteEquipment = async (equipmentId: number) => {
  // returns the deleted equipment
  const deleted = await db
    .delete(characterEquipment)
    .where(eq(characterEquipment.id, equipmentId))
    .returning();

  if (!deleted[0]) {
    throw new Error(`The item with id ${equipmentId} was not deleted.`);
  }

  const query = await db
    .select()
    .from(characterEquipment)
    .where(eq(characterEquipment.character_id, deleted[0].character_id!));

  return query;
};

export const updateEquipment = async (equipmentUpdate: CharacterEquipment) => {
  const updated = await db
    .update(characterEquipment)
    .set(equipmentUpdate)
    .where(eq(characterEquipment.id, equipmentUpdate.id))
    .returning();

  if (!updated[0]) {
    throw new Error(`The item with id ${equipmentUpdate.id} was not updated.`);
  }

  const query = await db
    .select()
    .from(characterEquipment)
    .where(eq(characterEquipment.character_id, updated[0].character_id!));

  return query;
};
