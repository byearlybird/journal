import { format } from "date-fns";
import { type ReactNode, useMemo } from "react";
import { Card } from "@/components/ui/card";

type EntryDateCardProps = {
	date: string;
	children: ReactNode;
};

export function EntryDateCard(props: EntryDateCardProps) {
	const d = useMemo(() => new Date(props.date), [props.date]);

	return (
		<Card size="sm" className="w-full">
			<h2 className="flex items-baseline gap-1.5 px-2.5 pt-2 pb-1">
				<span className="text-sm font-medium">{format(d, "EEE d")}</span>
				<span className="text-white/70 text-xs">{format(d, "MMM")}</span>
			</h2>
			<div>{props.children}</div>
		</Card>
	);
}
