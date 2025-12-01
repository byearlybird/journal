import { useEffect, useState } from "react";

/**
 * React hook that returns the current date and time, updating every minute.
 * Useful for displaying "today" relative to the current time.
 *
 * @returns Current Date object that updates every 60 seconds
 *
 * @example
 * ```ts
 * const now = useDateNow();
 * const todayIso = now.toISOString();
 * ```
 */
export function useDateNow() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		// Update every minute (60 seconds)
		const interval = setInterval(() => {
			setNow(new Date());
		}, 1000 * 60);

		return () => clearInterval(interval);
	}, []);

	return now;
}
