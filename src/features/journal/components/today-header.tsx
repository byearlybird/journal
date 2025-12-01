import { useDateNow } from "@/lib/hooks";
import { formatDay, formatMonthDate } from "@/lib/utils/dates";

export const TodayHeader = () => {
	const today = useDateNow();

	return (
		<span className="flex items-baseline gap-2 sticky top-[var(--safe-top)] border-b border-dashed pl-[var(--safe-left)] pr-[var(--safe-right)] py-2 bg-black/70 backdrop-blur">
			<span className="font-semibold text-xl">
				{formatMonthDate(today.toISOString())}
			</span>
			<span className="text-sm text-white/70">
				{formatDay(today.toISOString())}
			</span>
		</span>
	);
};
