/** One frontmatter field: its key and its value, already written as YAML. */
export type FrontmatterField = readonly [key: string, yaml: string];

/** A YAML double-quoted scalar. JSON string syntax is valid YAML. */
export const yamlString = (value: string): string => JSON.stringify(value);

/**
 * The `updated` field as a YAML list of `YYYY-MM-DD` dates, oldest first, or no field when the
 * entry was never updated.
 */
export function updatedField(dates: readonly Date[]): FrontmatterField[] {
  if (dates.length === 0) return [];

  const days = [...dates]
    .sort((a, b) => a.getTime() - b.getTime())
    .map((date) => date.toISOString().slice(0, 10));

  return [["updated", `[${days.join(", ")}]`]];
}

/**
 * The raw Markdown of one entry: YAML frontmatter, a blank line, then the body exactly as
 * authored, so its container directives stay readable.
 */
export function markdownDocument(fields: readonly FrontmatterField[], body: string): string {
  const frontmatter = fields.map(([key, yaml]) => `${key}: ${yaml}`).join("\n");
  const text = body.endsWith("\n") ? body : `${body}\n`;

  return `---\n${frontmatter}\n---\n\n${text}`;
}
