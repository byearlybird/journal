import { createStorage } from "./storage";

export * from "./repos";
export * from "./schema";

export const storage = createStorage({ dbName: "notebook-2", tableName: "entries" });
