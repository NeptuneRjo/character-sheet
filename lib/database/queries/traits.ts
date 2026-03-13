import { db } from "..";
import { traits } from "../schema";

export const getTraits = async () => {
  const query = await db.select().from(traits);
  return query;
};
