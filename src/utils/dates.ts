export function toLocalISO(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00`));
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
