import { useDateNow } from "@/lib/hooks";
import { formatDay, formatMonthDate } from "@/lib/utils/dates";

export const TodayHeader = () => {
	const today = useDateNow();

	return (
		<span className="flex items-baseline mb-2 gap-2 sticky top-app-top border-b border-dashed pl-app-left pr-app-right py-2 bg-black/70 backdrop-blur">
			<span className="font-bold text-xl font-serif">
				{formatMonthDate(today.toISOString())}
			</span>
			<span className="text-sm text-white/70">
				{formatDay(today.toISOString())}
			</span>
		</span>
	);
};
