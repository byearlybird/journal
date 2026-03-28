import { db } from "./db";
import {
  createEntryService,
  createIntentionService,
  createNoteService,
  createTagService,
  createTaskService,
} from "./services";

export const noteService = createNoteService(db);
export const taskService = createTaskService(db);
export const intentionService = createIntentionService(db);
export const entryService = createEntryService(db);
export const tagService = createTagService(db);
