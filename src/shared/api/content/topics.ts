/** Topic keys of posts and notes. Their labels live in `shared/i18n`. */
export const TOPICS = [
  "git",
  "monorepo",
  "networking",
  "rust",
  "astro",
  "react",
  "ruby",
  "api",
  "cloudflare",
] as const;

/** A topic key, as used in the `topic` frontmatter field. */
export type Topic = (typeof TOPICS)[number];

/** Phosphor icon keys a note can use in its `icon` frontmatter field. */
export const NOTE_ICONS = [
  "lightbulb",
  "list-checks",
  "arrows-clockwise",
  "gauge",
  "sparkle",
  "code",
  "database",
] as const;

/** A note icon key, as used in the `icon` frontmatter field. */
export type NoteIcon = (typeof NOTE_ICONS)[number];
