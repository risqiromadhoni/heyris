import type { Topic } from "@/shared/api/content/topics";

/** Topics the writing index shows as tabs, in this order. Entries on other topics appear under "Semua" only. */
export const FEATURED_WRITING_TOPICS: readonly Topic[] = [
  "git",
  "monorepo",
  "networking",
  "cloudflare",
  "rust",
  "astro",
];

/** Topics the notes index shows as pills, in this order. Entries on other topics appear under "Semua" only. */
export const FEATURED_NOTE_TOPICS: readonly Topic[] = [
  "api",
  "react",
  "ruby",
  "cloudflare",
  "astro",
];
