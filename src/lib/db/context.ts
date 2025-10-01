import { createDatabaseContext } from "@/lib/context/database";
import { db } from "./db";

export const { DbProvider, useDatabase, useQuery } = createDatabaseContext(db);
