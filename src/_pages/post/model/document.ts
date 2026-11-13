import { markdownDocument, yamlString } from "@/shared/lib";
import { entryLocale, type Post } from "@/shared/api/content";
import { INTL_TAG } from "@/shared/i18n";

/** The entry's Markdown: `title`, `summary`, `date` as `YYYY-MM`, `lang`, then the body. */
export function postDocument(entry: Post): string {
  return markdownDocument(
    [
      ["title", yamlString(entry.data.title)],
      ["summary", yamlString(entry.data.summary)],
      ["date", entry.data.date.toISOString().slice(0, 7)],
      ["lang", INTL_TAG[entryLocale(entry.id)]],
    ],
    entry.body ?? "",
  );
}
