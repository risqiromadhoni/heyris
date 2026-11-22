import { INTL_TAG } from "./locale";
import type { Locale } from "./locale";

/** "Oktober 2026" or "October 2026", in UTC. */
export function formatMonthYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "Oktober" or "October", in UTC. */
export function formatMonth(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], { month: "long", timeZone: "UTC" }).format(date);
}

/** "12 November 2026" or "November 12, 2026", in UTC. */
export function formatFullDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** The short weekday, "Kam" or "Thu", in UTC. */
export function formatWeekdayShort(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], { weekday: "short", timeZone: "UTC" }).format(
    date,
  );
}
