import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { NOTE_ICONS, TOPICS } from "@/shared/api/content/topics";

/**
 * `2026-10` (the first of the month) or `2026-11-12`, as UTC midnight. YAML parses a full date
 * into a Date and a year and month into a string, so both forms are accepted.
 */
const date = z
  .union([z.date(), z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/)])
  .transform((value) => {
    if (value instanceof Date) return value;

    return new Date(value.length === 7 ? `${value}-01T00:00:00Z` : `${value}T00:00:00Z`);
  });

const entryFields = {
  title: z.string(),
  summary: z.string(),
  date,
  topic: z.enum(TOPICS),
  draft: z.boolean().default(false),
  readingTime: z.number().int().positive().optional(),
};

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object(entryFields),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    ...entryFields,
    label: z.string().optional(),
    icon: z.enum(NOTE_ICONS),
    tags: z.array(z.string()).default([]),
    pinned: z.boolean().default(false),
    tldr: z.string().optional(),
  }),
});

export const collections = { posts, notes };
