import type { Topic } from "@/shared/api/content/topics";
import type { Dictionary } from "./id";

const plural = new Intl.PluralRules("en");

const topics: Record<Topic, string> = {
  effect: "Effect",
  cloudflare: "Cloudflare",
  accessibility: "Accessibility",
  privacy: "Privacy",
  ai: "AI",
  performance: "Performance",
  typescript: "TypeScript",
  security: "Security",
  nextjs: "Next.js",
  css: "CSS",
  essay: "Essay",
};

/** "1 post" or "3 posts": picks the form with `Intl.PluralRules`. */
const count = (n: number, one: string, other: string) =>
  `${n} ${plural.select(n) === "one" ? one : other}`;

/** English interface strings. Must have exactly the keys of `id.ts`. */
export const en: Dictionary = {
  meta: {
    siteTitle: "Risqi Romadhoni",
    title: (page) => `${page} · Risqi Romadhoni`,
    homeDescription:
      "Personal site of @risqiromadhoni, a software engineer, with a writing index, long-form posts and short notes.",
  },
  nav: {
    label: "Main navigation",
    home: "Home",
    writing: "Writing",
    notes: "Notes",
  },
  lang: {
    current: "(current language)",
  },
  home: {
    contact: "Send email",
    contactLabel: "Send email to Risqi",
    contactSubject: "Hi Risqi",
    contactBody: "Hi Risqi, I found your website and wanted to say hello. 👋",
    bio: "Bio",
    bioShort: "Short",
    bioLong: "Long",
    notes: "Notes",
    writing: "Writing",
    seeAll: "See all",
  },
  theme: {
    toDark: "Switch to dark mode",
    toLight: "Switch to light mode",
  },
  writing: {
    title: "Writing",
    intro:
      "Technical writing on Effect, Cloudflare Workers, accessibility and privacy. Written in Indonesian, some of it also in English.",
    count: (n) => count(n, "post", "posts"),
    newest: "Newest",
  },
  notes: {
    title: "Notes",
    intro:
      "Short notes: code snippets, things I just learned and reminders to myself. Shorter than posts, updated more often.",
    count: (n) => count(n, "note", "notes"),
    pinned: "Pinned",
  },
  filter: {
    all: "All",
    topics: "Topics",
    search: "Search posts",
    results: {
      writing: (n) => `${count(n, "post", "posts")} found`,
      notes: (n) => `${count(n, "note", "notes")} found`,
    },
  },
  topics,
  readingTime: (n) => `${n} min read`,
  footer: {
    markdown: (link) => `Every post is also available as ${link} for AI.`,
    rss: "RSS",
  },
  article: {
    backWriting: "Writing",
    backNotes: "Notes",
  },
  copy: {
    page: "Copy page",
    copied: "Copied",
    failed: "Copy failed",
    menu: "More options",
    viewMarkdown: "View as Markdown",
    openIn: (service) => `Open in ${service}`,
    prompt: (url) => `Read ${url} so I can ask questions about it.`,
  },
  code: {
    copy: "Copy",
  },
  note: {
    tldr: "In short",
    related: "More notes",
    previous: "Previous",
    next: "Next",
  },
  feedback: {
    prompt: "Spotted a mistake?",
    link: "Let me know",
    subject: (title) => `Correction: ${title}`,
  },
  heading: {
    anchor: "Link to this section",
  },
  og: {
    imageAlt: (title) => `Card titled “${title}” from heyris`,
  },
  footnotes: "Footnotes",
  footnote: {
    back: (n) => `Back to reference ${n}`,
  },
  carousel: {
    label: "Gallery",
    previous: "Previous",
    next: "Next",
  },
  skipLink: "Skip to content",
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
  },
};
