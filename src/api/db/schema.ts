import { z } from "zod";

export const backupSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  data: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Backup = z.output<typeof backupSchema>;
export type NewBackup = z.input<typeof backupSchema>;

export type Database = {
  backups: Backup;
};
