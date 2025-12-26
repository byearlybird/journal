import type { Entry } from "@/lib/db";

type DialogMode =
  | { type: "none" }
  | { type: "create-entry" }
  | { type: "view-entry"; entry: Entry }
  | { type: "add-comment"; entry: Entry };

export const getEntryFromDialogMode = (mode: DialogMode): Entry | undefined => {
  if (mode.type === "view-entry" || mode.type === "add-comment") {
    return mode.entry;
  }
  return undefined;
};
