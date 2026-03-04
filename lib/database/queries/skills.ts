import { db } from "..";
import { skills } from "../schema";

export const getSkills = async () => {
  const query = await db.select().from(skills);
  return query;
};
