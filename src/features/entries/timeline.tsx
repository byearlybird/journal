import { formatTime } from "@app/utils/date-utils";
import { CheckCircleIcon, CircleIcon, SquareIcon } from "@phosphor-icons/react";
import type { TimelineItem } from "./types";
import { Button as BaseButton } from "@base-ui/react";
import { useRouter } from "@tanstack/react-router";

export function Timeline({
  entries,
  size = "default",
}: {
  entries: TimelineItem[];
  size?: "default" | "compact";
}) {
  const router = useRouter();

  const handleClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      router.navigate({ to: "/note/$id", params: { id: entry.id } });
    } else if (entry.type === "task") {
      router.navigate({ to: "/task/$id", params: { id: entry.id } });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          {/* Left side: dot and line */}
          <div className="flex flex-col items-center">
            {entry.type === "note" ? (
              <SquareIcon className="size-4 text-white/50" />
            ) : entry.status === "complete" ? (
              <CheckCircleIcon className="size-4 text-white/50" />
            ) : (
              <CircleIcon className="size-4 text-white/50" />
            )}
            {index < entries.length - 1 && (
              <div className="w-px flex-1 border-r border-white/10 border-dotted my-1" />
            )}
          </div>

          {/* Right side: time and content */}
          <BaseButton
            nativeButton={false}
            render={<div />}
            onClick={() => handleClick(entry)}
            className={size === "compact" ? "flex-1 pb-4 min-h-16" : "flex-1 pb-4 min-h-20"}
          >
            <div className={size === "compact" ? "text-xs text-white/50" : "text-sm text-white/50"}>
              {formatTime(entry.created_at)}
            </div>
            <div className={size === "compact" ? "mt-2 text-sm line-clamp-2" : "mt-2"}>
              {entry.content}
            </div>
          </BaseButton>
        </div>
      ))}
    </div>
  );
}
