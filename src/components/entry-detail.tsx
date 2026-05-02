import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { MenuRoot, Menu, MenuTrigger, MenuItem } from "@/components/shared/menu";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CheckIcon,
  CheckSquareIcon,
  DiamondIcon,
  DotsThreeVerticalIcon,
  PushPinSimpleIcon,
  SquareIcon,
  XIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { useStore } from "@nanostores/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatLongDate, formatTime } from "@/utils/dates";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { moodService } from "@/services/mood-service";
import { useDBQuery } from "@/hooks/use-db-query";
import { useEntry } from "@/hooks/use-entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { labelsService } from "@/services/label-service";
import { $selectedEntryId, closeEntryDetail } from "@/stores/entry-detail";
import { moodColor } from "@/utils/mood-color";
import { moodLabel } from "@/utils/mood-label";
import { Button } from "./shared/button";
import { LabelPicker } from "./label-picker";

type TimelineView = DBSchema["timeline"];

export function EntryDetail() {
  const id = useStore($selectedEntryId);

  return (
    <Drawer.Root
      open={id !== null}
      swipeDirection="right"
      onOpenChange={(open) => {
        if (!open) closeEntryDetail();
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 bg-backdrop data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
        <Drawer.Viewport className="fixed top-safe-top bottom-safe-bottom left-safe-left right-safe-right flex items-stretch justify-end p-2">
          <Drawer.Popup className="relative w-full rounded-2xl md:max-w-2/3 lg:max-w-1/2 h-full bg-surface outline outline-border transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
            <Drawer.Content className="h-full flex flex-col">
              {id && <EntryDetailContent id={id} />}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function EntryDetailContent({ id }: { id: string }) {
  const results = useDBQuery((db) => db.selectFrom("timeline").selectAll().where("id", "=", id));
  const entry = results?.[0] ?? null;

  if (!entry) return null;

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between border-b border-dashed border-border">
        <Drawer.Title className="text-lg font-bold">
          {formatLongDate(entry.created_at)}
          <span className="ms-2 text-sm font-normal text-foreground-muted">
            {formatTime(entry.created_at)}
          </span>
        </Drawer.Title>
        <div className="flex gap-2">
          <MenuRoot>
            <MenuTrigger variant="outline">
              <DotsThreeVerticalIcon />
            </MenuTrigger>
            <Menu>
              <MenuItem
                variant="destructive"
                onClick={() => {
                  if (entry.type === "note") notesService.delete(entry.id);
                  else if (entry.type === "task") taskService.delete(entry.id);
                  else moodService.delete(entry.id);
                  closeEntryDetail();
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </MenuRoot>
          <Drawer.Close render={(props) => <Button {...props} variant="outline" />}>
            <XIcon />
          </Drawer.Close>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
          {entry.type === "task" && entry.status && <TaskStatusRow status={entry.status} />}
          {entry.type === "mood" && entry.value !== null && <MoodValueRow value={entry.value} />}
          {entry.type !== "mood" && <EntryContentEditor key={entry.id} entry={entry} />}
        </div>
      </div>

      <div className="border-t border-dashed border-border p-4 flex items-center justify-between">
        <EntryLabelPicker entry={entry} />
        <div className="flex gap-2">
          <EntryActions entry={entry} />
        </div>
      </div>
    </>
  );
}

function EntryContentEditor({ entry }: { entry: TimelineView }) {
  const content = entry.content ?? "";
  const [value, setValue] = useState(content);
  const trimmed = value.trim();
  const dirty = trimmed.length > 0 && trimmed !== content.trim();

  function save() {
    if (!dirty) return;
    if (entry.type === "note") notesService.updateContent(entry.id, trimmed);
    else if (entry.type === "task") taskService.updateContent(entry.id, trimmed);
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
        }}
        className="w-full bg-transparent text-foreground font-serif whitespace-pre-wrap resize-none outline-none field-sizing-content rounded-lg -mx-2 px-2 py-1 hover:bg-surface-tint focus:bg-surface-tint transition-colors"
      />
      {dirty && (
        <div className="flex justify-end">
          <Button onClick={save}>Save changes</Button>
        </div>
      )}
    </div>
  );
}

function EntryLabelPicker({ entry }: { entry: TimelineView }) {
  const row = useEntry(entry.type, entry.id);

  return (
    <LabelPicker
      value={row?.label ?? null}
      onValueChange={(id) => labelsService.setEntryLabel(entry.type, entry.id, id)}
    />
  );
}

function TaskStatusRow({ status }: { status: TaskTable["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <div className="flex gap-2 items-center text-sm text-foreground-muted mb-4">
      {status === "complete" ? (
        <CheckSquareIcon className="size-4.5 text-accent" />
      ) : status === "cancelled" ? (
        <XSquareIcon className="size-4.5 text-foreground-muted" />
      ) : status === "deferred" ? (
        <ArrowSquareRightIcon className="size-4.5 text-foreground-muted" />
      ) : (
        <SquareIcon className="size-4.5" />
      )}
      <span>{label}</span>
    </div>
  );
}

function EntryActions({ entry }: { entry: TimelineView }) {
  if (entry.type === "note") {
    const isPinned = entry.pinned === 1;
    return (
      <Button variant="outline" onClick={() => notesService.togglePin(entry.id)}>
        <PushPinSimpleIcon weight={isPinned ? "fill" : "regular"} />
        {isPinned ? "Pinned" : "Pin"}
      </Button>
    );
  }

  if (entry.type === "mood") return null;

  return <TaskActions entry={entry} />;
}

function MoodValueRow({ value }: { value: number }) {
  return (
    <div className="flex gap-2 items-center text-sm text-foreground-muted mb-4">
      <DiamondIcon className="size-4" style={{ color: moodColor(value / 100) }} />
      <span>{moodLabel(value)}</span>
    </div>
  );
}

function TaskActions({ entry }: { entry: TimelineView }) {
  const task = useEntry("task", entry.id);
  const today = useTodayDate();
  const isPriorTask = task ? task.date < today : false;

  if (entry.status === "incomplete") {
    return (
      <>
        <Button variant="outline" onClick={() => taskService.setStatus(entry.id, "cancelled")}>
          <XIcon />
          Cancel
        </Button>
        {isPriorTask && (
          <Button variant="outline" onClick={() => taskService.rolloverTask(entry.id)}>
            <ArrowSquareRightIcon />
            Defer
          </Button>
        )}
        <Button variant="outline" onClick={() => taskService.setStatus(entry.id, "complete")}>
          <CheckIcon />
          Complete
        </Button>
      </>
    );
  }

  if (entry.status === "complete" || entry.status === "cancelled") {
    return (
      <Button variant="outline" onClick={() => taskService.setStatus(entry.id, "incomplete")}>
        <ArrowCounterClockwiseIcon />
        Reopen
      </Button>
    );
  }

  return null;
}
