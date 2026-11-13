import { DEFAULT_LOCALE, type Locale } from "./locale";

/**
 * Localized path segment of each collection. This is the only TypeScript file that knows them.
 * The folders under `src/pages` (`tulisan`, `catatan`, `en/writing`, `en/notes`) must use the same names.
 */
const SEGMENTS = {
  writing: { id: "tulisan", en: "writing" },
  notes: { id: "catatan", en: "notes" },
} as const;

/** Path prefix of a locale: none for the default locale, `/en` for English. */
const prefixOf = (locale: Locale) => (locale === DEFAULT_LOCALE ? "" : `/${locale}`);

const collectionBase = (locale: Locale, collection: keyof typeof SEGMENTS) =>
  `${prefixOf(locale)}/${SEGMENTS[collection][locale]}`;

/** Route builders. Routes that take a slug use the second argument; the others ignore it. */
const ROUTES = {
  home: (locale: Locale) => prefixOf(locale) || "/",
  writing: (locale: Locale) => collectionBase(locale, "writing"),
  post: (locale: Locale, slug: string) => `${collectionBase(locale, "writing")}/${slug}`,
  postMarkdown: (locale: Locale, slug: string) => `${collectionBase(locale, "writing")}/${slug}.md`,
  notes: (locale: Locale) => collectionBase(locale, "notes"),
  note: (locale: Locale, slug: string) => `${collectionBase(locale, "notes")}/${slug}`,
  noteMarkdown: (locale: Locale, slug: string) => `${collectionBase(locale, "notes")}/${slug}.md`,
  rss: (locale: Locale) => `${prefixOf(locale)}/rss.xml`,
  llms: () => "/llms.txt",
} satisfies Record<string, (locale: Locale, slug: string) => string>;

type RouteName = keyof typeof ROUTES;

/**
 * The path of a route in a locale, for example `localizedPath("en", "post", slug)`.
 */
export function localizedPath(locale: Locale, route: RouteName, slug = ""): string {
  return ROUTES[route](locale, slug);
}

/** Routes without a localized form. `/llms.txt` is one document for both locales. */
const UNLOCALIZED_PREFIXES = ["/llms.txt", "/og/"];

const translateSegment = (segment: string, to: Locale) => {
  const names = Object.values(SEGMENTS).find((pair) => pair.id === segment || pair.en === segment);

  return names ? names[to] : segment;
};

/**
 * The same route in the other locale, or `undefined` when the route has no counterpart.
 * Works on paths from either locale: `/tulisan/slug` gives `/en/writing/slug`.
 *
 * This maps paths only. It does not check that the other locale has the entry, so a caller must
 * check that first (`hasPostIn`, `hasNoteIn`) before it links to the result.
 */
export function counterpartPath(path: string): string | undefined {
  if (UNLOCALIZED_PREFIXES.some((prefix) => path.startsWith(prefix))) return undefined;

  const fromEnglish = path === "/en" || path.startsWith("/en/");
  const to: Locale = fromEnglish ? DEFAULT_LOCALE : "en";
  const rest = fromEnglish ? path.slice("/en".length) : path;

  if (rest === "" || rest === "/") return localizedPath(to, "home");

  const [, first = "", ...others] = rest.split("/");

  return `${prefixOf(to)}/${[translateSegment(first, to), ...others].join("/")}`;
}

/**
 * The Open Graph image for a page path. The path mirrors the page: `/` gives `/og/index.png`,
 * `/en` gives `/og/en/index.png`, and `/tulisan/slug` gives `/og/tulisan/slug.png`.
 */
export function ogImagePath(pagePath: string): string {
  if (pagePath === "/") return "/og/index.png";

  if (pagePath === "/en") return "/og/en/index.png";

  return `/og${pagePath}.png`;
}
