import { db } from "@/db/client";
import { type Intention } from "@/db/schema";

export const intentionRepo = {
  async findAll(): Promise<Intention[]> {
    return await db.selectFrom("intentions").selectAll().orderBy("month", "desc").execute();
  },
};
