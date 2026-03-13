import { format, parseISO } from "date-fns";

export function TextContent({ content, editedAt }: { content: string; editedAt: string | null }) {
  const editedTime = editedAt ? format(parseISO(editedAt), "M/d/yy h:mm a") : null;

  return (
    <section className="flex-1 px-4 py-2 pb-2">
      <div className="rounded-md p-4 items-center flex whitespace-pre-line">{content}</div>
      {editedTime && (
        <time
          className="flex items-center gap-2 px-4 text-sm text-cloud-medium"
          dateTime={editedTime}
        >
          Edited {editedTime}
        </time>
      )}
    </section>
  );
}
