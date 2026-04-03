import type { Generated } from "kysely";

export type EntryRow = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "note" | "task" | "intention";
  status: string | null;
  originId: string | null;
  labelId: string | null;
  isDeleted: number;
};

export type LabelRow = {
  id: string;
  name: string;
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};

export type EntrySearchMetaRow = {
  entryId: string;
  plainText: string;
};

export type Database = {
  entries: EntryRow;
  labels: LabelRow;
  entrySearchMeta: EntrySearchMetaRow;
  _changelog: {
    id: Generated<number>;
    recordId: string;
    recordType: string;
    payload: string;
  };
  _sync_meta: {
    key: "cursor";
    value: string;
  };
};
