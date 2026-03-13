function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatMonthDate(date: string): string {
  const d = parseLocalDate(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateLong(date: string): string {
  const d = parseLocalDate(date);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatDayOfWeek(date: string): string {
  const d = parseLocalDate(date);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEditedTime(datetime: string): string {
  return new Date(datetime).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getTodayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function compareByDatetimeDesc(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}
