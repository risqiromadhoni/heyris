import { DEFAULT_LOCALE, LOCALES } from "../../shared/i18n/locale";
import type { Locale } from "../../shared/i18n/locale";

const CONTENT_LOCALE = /\/content\/[^/]+\/([^/]+)\//;

/**
 * The locale of a content file, read from its `src/content/<collection>/<locale>/` folder. A file
 * outside a locale folder, or a compile with no file, is Indonesian.
 */
export function localeOf(fileURL: URL | undefined): Locale {
  const segment = CONTENT_LOCALE.exec(fileURL?.pathname ?? "")?.[1];

  return LOCALES.find((locale) => locale === segment) ?? DEFAULT_LOCALE;
}

/** The file path for error messages, or a placeholder when Sätteri was given no file. */
export function describeSource(fileURL: URL | undefined): string {
  return fileURL?.pathname ?? "unknown file";
}
