/**
 * Format a Date in a specific IANA timezone.
 * Uses built-in Intl.DateTimeFormat — no external libraries needed.
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(date);
}

/**
 * Short format for cards: "Mar 15, 2026, 3:00 PM WAT"
 */
export function formatDateShort(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(date);
}
