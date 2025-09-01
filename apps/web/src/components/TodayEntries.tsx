import autoAnimate from "@formkit/auto-animate";
import { ArrowTurnDownRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import { formatTime, todayISO } from "../utils/formatDate";
import { useQuery } from "./StoreContext";

const EntryComments = (props: {
	comments: Array<{ id: string; content: string }>;
}) => {
	const parent = useRef(null);

	useEffect(() => {
		parent.current && autoAnimate(parent.current);
	}, []);

	return props.comments.length > 0 ? (
		<div className="space-y-2" ref={parent}>
			{props.comments.map((c) => (
				<div key={c.id} className="flex items-center gap-1.5">
					<ArrowTurnDownRightIcon className="size-4 text-muted-foreground/40" />
					<p className="flex w-full flex-col p-1 text-muted-foreground text-sm">
						{c.content}
					</p>
				</div>
			))}
		</div>
	) : null;
};

export const TodayEntries = (props: {
	onSelectEntry: (id: string) => void;
}) => {
	const parent = useRef(null);

	useEffect(() => {
		parent.current && autoAnimate(parent.current);
	}, []);

	const data = useQuery((d) =>
		Object.values(d)
			.filter((e) => e.date === todayISO())
			.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)),
	);

	return (
		<section className="space-y-3" ref={parent}>
			{data.map((e) => (
				<article
					key={e.$id}
					onClick={() => {
						props.onSelectEntry(e.$id);
					}}
					className="space-y-3 rounded-md border bg-card px-2.5 py-2 text-card-foreground active:brightness-110"
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							props.onSelectEntry(e.$id);
						}
					}}
				>
					<div className="space-y-1.5">
						<h2 className="text-muted-foreground text-xs">
							{formatTime(e.createdAt)}
						</h2>
						<p className="flex h-full items-center whitespace-pre-wrap">
							{e.content}
						</p>
					</div>
					<EntryComments comments={e.comments} />
				</article>
			))}
		</section>
	);
};
