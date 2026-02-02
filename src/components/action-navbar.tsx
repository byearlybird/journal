import {
  PencilSimpleLineIcon,
  PenNibIcon,
  PlusCircleIcon,
  StarFourIcon,
} from "@phosphor-icons/react";
import { useIncompleteTasks } from "@app/features/tasks";

type ActionNavbarProps = {
  onCreateClick: () => void;
  onPushpinClick: () => void;
};

export function ActionNavbar({ onCreateClick, onPushpinClick }: ActionNavbarProps) {
  const { data: incompleteTasks = [] } = useIncompleteTasks();

  return (
    <div className="fixed right-[max(var(--safe-right),0.5rem)] bottom-[max(var(--safe-bottom),0.5rem)]">
      <div className="flex gap-1 rounded-lg border bg-black/80 p-0.5 backdrop-blur">
        <button
          type="button"
          onClick={onPushpinClick}
          className="flex items-center justify-center gap-2 rounded-md px-3 py-2 min-h-11 text-white transition-transform duration-100 ease-in-out active:scale-95"
        >
          <StarFourIcon
            className="size-5"
            weight={incompleteTasks.length > 0 ? "fill" : "regular"}
          />
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 rounded-md px-3 py-2  text-white transition-transform duration-100 ease-in-out active:scale-95"
        >
          <PenNibIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
