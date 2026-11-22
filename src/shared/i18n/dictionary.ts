import { en } from "./en";
import { id } from "./id";
import type { Dictionary } from "./id";
import type { Locale } from "./locale";

/** The interface strings for a locale. */
export function dictionaryFor(locale: Locale): Dictionary {
  return locale === "en" ? en : id;
}

/**
 * Document title for a page, per the spec's page-title rule. The home page passes no page and
 * gets the site title alone; every other page is `{page} · Risqi Romadhoni`.
 */
export function pageTitle(locale: Locale, page?: string): string {
  const strings = dictionaryFor(locale);

  return page === undefined ? strings.meta.siteTitle : strings.meta.title(page);
}
