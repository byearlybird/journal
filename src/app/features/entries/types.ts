import type { Task } from "@/app/idb";

type BaseTimelineItem = {
  id: string;
  content: string;
  createdAt: string;
};

type NoteTimelineItem = BaseTimelineItem & {
  type: "note";
};

type TaskTimelineItem = BaseTimelineItem & {
  type: "task";
  status: Task["status"];
};

export type TimelineItem = NoteTimelineItem | TaskTimelineItem;
