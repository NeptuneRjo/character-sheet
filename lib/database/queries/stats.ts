import { Stats } from "@/lib/types";
import { db } from "..";
import { stats } from "../schema";
import { eq } from "drizzle-orm";

export const updateStats = async (statId: number, stat: Stats) => {
  const updated = await db
    .update(stats)
    .set(stat)
    .where(eq(stats.id, statId))
    .returning();

  if (!updated[0]) {
    throw new Error(`The stat with id ${statId} was not updated.`);
  }

  return updated[0];
};
