import { db } from "..";
import { reactions } from "../schema";

export const getReactions = async () => {
  const query = await db.select().from(reactions);
  return query;
};
