import { db } from "..";
import { equipment } from "../schema";

export const getEquipment = async () => {
  const query = await db.select().from(equipment);
  return query;
};
