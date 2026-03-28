export type EntryRow = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "note" | "task" | "intention";
  status: string | null;
  originId: string | null;
};

export type TagRow = {
  id: string;
  name: string;
};

export type EntryTagRow = {
  id: string;
  entryId: string;
  tagId: string;
};

export type Database = {
  entries: EntryRow;
  tags: TagRow;
  entryTags: EntryTagRow;
};
