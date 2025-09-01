import { todayDay, todayMonthDate } from "../utils/formatDate";
import { Header } from "./Header";

export function TodayHeader() {
	return (
		<header className="">
			<Header>{todayMonthDate()}</Header>
			<p className="font-medium text-muted-foreground text-sm">{todayDay()}</p>
		</header>
	);
}
