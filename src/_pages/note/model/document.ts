import { markdownDocument, updatedField, yamlString } from "@/shared/lib";
import { entryLocale } from "@/shared/api/content";
import type { Note } from "@/shared/api/content";
import { INTL_TAG } from "@/shared/i18n";

/**
 * The note's Markdown: `title`, `summary`, `date` as `YYYY-MM-DD`, `updated` when set, `lang`, then
 * `tags` and `tldr` when set, then the body.
 */
export function noteDocument(entry: Note): string {
  const { tags, tldr } = entry.data;

  return markdownDocument(
    [
      ["title", yamlString(entry.data.title)],
      ["summary", yamlString(entry.data.summary)],
      ["date", entry.data.date.toISOString().slice(0, 10)],
      ...updatedField(entry.data.updated),
      ["lang", INTL_TAG[entryLocale(entry.id)]],
      ...(tags.length > 0 ? [["tags", JSON.stringify(tags)] as const] : []),
      ...(tldr === undefined ? [] : [["tldr", yamlString(tldr)] as const]),
    ],
    entry.body ?? "",
  );
}
