import { format } from "date-fns";

/**
 * Format a date as "MMM d" (e.g., "Jan 15")
 */
export function formatMonthDate(date: Date | string | number): string {
  return format(date, "MMM d");
}

/**
 * Format a date as day of week (e.g., "Mon")
 */
export function formatDayOfWeek(date: Date | string | number): string {
  return format(date, "EEE");
}

/**
 * Format a date as time in 12-hour format (e.g., "3:45 PM")
 */
export function formatTime(date: Date | string | number): string {
  return format(date, "h:mm a");
}

/**
 * Format a date as ISO date string (e.g., "2024-01-15")
 */
export function formatISODate(date: Date | number): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get today's date formatted as ISO date string
 */
export function getTodayISODate(): string {
  return formatISODate(new Date());
}
