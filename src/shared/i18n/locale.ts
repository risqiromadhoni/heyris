/** Locales the site serves. `id` is the default and has no path prefix. */
export const LOCALES = ["id", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";

/** `Intl` locale tags for date formatting. */
export const INTL_TAG: Record<Locale, string> = { id: "id-ID", en: "en" };

/** Values of `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { id: "id_ID", en: "en_US" };

/** The query parameter that holds the topic filter: `topik` in Indonesian, `topic` in English. */
export const TOPIC_PARAM: Record<Locale, string> = { id: "topik", en: "topic" };

/** The query parameter that holds the search text on the index pages. */
export const SEARCH_PARAM = "q";
