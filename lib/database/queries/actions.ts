import { db } from "..";
import { actions } from "../schema";

export const getActions = async () => {
  const query = await db.select().from(actions);
  return query;
};
