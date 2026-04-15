type SyncMeta = {
  clock: number;
  node_id: string;
  is_deleted: number;
};

type Note = SyncMeta & {
  id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  status: "pinned" | null;
};

type SyncChanges = {
  table_name: string;
  row_id: string;
};

export type DBSchema = {
  notes: Note;
  sync_changes: SyncChanges;
};
