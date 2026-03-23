import { InsStats, Stats } from "@/lib/types";
import { db } from "..";
import { stats } from "../schema";
import { eq } from "drizzle-orm";

export const updateStats = async (statId: number, update: Stats) => {
  const updated = await db
    .update(stats)
    .set(update)
    .where(eq(stats.id, statId))
    .returning();

  if (!updated[0]) {
    throw new Error(`The stat with id ${statId} was not updated.`);
  }

  return updated[0];
};

export const insertStats = async (data: InsStats) => {
  const query = await db.insert(stats).values(data).returning();
  return query[0];
};
