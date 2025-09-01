/**
 * Formats a date for journal entries
 * @param iso - ISO date string
 * @returns Formatted date string (e.g., "Sun Aug 10 at 8:33PM")
 */
export function formatEntryDate(iso: string): string {
	const d = new Date(iso);
	const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
	const month = d.toLocaleDateString("en-US", { month: "short" });
	const day = d.getDate();
	const time = d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	return `${weekday} ${month} ${day} at ${time}`;
}

/**
 * Gets today's date in ISO format
 * @returns ISO date string (e.g., "2023-08-10")
 */
export function todayISO() {
	return new Date().toISOString().split("T")[0];
}

/**
 * Formats a date as month, day, and year
 * @param iso - ISO date string
 * @returns Formatted date string (e.g., "August 10, 2023")
 */
export function formatMonthDateYear(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Formats a date as month and day
 * @param iso - ISO date string
 * @returns Formatted date string (e.g., "August 10")
 */
export function formatMonthDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * Formats time from an ISO date string
 * @param iso - ISO date string
 * @returns Formatted time string (e.g., "8:33 PM")
 */
export function formatTime(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

/**
 * Gets today's date formatted as month and day
 * @returns Formatted date string (e.g., "August 10")
 */
export function todayMonthDate() {
	return formatMonthDate(new Date().toISOString());
}

/**
 * Gets today's day of the week
 * @returns Day name (e.g., "Wednesday")
 */
export function todayDay() {
	return new Date().toLocaleDateString("en-US", { weekday: "long" });
}
