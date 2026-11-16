import type { Topic } from "@/shared/api/content/topics";
import type { Dictionary } from "./id";

const plural = new Intl.PluralRules("en");

const topics: Record<Topic, string> = {
  git: "Git",
  monorepo: "Monorepo",
  networking: "Networking",
  rust: "Rust",
  astro: "Astro",
  react: "React",
  ruby: "Ruby",
  api: "API",
  cloudflare: "Cloudflare",
  ci: "CI",
  web: "Web",
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
      "Personal site of @risqiromadhoni, software engineer since 2016, with technical writing on Git, TypeScript, and how the internet works, plus short notes.",
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
    contactLabel: "Contact Risqi",
    contactEmail: "Email",
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
      "Technical writing on Git, monorepos, how the internet works, Cloudflare, and Rust. I write in Indonesian, then translate into English.",
    count: (n) => count(n, "post", "posts"),
    newest: "Newest",
  },
  notes: {
    title: "Notes",
    intro:
      "Short notes on things I have learned and tools I use. A note is shorter than a post and usually covers one idea with one code example.",
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
  toc: {
    label: "Table of contents",
    close: "Close table of contents",
  },
  history: {
    label: "Update history",
    published: "Published",
    updated: "Updated",
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
  link: {
    newTab: "(opens in a new tab)",
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
  table: {
    label: "Table, scrollable",
  },
  skipLink: "Skip to content",
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
  },
  offline: {
    title: "You're offline",
    body: "This page can't load because your device isn't connected to the internet. Check your connection, then try again.",
    retry: "Try again",
  },
};
