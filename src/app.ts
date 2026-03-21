import { db } from "./db";
import { createIntentionService, createNoteService } from "./services";
import { createGoalService } from "./services/goal-service";

export const noteService = createNoteService(db);
export const intentionService = createIntentionService(db);
export const goalService = createGoalService(db);
