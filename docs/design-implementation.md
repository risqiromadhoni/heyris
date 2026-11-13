# Design implementation spec

How `design.pen` becomes the heyris site. This is the contract the code is built and reviewed against. When the design and this file disagree, fix one of them; do not let them drift.

Sources, in order of authority:

1. `design.pen`, read through the pencil MCP only (the file is encrypted). Node IDs below point at the exact frames.
2. `DESIGN.md` for tokens and behaviour notes.
3. The earlier Next.js build in `~/Workspaces/github.com/risqiromadhoni/risqiromadhoni.com` (uncommitted work on `feat/leerob`), for behaviour the design cites: theme toggle, shader runner, night overlay, bio toggle, copy-page button, and the vinext post body.
4. transitions.dev, for the two motion recipes the design cites: text swap and icon swap.

## Principles

The ten principles in [leerob.com/docs](https://leerob.com/docs), applied to a personal site:

| Principle   | Applied as                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fast        | Every page is prerendered. Fonts are self-hosted, images go through `astro:assets`, and there are no third-party scripts. The shader starts in idle time. The index search filters rows already on the page, with no network request.      |
| Readable    | Short pages, scannable headings and lists, and code blocks with a copy button. The writing rules in `CLAUDE.md` ask for commands instead of click paths and for complexity added one step at a time.                                       |
| Helpful     | A feedback mail link under every post and note. A link check in the Playwright suite covers internal links and `#anchors` on every push and pull request to `main`.                                                                        |
| AI-native   | The copy-page menu opens ChatGPT, Claude or Perplexity with a prompt that points at the page's `.md`.                                                                                                                                      |
| Agent-ready | Every post and note has a `.md` URL and a "copy page as Markdown" button. Its head has `<link rel="alternate" type="text/markdown">`. `/llms.txt` lists every `.md` URL in the llmstxt.org format.                                         |
| Polished    | Targets of at least 24 px; visible hover, focus and current-page states; a stable, linkable anchor on every prose heading; related-note links; description, canonical, `hreflang` and Open Graph tags; an Open Graph image for every page. |
| Localized   | The default locale has no prefix (`/` is Indonesian, `/en` English). Interface strings and content are both localized.                                                                                                                     |
| Responsive  | The top bar fits on one line with no hidden menu, and the copy menu is a popover that works on touch. Tested in WebKit (Safari's engine) at 390 px.                                                                                        |
| Accessible  | A skip link, required alt text on content images (the build fails without it), and `prefers-reduced-motion` respected by every animation and the shader.                                                                                   |
| Universal   | TSDoc on exported APIs, and `AGENTS.md` and `CLAUDE.md` kept current.                                                                                                                                                                      |

Four of its recommendations are not applied; the reasons are decisions 19 to 22.

How the build proceeds: in vertical slices, each passing `vp run check`, the build, e2e and axe on its own, and each shown as design-versus-build screenshots before the next starts. Every place the design is silent or inconsistent is decided in this file, not guessed in code.

## Routes

Indonesian is the default locale and has no prefix. English lives under `/en`. Every route is prerendered (`export const prerender = true`).

| Indonesian           | English                 | Renders                                              |
| -------------------- | ----------------------- | ---------------------------------------------------- |
| `/`                  | `/en`                   | Home                                                 |
| `/tulisan`           | `/en/writing`           | Writing index                                        |
| `/tulisan/<slug>`    | `/en/writing/<slug>`    | Post                                                 |
| `/tulisan/<slug>.md` | `/en/writing/<slug>.md` | Post as raw Markdown, `text/markdown; charset=utf-8` |
| `/catatan`           | `/en/notes`             | Notes index                                          |
| `/catatan/<slug>`    | `/en/notes/<slug>`      | Note                                                 |
| `/catatan/<slug>.md` | `/en/notes/<slug>.md`   | Note as raw Markdown                                 |
| `/rss.xml`           | `/en/rss.xml`           | RSS 2.0 of published posts and notes                 |
| `/llms.txt`          | none                    | llmstxt.org directory of every published `.md` URL   |
| `/og/<path>.png`     | `/og/en/<path>.png`     | 1200 × 630 Open Graph image, generated at build      |
| `/404`               | none                    | Not found                                            |

- Astro `i18n`: `defaultLocale: "id"`, `locales: ["id", "en"]`, `routing.prefixDefaultLocale: false`.
- Path segments are localized (`tulisan` / `writing`, `catatan` / `notes`). A typed route table in `src/shared/i18n/routes.ts` is the only place that knows them.
- An English page exists for an entry only when `src/content/<collection>/en/<slug>.md` exists. The English index lists every entry. Rows without a translation link to the Indonesian URL with `hreflang="id"`, and the title gets `lang="id"`.
- The language toggle links to the counterpart of the current page when one exists, otherwise to the other language's version of the same index or home.
- Every page has `<link rel="canonical">` and `hreflang` alternates (`id`, `en`, `x-default` → Indonesian) for the counterparts that exist.
- Every page also has a `description` meta tag, the RSS alternate, and Open Graph and Twitter card tags (`og:title`, `og:description`, `og:url`, `og:locale`, `og:image` with `og:image:alt`, `twitter:card` set to `summary_large_image`). Posts and notes add `<link rel="alternate" type="text/markdown" href="<slug>.md">`.
- `/llms.txt` follows [llmstxt.org](https://llmstxt.org): `# heyris`, a one-line `>` summary, then `## Tulisan` and `## Catatan`, each a list of `- [title](absolute .md URL): summary`. An `## English` section appears once English entries exist. Drafts are never listed.
- `/og/<path>.png` mirrors the page path (`/og/index.png` for `/`, `/og/tulisan/<slug>.png` for a post). The card is 1200 × 630 on `lr-bg` in light tokens, with 72 px padding: the site name (`type-site`) at the top, the page title (`type-display`, clamped to 3 lines) and, at the bottom, the date and section (`type-meta`). Each style keeps its family, weight, tracking and colour at 1.5× its page size, so the title is 63.6 px. It is rendered at build time by `src/pages/og/[...path].png.ts` with `src/shared/lib/og-image`: a hand-laid SVG (opentype.js measures and wraps the title) rasterized by `@resvg/resvg-wasm`. Satori can't be used because `@astrojs/cloudflare` prerenders in workerd, which refuses to compile its WebAssembly at runtime. Switching the whole site's prerender to Node for one image step isn't worth it. The card fonts are TrueType files of Source Serif 4 (opsz 20, 600) and DM Sans (400), fetched from Google Fonts at build, the same network dependency the site fonts already have. Every page with a canonical URL has a card; the 404 page is `noindex` and has none.
- `@astrojs/sitemap` generates the sitemap with the same i18n mapping, and `public/robots.txt` points at it.
- Old-site URLs keep working: `/tulisan/<slug>` and `/tulisan/<slug>.md` use the old slugs.

## Folder structure (Feature-Sliced Design)

The FSD pages layer is `src/_pages/` because Astro owns `src/pages/` for routing. There is one alias, `@/*` → `src/*`. Each slice exposes a public `index.ts`, and code outside a slice imports only from that file. `shared` has one public API per segment.

```
src/
  pages/                    Astro routes. Each file imports one page from @/_pages and renders it.
  _pages/
    home/                   HomePage, HomeTitle, ContactTrigger, BioToggle, IllustrationPanel,
                            ThemeToggle, NightOverlay, EntryList; model/bio.ts
    writing-index/          WritingIndexPage, PostRow, TopicTabs
    notes-index/            NotesIndexPage, NoteRow, PinnedNoteCard, TopicPills
    post/                   PostPage
    note/                   NotePage, TldrBox, TagList, RelatedNotes
    not-found/              NotFoundPage
  features/
    copy-page/              "Salin Halaman" split button with its menu. Used by post and note.
    filter-entries/         Search field and the topic/search filter script. Used by both indexes.
  shared/
    api/content/            Collection queries, draft rule, reading time, grouping by year and month
    config/                 Site constants: name, handle, author, email, site URL, featured topics
    i18n/                   Dictionaries (id, en), route table, path helpers, Intl date formatting
    lib/og-image/           Build-time Open Graph card renderer
    ui/                     SiteTopBar, ArticleTopBar, SiteFooter, RailSection, TextLink, Byline,
                            Prose, ShaderCanvas, Artwork
  app/
    layouts/BaseLayout.astro
    markdown/               Sätteri plugins used by astro.config.mjs: directives, heading anchors,
                            the alt-text rule
  content.config.ts         Required location for Astro content collections
  content/
    posts/{id,en}/<slug>.md
    notes/{id,en}/<slug>.md
```

There is no `entities` layer. Reading content collections is infrastructure, so it stays in `shared/api`. There is no `widgets` layer either (FSD v2.1 discourages it).

Placement rules for later changes:

- A component used by one page stays in that page's slice, even when it looks reusable.
- Something moves to `features/` or `shared/` only when a second page uses it now.
- Everything follows the repo rules: oxlint's 200-line limit per file, the anti-slop rules (`// SAFETY:` above each non-const `as`, `instanceof` instead of `typeof`, no `unknown` parameters) and TSDoc on exported APIs only.

## Tokens and type scale

Colours are the `lr-*` tokens in `uno.config.ts`, mirrored from `DESIGN.md`. The design's `lr-bg-clear` (transparent `lr-bg`) is written as `color-mix` or `transparent` in CSS, not as a token.

The type scale below is implemented as UnoCSS shortcuts. Sizes are px, as in the design.

| Shortcut       | Family | Size / line height | Weight | Tracking | Colour  | Used for                              |
| -------------- | ------ | ------------------ | ------ | -------- | ------- | ------------------------------------- |
| `type-display` | serif  | 42.4 / 1.15        | 600    | −0.85 px | heading | Home title, index titles              |
| `type-article` | serif  | 30 / 1.1           | 600    | −0.6 px  | heading | Post and note titles                  |
| `type-h2`      | serif  | 23.2 / 1.4         | 600    | −0.46 px | heading | Section headings, rail year and month |
| `type-site`    | serif  | 19.2 / normal      | 600    | 0        | heading | Site name in the top bar              |
| `type-row`     | serif  | 20 / 1.4           | 600    | 0        | heading | Index row titles                      |
| `type-card`    | serif  | 19 / 1.35          | 600    | 0        | heading | Pinned note cards                     |
| `type-related` | serif  | 16 / 1.4           | 600    | 0        | heading | Prev/next cards                       |
| `type-body`    | serif  | 17 / 1.6           | 400    | 0        | text    | Bio, intro, article body              |
| `type-link`    | serif  | 17 / 1.06          | 400    | 0        | nav     | Home note links, back link            |
| `type-ui`      | sans   | 14 / normal        | 400    | 0        | nav     | Nav, dates, summaries, search         |
| `type-meta`    | sans   | 13 / normal        | 400    | 0        | nav     | Byline, reading time, buttons         |
| `type-tag`     | sans   | 12.5 / normal      | 400    | 0.4 px   | nav     | Tags, topic, weekday                  |
| `type-code`    | mono   | 15.3 / 1.78        | 400    | 0        | heading | Inline code (no background)           |
| `type-pre`     | mono   | 13.5 / 1.65        | 400    | 0        | text    | Code blocks                           |

Fonts are loaded through Astro's built-in `fonts` config, downloaded at build time and self-hosted:

- Source Serif 4: variable, weights 200–900, normal style, requested from Google with `opsz` fixed at 20 (`options.experimental.variableAxis` in `astro.config.mjs`), the optical size the design renders at. The served file has no opsz axis left, so no `font-variation-settings` is needed. Without it Google serves the default optical size, and serif text runs about 4 % wider than the design.
- DM Sans: variable, weights 400–600.
- DM Mono: weight 400.

Serif and sans are preloaded, and `font-serif`, `font-sans` and `font-mono` point at the generated CSS variables.

Syntax highlighting is off (`markdown.syntaxHighlight: false`): the design renders code in one colour, `lr-text`.

## Page layout

All pages use the `lr-bg` background with the backdrop shader behind the content (see Shaders). Content is centred at a maximum width of 1440 px.

| Page                       | Outer padding                        | Vertical gap between sections                                   |
| -------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Home                       | 49 px                                | Copy and illustration columns, `justify-content: space-between` |
| Writing index, notes index | 49 px                                | 64 px                                                           |
| Post, note                 | 32 px top, 49 px sides, 96 px bottom | 48 px between top bar and article                               |

On phones the outer padding drops to 20 px.

## Components

Node IDs are given for the light frame. The dark frame is the same structure under the dark root unless a dark-only node is named.

| Frame         | Light root | Dark root |
| ------------- | ---------- | --------- |
| Home          | `FqiNO`    | `o20T4`   |
| Writing index | `mbUNl`    | `vquiJ`   |
| Post          | `RtNUV`    | `nH2jc`   |
| Notes index   | `M9hhgT`   | `FHveQ`   |
| Note          | `EIPzF`    | `V41jJ`   |

### Home (`_pages/home`)

| Component         | Nodes                             | Spec                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HomeTitle         | `AdAo5`                           | `h1` "@risqiromadhoni", `type-display`. Swap behaviour below.                                                                                                                                                                                                                                                                                                                             |
| ContactTrigger    | `WQJh9`                           | `<a href="mailto:halo@heyris.me?subject=…&body=…">`. Height 34, padding 0/14/0/12, gap 6, `lr-surface` fill, 1 px `lr-line` border, fully rounded. Lucide `mail` at 16 px in `lr-heading`, label "Kirim email" sans 13 / 500 in `lr-heading`. Icon swap to Lucide `arrow-up-right` on hover and focus. Below `sm` it shows the icon only and carries `aria-label` "Kirim email ke Risqi". |
| BioToggle         | `t7kmpW`                          | Row with a bottom `lr-line` hairline: "Bio" on the left; "Singkat" and "Panjang" on the right, 16 px apart, `type-ui`. CSS-only radio group (`role="radiogroup"`); the checked option is `lr-text` with a 1 px `lr-text` indicator sitting on the hairline.                                                                                                                               |
| Bio               | `DpwBU`                           | Two `type-body` paragraphs, 23.2 px apart. 40.3 px above the toggle row, 21.6 px between row and text, 56 px below.                                                                                                                                                                                                                                                                       |
| Catatan section   | `NouNW`, dark heading row `oxzSZ` | `h2` "Catatan" (`type-h2`) with "Lihat semua" (sans 14 / 500, nav) and Lucide `arrow-right` 16 px on the right. Two columns (310.65 px and the rest) of five links each, 3.2 px apart. Each link has a 5.5 px square `lr-bullet` bullet and a `type-link` label with a 1 px `lr-underline` underline. Shows the 10 newest notes by `label`, falling back to `title`.                      |
| Tulisan section   | `WnNX2`                           | `h2` "Tulisan" with "Lihat semua". Five newest posts, each row with a bottom `lr-line` hairline (the list also has a top hairline), padding 12.24 / 0 / 13.24, gap 20: title in serif 17 / 1.6 `lr-text`, month and year in sans 14 nav on the right.                                                                                                                                     |
| IllustrationPanel | `v9THhD`, dark `o8EYX`            | 469 px wide on desktop, 49 px top offset, full column height capped at `min(910px, 100svh − 147px)`. Radius 10, inner 1 px `lr-line` border, clipped. Layers: artwork (`astro:assets`, AVIF and WebP, eager, `fetchpriority="high"`), then the panel shader, then the night overlay, then the theme toggle. Static: not sticky, not fixed.                                                |
| NightOverlay      | dark `o8EYX` fills and Star 1–8   | Four `aria-hidden` layers, each `opacity: 0`, becoming 1 in dark mode with a 1.2 s ease-in-out transition: a multiply gradient (`#16256E`, `#3A4AA0` at 40 %, `#5A5F9E`), a top dark gradient (`#060A2AB3` to transparent at 45 %), a screen-blended radial glow (`#FFB45A55`, 55 % × 17.5 % at 50 % 20 %), and eight `#F3EDDC` stars at the design's positions.                          |
| ThemeToggle       | light `kv84N`, dark `Tvqop`       | Behaviour below.                                                                                                                                                                                                                                                                                                                                                                          |

### Index pages (`_pages/writing-index`, `_pages/notes-index`)

| Component                               | Nodes             | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SiteTopBar (`shared/ui`)                | `aTgsV`, `c8VMBU` | Site name "@risqiromadhoni" (`type-site`, links home) on the left. On the right, 28 px apart: Beranda, Tulisan, Catatan (`type-ui`), a 1 × 16 `lr-line` divider, then the language toggle "ID / EN". The current page is `lr-text` with a 2 px `lr-text` bottom border and `aria-current="page"`. The current language is `lr-text`; the other is a link in nav colour.                                                                                                   |
| Header                                  | `J9vUW0`, `EqVbx` | A 300 px rail with the page title (`type-display`) and the count (`type-ui`, for example "12 tulisan"), 10 px apart. Next to it, a 760 px column, 8 px top padding: the intro (`type-body`), then 32 px below it the controls row.                                                                                                                                                                                                                                        |
| TopicTabs (writing)                     | `YpQLO`           | "Semua" plus the featured topics, 20 px apart, `type-ui`. The selected tab is `lr-text` with a 2 px bottom border and 4 px padding below.                                                                                                                                                                                                                                                                                                                                 |
| TopicPills (notes)                      | `HpTK8`           | Pills 8 px apart, padding 6 / 12, fully rounded, label sans 13 and count sans 12. Selected: `lr-text` fill, `lr-bg` text, count at 0.7 opacity. Others: 1 px `lr-line` border, `lr-text` label, nav count.                                                                                                                                                                                                                                                                |
| SearchField (`features/filter-entries`) | `UGL3e`           | 190 px wide, bottom `lr-line` border, 8 px bottom padding. Phosphor `magnifying-glass` 16 px nav, then a borderless `type="search"` input with placeholder "Cari tulisan" and a visually hidden label.                                                                                                                                                                                                                                                                    |
| RailSection (`shared/ui`)               | `Ip5oZ`, `LPphJ`  | 300 px rail plus a 760 px list. The rail is sticky on `lg` and up (`top: 24px; align-self: flex-start`) and holds the year or month (`type-h2`) and the count (`type-ui`), 4 px apart, 16 px top padding. No ancestor may use `overflow: hidden`. The list has a top `lr-line` hairline.                                                                                                                                                                                  |
| PostRow                                 | `iRdQS`           | Padding 16 / 16 / 17 / 16, gap 32, bottom hairline. Text column, 6 px gaps: the "Terbaru" badge (6 px `lr-text` dot plus `type-tag`, newest post only), title (`type-row` on the newest post; every other post is serif 17 / 1.4 regular in `lr-text`, as in the design), summary (`type-ui` at 1.5 line height), topic (`type-tag`). Meta column, 96 px wide and right-aligned: month (`type-ui`) and reading time (`type-meta`), 4 px apart. The whole row is one link. |
| Row hover and focus                     | `lAU12`           | `lr-surface` fill, radius 8, hairline hidden, Phosphor `arrow-up-right` 16 px shown after the title. Typography does not change.                                                                                                                                                                                                                                                                                                                                          |
| NoteRow                                 | `uLbyD`           | Like PostRow with gap 20, plus a 44 px date column first: the day (serif 26 / 1 / 600 heading) and the weekday (`type-tag`), 2 px apart. The tag line is the note's Phosphor icon at 13 px followed by its topic. The meta column (80 px) has the reading time only.                                                                                                                                                                                                      |
| PinnedNoteCard                          | `Hf7y0`           | Two per row, 16 px apart, in a "Disematkan" rail section. Padding 20, gap 10, `lr-surface` fill, 1 px `lr-line` border, radius 8. A pin row (Phosphor `push-pin` 16 px `lr-text`, "Disematkan" `type-tag` on the right), the title (`type-card`), the summary, and the tag line.                                                                                                                                                                                          |
| SiteFooter (`shared/ui`)                | `WMROr`           | Top `lr-line` border, 24 px top padding. Left: "Semua tulisan juga tersedia sebagai [Markdown] untuk AI." with "Markdown" linking to `/llms.txt`. Right, 28 px apart: Phosphor `rss` 16 px with the "RSS" link, then "© <build year> Risqi Romadhoni". Links are `lr-text` with a 1 px `lr-underline` bottom border.                                                                                                                                                      |

### Article pages (`_pages/post`, `_pages/note`)

| Component                       | Nodes             | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArticleTopBar (`shared/ui`)     | `XSKGb`, `lv051`  | Sticky at `top: 0`, `lr-bg` background, z-index above content, 16 px bottom padding, 1 px `lr-line` bottom border. A back link: Phosphor `arrow-left` 16 px nav, then "Tulisan" or "Catatan" (`type-link`, underline). Reading progress: a 2 px `lr-text` bar over the bottom border, anchored left, scaled to `scrollY / (scrollHeight − innerHeight)`.                                                                                                               |
| Post header                     | `lR0jC`           | 600 px column, 24 px top padding, 14.8 px bottom padding, 12 px gap. Title (`type-article`), then the byline.                                                                                                                                                                                                                                                                                                                                                          |
| Byline (`shared/ui`)            | `TXUbO`, `n1RATZ` | Left, 7.2 px apart: 20 px round avatar with a 1 px `lr-line` border, then `type-meta` parts joined by "·". Post: "Oktober 2026 · Risqi Romadhoni". Note: "12 November 2026 · 2 mnt baca · Risqi Romadhoni". Right: the copy-page button.                                                                                                                                                                                                                               |
| CopyPage (`features/copy-page`) | `SbXoS`           | Split button, 1 px `lr-line` border, radius 6. The main part (padding 5 / 10, gap 6): Phosphor `copy` 14 px nav and "Salin Halaman" (sans 13 `lr-text`). A 1 px divider. A caret part (padding 6 / 8) with Phosphor `caret-down` 12 px. Behaviour below.                                                                                                                                                                                                               |
| TagList (note)                  | `Dm0Hi`           | Pills 8 px apart, padding 4 / 12, 1 px `lr-line` border, fully rounded, `type-tag` without tracking.                                                                                                                                                                                                                                                                                                                                                                   |
| TldrBox (note)                  | `mZWy1`           | Padding 16 / 18, gap 12, `lr-surface` fill, 1 px `lr-line` border, radius 8. Phosphor `lightbulb` 18 px `lr-text`, then the label "Singkatnya" (sans 13 / 600, heading, 0.3 px tracking) and the text (sans 14.5 / 1.5 `lr-text`), 4 px apart.                                                                                                                                                                                                                         |
| FeedbackLine (post and note)    | none              | Not in the design. Under the article body, 40 px above it, before RelatedNotes on notes. `type-meta`: "Ada yang keliru? [Kabari saya]". The link opens `mailto:halo@heyris.me?subject=<feedback.subject, URL-encoded>`, so an Indonesian page sends "Koreksi: <title>". It is `lr-text` with a 1 px `lr-underline` underline.                                                                                                                                          |
| RelatedNotes (note)             | `N3gFpA`          | 40 px top padding, 16 px gap. The label "Catatan lainnya" (sans 13, nav, 0.4 px tracking), then two cards 16 px apart: padding 16, gap 6, 1 px `lr-line` border, radius 8. Each card has the direction (Phosphor `arrow-left` or `arrow-right` 14 px plus "Sebelumnya" or "Berikutnya", `type-tag`) and the title (`type-related`). The "Berikutnya" card is right-aligned. A missing neighbour leaves its slot empty; with no neighbours the section is not rendered. |
| Prose (`shared/ui`)             | `tBJuA`, `UVlqN`  | See Article body.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### Article body (`shared/ui/Prose` plus `app/markdown`)

The body column is 600 px wide and centred, with 23.2 px between blocks.

| Element         | Nodes                         | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paragraph       | `JpzH2`                       | `type-body`. Bold (700) only for run-in lead-ins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `h2`            | `r1Jev7`                      | `type-h2` with 26.4 px of extra space above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Heading anchor  | none                          | Not in the design. Every prose `h2` and `h3` keeps the id `@astrojs/markdown-satteri` gives it (github-slugger), or the one set with `{#id}`. A hast plugin appends `<a class="heading-anchor" href="#<id>" aria-label="Tautan ke bagian ini"><span aria-hidden="true">#</span></a>`. It is absolutely positioned 20 px left of the heading in nav colour, at opacity 0 until the heading is hovered or the link has focus, so the resting layout matches the design. Below `lg` it sits after the heading text instead. `scroll-margin-top` clears the sticky top bar. |
| Image           | none                          | Every content image needs non-empty alt text. An mdast plugin fails the build on an empty one and names the file and the image URL. Decorative art, such as figure backdrops, is CSS, not `<img>`.                                                                                                                                                                                                                                                                                                                                                                      |
| Link            | `OTxl7` in prose              | Serif, nav colour, 1 px `lr-underline` underline. On hover the underline becomes `lr-nav`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Inline code     | `Code` in `r4Z7b` lines       | `type-code`, no background.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Footnote marker | `cmxGH`                       | GFM footnote reference, sans 12.24 nav, superscript. The footnote list renders at the end under a hairline, headed "Catatan kaki" or "Footnotes", in sans 14 nav.                                                                                                                                                                                                                                                                                                                                                                                                       |
| Ordered list    | `M1kIzr`                      | Items 3.2 px apart. A 24 px number column (serif 17 nav), 8 px gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Unordered list  | Q/A list `GCEJz`              | 5.5 px square `lr-bullet` bullets, items 16 px apart, nested lists indented 28 px.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Code block      | `vHAWo`                       | `lr-surface` fill, 1 px `lr-line` border, radius 8. A header 40 px tall (padding 8 / 14, bottom hairline) with the file name (mono 12 nav) and a "Salin" button (Phosphor `copy` 13 px plus sans 12 nav). Code in `type-pre`. The file name comes from the fence's attributes: ` ```ts {title=retry.ts} `. Without a title there is no file name, but the header and copy button still show.                                                                                                                                                                            |
| Figure, wide    | `khbpD`                       | 1100 px wide and centred on the article, shrinking to the container below that. Radius 8, 1 px `lr-line` border. The backdrop is the artwork crop with an `lr-bg` multiply layer at 0.55. The content sits centred inside.                                                                                                                                                                                                                                                                                                                                              |
| Figure pair     | `c68t6`                       | Two 542 px figures, 16 px apart, stacked on narrow screens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Window          | `h3LPoI`                      | `lr-bg` fill, 1 px `lr-line` border, radius 8. A bar (padding 9 / 14, gap 12, bottom hairline): three 9 px `lr-underline` dots 6 px apart, then an address pill (`lr-surface`, radius 6, padding 4 / 12, sans 12 nav). Content below.                                                                                                                                                                                                                                                                                                                                   |
| Source listing  | `Markdown Source` in `h3LPoI` | A code block inside a window with line numbers (mono 12.5 / 22 px, numbers in `lr-bullet`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Diagram         | `Diagram` in `Ng1hi`          | Centred column, 24 px vertical padding. Boxes 280 px wide (padding 10 / 14, gap 2, 1 px border, radius 6) with a title and a subtitle (sans 12 nav). Between boxes, a 1 × 16 `lr-line` stem and a Phosphor `caret-down` 12 px.                                                                                                                                                                                                                                                                                                                                          |
| Commit list     | `VohZF`                       | `lr-surface` fill, 1 px border, radius 8. Rows of padding 9 / 14, gap 10, bottom hairline except the last: Phosphor `git-commit` 14 px nav, the message (sans 13 `lr-text`, truncated with a `title` tooltip), and the hash (mono 12 nav).                                                                                                                                                                                                                                                                                                                              |
| Checklist       | slides in `cNe0d`             | Rows of Phosphor `check-circle` 16 px nav, the label (sans 14 `lr-text`) and the detail (mono 12 nav).                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Carousel        | `cNe0d`                       | Inside a wide figure, 400 px tall. 640 px slides, 24 px apart, scroll-snapped. The active slide is opaque; the others are `inert` at 0.55 opacity. 170 px fades on both edges at 0.8. 36 px round previous and next buttons (`lr-bg`, 1 px border; Phosphor `caret-left` and `caret-right` 16 px). A pagination pill (`lr-bg`, 1 px border, padding 8 / 14, gap 12): 6 px dots in `lr-underline`, the active one an 18 × 6 bar in `lr-text`, then the counter "2 / 3" in mono 12 nav. Without JS the track still scrolls.                                               |

The blocks are written in Markdown as container directives, so the raw `.md` stays readable:

````md
:::figure{.wide}
::::window{address="heyris.me/tulisan/situs-pribadi-cloudflare-workers-vinext.md"}
```md {.line-numbers}
---
title: Situs pribadi di Cloudflare Workers dengan vinext
---
```
::::

:::

:::commits
- 62328b5 feat: add React Best Practices skill for performance optimization
:::
````

**Spike outcome (2026-11-13): directives work.** An mdast `containerDirective` visitor in `src/app/markdown/directives.ts` replaces each block with an HTML element, and nesting (a figure holding a window holding a fenced code block) needs no fallback. The plugins emit semantic `md-*` classes, not utilities, because UnoCSS can't see markup generated at build time. `shared/ui/Prose` styles them with global CSS on the tokens. An unknown container directive fails the build. The plugins read the entry's locale from its path (`src/content/<collection>/<locale>/`), so the footnote label, copy button and anchor names follow the entry's language. The footnote label is visible, as the design shows.

## Behaviour

### Theme

- An inline script in `<head>`, before first paint, applies the `dark` class on `<html>`. It reads `localStorage.theme` (`"light"` or `"dark"`); a saved value wins. Without one, it follows `prefers-color-scheme`, live.
- Clicking the toggle flips the class and saves the new value. If storage is blocked, the switch still holds until reload.

### Theme toggle (home only)

- `<button type="button">`, 96 px, round, at `top: 18px` and `left: 80.6%`, translated back by half its width. It keeps this position in both themes.
- The accessible name is set in CSS so it is right before scripts run: "Beralih ke mode gelap" in light mode and "Beralih ke mode terang" in dark mode ("Switch to dark mode" and "Switch to light mode" in English).
- Two `aria-hidden` bodies share one wheel with `transform-origin: 50% 668px`:
  - Sun: an `#FFC24A` glow at 0.75 opacity, 26 px blur, plus a radial core (`#FFF8CF`, `#FFD65A` at 60 %, `#FFB52E`) with a `#FF9F1CB3` 20 px shadow.
  - Moon: an `#F3EDDC` glow at 0.35 opacity, 24 px blur, plus an `#F3EDDC` core with an `#F3EDDC99` 18 px shadow.
- Resting states, set in CSS from the `dark` class: in light mode the sun is at 0° and opaque, and the moon at 60° and transparent. Dark mode is the reverse.
- Motion: `sky-set` (from 0°, opacity 1) and `sky-rise` (from −60°, opacity 0), 1.2 s, `cubic-bezier(0.4, 0, 0.2, 1)`. Only the `from` frame is declared.
- The animation classes apply only after the first click, which sets `data-moved` on the button, so a page load shows the resting state. They are inside `prefers-reduced-motion: no-preference`.
- The night overlay fades over the same 1.2 s.
- A visible focus ring: 2 px `lr-text` outline, offset inward.

### Shaders (`shared/ui/ShaderCanvas`)

- The GLSL comes straight from `designs/shaders/*.glsl` through a `?raw` import, so the design and the site share one copy.
- The vertex shader is one full-screen triangle. Rendering is at CSS-pixel size, because the shaders' constants are in CSS px.
- The backdrop is one fixed, full-viewport, `aria-hidden`, `pointer-events: none` canvas behind all content:
  - light mode: `day-haze` with `u_haze` 0.85, `u_grain` 0.7, `u_cursor` 0.35, `u_speed` 0.25, `u_warm` `#FFD9A0`, `u_cool` `#C4D8FF`, `u_ink` `#282828`;
  - dark mode: `night-sky` with `u_haze` 1, `u_stars` 1, `u_grain` 1, `u_cursor` 0.35, `u_speed` 0.25, `u_moon` `#D6E0FF`, `u_aurora_a` `#6F7CFF`, `u_aurora_b` `#4FC8B4`, `u_star` `#F3EDDC`, `u_ink` `#E8E5DF`. `u_quiet` keeps stars out of the text column: `max(0, (width − 1440) / 2) + 720` from 1024 px up (as in the old site), the full width below.
- The home panel is a second canvas: `day-light` with `u_rays` 0.8, `u_dust` 0.55, `u_speed` 0.5, `u_light` `#FFE9B8`. In dark mode it draws nothing (transparent).
- `u_time` advances with `requestAnimationFrame`, and `u_mouse` follows the pointer from the canvas's bottom-left corner.
- A `MutationObserver` on `<html class>` rebuilds the scene when the theme changes. That switch is instant, not animated.
- Compilation is asynchronous: with `KHR_parallel_shader_compile`, both shaders compile and the program links in one task, and `COMPLETION_STATUS_KHR` is polled once per frame before any status is read; without it, the same work is split across frames (vertex, fragment, link, check). A theme switch keeps the old program drawing until the new one has linked.
- Reduced motion: time is frozen at 0 and one frame is drawn, with no loop.
- Additions over the old site:
  - start in idle time after first paint;
  - stop the loop while the tab is hidden;
  - without WebGL, or when a shader fails to compile, the canvas stays empty and `lr-bg` shows.

### Home title swap

Uses the transitions.dev text swap: 150 ms, 4 px vertical travel, 2 px blur, ease-in-out.

- On hover or keyboard focus of the contact trigger, the title text becomes "Hi, nice to meet you 👋".
- On leave or blur it becomes "See you next time 👋", then after 1.5 s returns to "@risqiromadhoni". Re-entering during that hold cancels the timer and shows the greeting again.
- The `h1` keeps the accessible name "@risqiromadhoni"; the swapped text is `aria-hidden`. The greetings keep the design's English text in both locales, with `lang="en"`.
- All three strings are stacked in one grid cell, so the title reserves the width and height of the longest one and nothing shifts. The contact trigger sits 16 px after that box.
- With reduced motion the text changes without movement.

### Contact icon swap

Uses the transitions.dev icon swap: both icons stay in one grid cell. The hidden icon is at opacity 0, 2 px blur and 0.25 scale; transitions are 250 ms ease-in-out, and instant with reduced motion.

### Bio toggle

- Two radio inputs ("Singkat" checked by default, "Panjang") inside a `role="radiogroup"` labelled "Bio".
- The short and long texts are shown with `:has(:checked)`, with no JavaScript.
- Focus is visible on the option labels.

### Filter and search (`features/filter-entries`)

- Topic buttons are `<button aria-pressed>`; exactly one is pressed, "Semua" by default.
- Search matches title and summary, case- and accent-insensitive, as you type.
- Rows that don't match are hidden. A group with no visible rows is hidden, and each rail count shows its visible rows. The header count stays the total.
- An `aria-live="polite"` visually hidden line announces the result count ("3 tulisan ditemukan").
- The state is kept in the URL (`?topik=` and `?q=` in Indonesian, `?topic=` and `?q=` in English) with `history.replaceState`, and restored on load.
- Without JavaScript, every row shows.
- Featured topics (the tabs and pills) are a fixed list in `shared/config`:
  - writing: Effect, Cloudflare, Aksesibilitas, Privasi, AI, Performa;
  - notes: Effect, Cloudflare, Aksesibilitas, Performa, AI.

  Entries with other topics appear under "Semua" only. A featured topic with no listed entries gets no tab or pill, so a production build with few published entries shows no empty filters; an unknown `?topik=` falls back to "Semua".

### Reading progress

- A passive scroll listener, throttled with `requestAnimationFrame`, sets `transform: scaleX(progress)` on the bar (origin left).
- At the top of the page the scale is 0 and only the border shows.
- The bar is decorative: `aria-hidden="true"`. There is no transition, so reduced motion needs no special case.

### Copy page (`features/copy-page`)

- The main button fetches the page's `.md` URL and writes it to the clipboard. The icon swaps from `copy` to `check` and the label to "Tersalin" ("Copied"), or "Gagal menyalin" ("Copy failed") on error, then resets after 2 s. The change is announced with `aria-live`.
- The caret is a disclosure button (`aria-expanded`, `aria-controls`) that opens a popover list of links:
  - "Lihat sebagai Markdown": the `.md` URL.
  - ChatGPT, Claude and Perplexity, opening in a new tab. Each starts a chat with "Baca <absolute .md URL> supaya saya bisa bertanya tentang isinya." ("Read <URL> so I can ask questions about it." in English).
- Each service shows its Simple Icons glyph at 14 px in nav colour, `aria-hidden`. A service without a Simple Icons glyph uses Phosphor `sparkle`.
- The popover closes on Escape, on an outside click and after choosing an item. Focus returns to the caret on Escape.
- Arrow keys move between items, and Tab leaves the popover.

### Code block copy

The "Salin" button copies the block's text, then swaps to "Tersalin" for 2 s.

## Content

### Collections (`src/content.config.ts`)

Both collections use the `glob` loader over `src/content/<collection>/**/*.md`. The first path segment is the locale (`id` or `en`), and the rest is the slug.

`posts`:

| Field         | Type                     | Notes                                                    |
| ------------- | ------------------------ | -------------------------------------------------------- |
| `title`       | string                   |                                                          |
| `summary`     | string                   | Shown in rows, RSS and the meta description              |
| `date`        | date                     | Accepts `2026-10`, read as the first of the month in UTC |
| `topic`       | topic key                | See topics                                               |
| `draft`       | boolean, default `false` | Drafts are visible in `pnpm dev` only                    |
| `readingTime` | number, optional         | Minutes; overrides the computed value                    |

`notes`: every post field plus:

| Field    | Type                     | Notes                                                                                         |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| `date`   | date                     | Full date (`2026-11-12`); the day and weekday are shown                                       |
| `label`  | string, optional         | Short label for the home list; falls back to `title`                                          |
| `icon`   | Phosphor icon key        | One of `lightbulb`, `list-checks`, `arrows-clockwise`, `gauge`, `sparkle`, `code`, `database` |
| `tags`   | string[], default `[]`   | Shown as pills on the note page                                                               |
| `pinned` | boolean, default `false` | Pinned notes appear in "Disematkan" and not in the month groups                               |
| `tldr`   | string, optional         | Renders the TL;DR box                                                                         |

Reading time is the word count of the body divided by 200, rounded up, with a minimum of 1, unless `readingTime` is set. Every count, the "Terbaru" badge (the newest published post) and every weekday are computed from the data.

### Topics

| Key             | Indonesian    | English       |
| --------------- | ------------- | ------------- |
| `effect`        | Effect        | Effect        |
| `cloudflare`    | Cloudflare    | Cloudflare    |
| `accessibility` | Aksesibilitas | Accessibility |
| `privacy`       | Privasi       | Privacy       |
| `ai`            | AI            | AI            |
| `performance`   | Performa      | Performance   |
| `typescript`    | TypeScript    | TypeScript    |
| `security`      | Keamanan      | Security      |
| `nextjs`        | Next.js       | Next.js       |
| `css`           | CSS           | CSS           |
| `essay`         | Catatan       | Essay         |

### Seed content

Every entry the design lists is seeded. Only the two marked "full" have bodies and are published; the rest are `draft: true` with the design's title, summary, topic and reading time, waiting for a body.

Posts (`src/content/posts/id/`), slugs from the old site:

| Slug                                      | Date    | Topic         | Min      | State |
| ----------------------------------------- | ------- | ------------- | -------- | ----- |
| `situs-pribadi-cloudflare-workers-vinext` | 2026-10 | cloudflare    | computed | full  |
| `effect-v4-service-layer`                 | 2026-09 | effect        | 9        | draft |
| `wcag-2-2-aa-situs-pribadi`               | 2026-09 | accessibility | 5        | draft |
| `kenapa-tanpa-pelacak`                    | 2026-08 | privacy       | 4        | draft |
| `tulisan-sebagai-markdown`                | 2026-08 | ai            | 3        | draft |
| `core-web-vitals-workers`                 | 2026-07 | performance   | 6        | draft |
| `typescript-7-tsgo`                       | 2026-06 | typescript    | 6        | draft |
| `header-keamanan-csp`                     | 2026-05 | security      | 8        | draft |
| `i18n-segmen-lang-proxy`                  | 2025-12 | nextjs        | 5        | draft |
| `belajar-effect-dari-nol`                 | 2025-11 | effect        | 10       | draft |
| `pindah-dari-wordpress`                   | 2025-10 | essay         | 6        | draft |
| `tailwind-v4-tanpa-config`                | 2025-08 | css           | 3        | draft |

Notes (`src/content/notes/id/`):

| Slug                             | Date       | Topic         | Icon             | Label                   | State         |
| -------------------------------- | ---------- | ------------- | ---------------- | ----------------------- | ------------- |
| `effect-gen-atau-pipe`           | 2026-11-13 | effect        | lightbulb        | Effect.gen atau pipe    | draft, pinned |
| `checklist-rilis-workers`        | 2026-10-05 | cloudflare    | list-checks      | Checklist rilis Workers | draft, pinned |
| `retry-dengan-schedule`          | 2026-11-12 | effect        | arrows-clockwise | Retry dengan Schedule   | full          |
| `query-d1-pertama-lambat`        | 2026-11-08 | cloudflare    | database         | Query D1 yang lambat    | draft         |
| `aria-current-navigasi-aktif`    | 2026-11-03 | accessibility | code             | aria-current            | draft         |
| `cache-control-halaman-markdown` | 2026-10-27 | performance   | gauge            | Cache-Control Markdown  | draft         |
| `prompt-ringkasan-diff-commit`   | 2026-10-19 | ai            | sparkle          | Prompt ringkasan commit | draft         |
| `bayangan-teks-mode-gelap`       | 2026-09-30 | accessibility | code             | Teks di mode gelap      | draft         |
| `nama-binding-wrangler`          | 2026-09-14 | cloudflare    | database         | Nama binding Wrangler   | draft         |

The two pinned notes have no date in the design. Their dates are placeholders, chosen so that "Effect.gen atau pipe" is the next note after "Retry", as the design's related cards show.

Full bodies:

- The vinext post: the design's article (`tBJuA`), all of it, using the blocks above. The old site's Markdown is the starting text.
- The Retry note: the design's note (`UVlqN`): the intro, "Polanya" with the `retry.ts` block, the paragraph after it, "Yang perlu diingat" with its three items, and `tldr`.

The home bio lives in `src/_pages/home/model/bio.ts` as short and long paragraphs per locale.

## Copy (i18n)

All interface strings live in `src/shared/i18n/{id,en}.ts`. Indonesian is the design's text; English is a translation.

| Key                    | Indonesian                                                                                                                                                  | English                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| meta.siteTitle         | Risqi Romadhoni                                                                                                                                             | Risqi Romadhoni                                                                                                                |
| meta.title             | {page} · Risqi Romadhoni                                                                                                                                    | {page} · Risqi Romadhoni                                                                                                       |
| meta.homeDescription   | Situs pribadi @risqiromadhoni, software engineer, berisi indeks tulisan, tulisan panjang, dan catatan singkat.                                              | Personal site of @risqiromadhoni, a software engineer, with a writing index, long-form posts and short notes.                  |
| nav.home               | Beranda                                                                                                                                                     | Home                                                                                                                           |
| nav.writing            | Tulisan                                                                                                                                                     | Writing                                                                                                                        |
| nav.notes              | Catatan                                                                                                                                                     | Notes                                                                                                                          |
| lang.current (sr-only) | (bahasa aktif)                                                                                                                                              | (current language)                                                                                                             |
| home.contact           | Kirim email                                                                                                                                                 | Send email                                                                                                                     |
| home.contactLabel      | Kirim email ke Risqi                                                                                                                                        | Send email to Risqi                                                                                                            |
| home.contactSubject    | Halo Risqi                                                                                                                                                  | Hi Risqi                                                                                                                       |
| home.contactBody       | Halo Risqi, Saya menemukan website kamu dan ingin menyapa. 👋                                                                                               | Hi Risqi, I found your website and wanted to say hello. 👋                                                                     |
| home.bio               | Bio                                                                                                                                                         | Bio                                                                                                                            |
| home.bioShort          | Singkat                                                                                                                                                     | Short                                                                                                                          |
| home.bioLong           | Panjang                                                                                                                                                     | Long                                                                                                                           |
| home.notes             | Catatan                                                                                                                                                     | Notes                                                                                                                          |
| home.writing           | Tulisan                                                                                                                                                     | Writing                                                                                                                        |
| home.seeAll            | Lihat semua                                                                                                                                                 | See all                                                                                                                        |
| theme.toDark           | Beralih ke mode gelap                                                                                                                                       | Switch to dark mode                                                                                                            |
| theme.toLight          | Beralih ke mode terang                                                                                                                                      | Switch to light mode                                                                                                           |
| writing.title          | Tulisan                                                                                                                                                     | Writing                                                                                                                        |
| writing.intro          | Catatan teknis tentang Effect, Cloudflare Workers, aksesibilitas, dan privasi. Ditulis dalam bahasa Indonesia, sebagian tersedia juga dalam bahasa Inggris. | Technical writing on Effect, Cloudflare Workers, accessibility and privacy. Written in Indonesian, some of it also in English. |
| writing.count          | {n} tulisan                                                                                                                                                 | {n} posts / 1 post                                                                                                             |
| writing.newest         | Terbaru                                                                                                                                                     | Newest                                                                                                                         |
| notes.title            | Catatan                                                                                                                                                     | Notes                                                                                                                          |
| notes.intro            | Catatan singkat: potongan kode, hal yang baru saya pelajari, dan pengingat untuk diri sendiri. Lebih pendek dari tulisan, lebih sering diperbarui.          | Short notes: code snippets, things I just learned and reminders to myself. Shorter than posts, updated more often.             |
| notes.count            | {n} catatan                                                                                                                                                 | {n} notes / 1 note                                                                                                             |
| notes.pinned           | Disematkan                                                                                                                                                  | Pinned                                                                                                                         |
| filter.all             | Semua                                                                                                                                                       | All                                                                                                                            |
| filter.search          | Cari tulisan                                                                                                                                                | Search posts                                                                                                                   |
| filter.results         | {n} tulisan ditemukan / {n} catatan ditemukan                                                                                                               | {n} posts found / {n} notes found                                                                                              |
| readingTime            | {n} mnt baca                                                                                                                                                | {n} min read                                                                                                                   |
| footer.markdown        | Semua tulisan juga tersedia sebagai {Markdown} untuk AI.                                                                                                    | Every post is also available as {Markdown} for AI.                                                                             |
| footer.rss             | RSS                                                                                                                                                         | RSS                                                                                                                            |
| article.backWriting    | Tulisan                                                                                                                                                     | Writing                                                                                                                        |
| article.backNotes      | Catatan                                                                                                                                                     | Notes                                                                                                                          |
| copy.page              | Salin Halaman                                                                                                                                               | Copy page                                                                                                                      |
| copy.copied            | Tersalin                                                                                                                                                    | Copied                                                                                                                         |
| copy.failed            | Gagal menyalin                                                                                                                                              | Copy failed                                                                                                                    |
| copy.menu              | Opsi lain                                                                                                                                                   | More options                                                                                                                   |
| copy.viewMarkdown      | Lihat sebagai Markdown                                                                                                                                      | View as Markdown                                                                                                               |
| copy.openIn            | Buka di {service}                                                                                                                                           | Open in {service}                                                                                                              |
| copy.prompt            | Baca {url} supaya saya bisa bertanya tentang isinya.                                                                                                        | Read {url} so I can ask questions about it.                                                                                    |
| code.copy              | Salin                                                                                                                                                       | Copy                                                                                                                           |
| note.tldr              | Singkatnya                                                                                                                                                  | In short                                                                                                                       |
| note.related           | Catatan lainnya                                                                                                                                             | More notes                                                                                                                     |
| note.previous          | Sebelumnya                                                                                                                                                  | Previous                                                                                                                       |
| note.next              | Berikutnya                                                                                                                                                  | Next                                                                                                                           |
| feedback.prompt        | Ada yang keliru?                                                                                                                                            | Spotted a mistake?                                                                                                             |
| feedback.link          | Kabari saya                                                                                                                                                 | Let me know                                                                                                                    |
| feedback.subject       | Koreksi: {title}                                                                                                                                            | Correction: {title}                                                                                                            |
| heading.anchor         | Tautan ke bagian ini                                                                                                                                        | Link to this section                                                                                                           |
| og.imageAlt            | Kartu berjudul “{title}” dari heyris                                                                                                                        | Card titled “{title}” from heyris                                                                                              |
| footnotes              | Catatan kaki                                                                                                                                                | Footnotes                                                                                                                      |
| footnote.back          | Kembali ke referensi {n}                                                                                                                                    | Back to reference {n}                                                                                                          |
| carousel.label         | Galeri                                                                                                                                                      | Gallery                                                                                                                        |
| carousel.previous      | Sebelumnya                                                                                                                                                  | Previous                                                                                                                       |
| carousel.next          | Berikutnya                                                                                                                                                  | Next                                                                                                                           |
| skipLink               | Langsung ke konten                                                                                                                                          | Skip to content                                                                                                                |
| notFound.title         | Halaman tidak ditemukan                                                                                                                                     | Page not found                                                                                                                 |
| notFound.body          | Halaman yang Anda cari tidak ada atau sudah dipindahkan.                                                                                                    | The page you are looking for does not exist or has moved.                                                                      |

Page titles: the home page is `meta.siteTitle`; every other page is `meta.title` with its own title (the index title, the entry title, or `notFound.title`). Meta descriptions: `meta.homeDescription` on home, `writing.intro` and `notes.intro` on the indexes, and the entry's `summary` on posts and notes.

Dates use `Intl.DateTimeFormat` with `id-ID` or `en`, in UTC: month and year for posts ("Oktober 2026"), day, month and year for notes ("12 November 2026"), the short weekday for note rows ("Kam").

## Responsive behaviour

The design has desktop frames only (1440 px). Below that:

- `lg` (1024 px) and up: the layouts above.
- Below `lg`:
  - Home becomes one column: the copy, then the illustration panel at 4:3.
  - Index pages put each rail above its list, not sticky; the header rail stacks above the intro; the controls wrap.
  - Wide figures and figure pairs take the full content width, and pairs stack.
- Below `sm` (640 px):
  - Outer padding is 20 px.
  - The contact trigger shows its icon only.
  - Post and note row meta moves under the text.
  - The top bar keeps every link visible (no hidden menu): the nav links shrink their gap to 16 px, and the nav wraps onto a second line under the site name when the row is too narrow (it needs about 440 px).
- Touch targets are at least 24 × 24 px (WCAG 2.2 target size). Inline links in text are exempt.

## Decisions where the design is silent or inconsistent

1. **"Lihat semua" on home** exists only in the dark frame. Both themes get it: structure can't depend on theme.
2. **Highlighted rows** (`lAU12` and the first note row) are read as the hover and focus state. The highlighted row's 17 px regular title is not copied, because changing type on hover shifts layout.
3. **Weekdays** are computed. The design's samples are wrong; for example, 2026-11-12 is a Kamis (Thursday), not Rabu.
4. **Note byline** in the design has "·" twice. The build uses one separator between each part.
5. **Notes search placeholder** stays "Cari tulisan", as designed.
6. **Theme toggle position:** one 96 px button at the moon's spot (330, 18), as the design note and the old site specify. The light frame's 76 px sun at (340, 0) is not followed.
7. **Home illustration** is a static block in normal flow, as the design note says, not sticky as in the old site.
8. **Title swap width:** the swap keeps the widest state's box, so the contact trigger sits after "Hi, nice to meet you 👋", not at the design's x = 343, where the greeting would run under it.
9. **Topic counts** on the notes pills are computed. The design's numbers (Effect 3, Cloudflare 2, …) don't match its own rows.
10. **Code blocks** have no line numbers. Line numbers appear only in the window source listing, as in the design.
11. **Footnotes:** the design shows markers but no list. The list renders at the end of the article, styled with tokens.
12. **Contact address** is `halo@heyris.me` (the bio copy and the old site), not the personal address in the design note.
13. **Home note list:** the design's 10 home labels don't match its 9 notes. The home shows the newest notes by their `label`, as decided with the user.
14. **Not designed, added:** a skip link, a 404 page, `llms.txt`, the sitemap, `robots.txt` and the feedback line, all styled with existing tokens.
15. **Feedback line** under every post and note (leerob.com/docs "Helpful", chosen by the user): a mail link, so it needs no form, backend or third-party script.
16. **Heading anchors** on prose `h2` and `h3` (leerob.com/docs "Polished"). Hidden at rest, so the designed layout is unchanged.
17. **Open Graph images** for every page, generated at build (leerob.com/docs "Polished", chosen by the user). The card layout is under Routes.
18. **Markdown alternate link** in each article's head (leerob.com/docs "Agent-ready", chosen by the user). Agents find the Markdown through it, the `.md` URL, and `/llms.txt`.
19. **No `Accept: text/markdown` negotiation.** Void serves prerendered pages as static assets before any app code runs, and its rewrites and header rules match paths, not request headers (`node_modules/void/docs/guide/edge/rewrites.md` and `headers.md`). Negotiating would mean rendering articles on every request. The user chose to keep them prerendered.
20. **No language detection.** `/` stays Indonesian for everyone, the ID / EN toggle switches, and each URL always serves the same page to crawlers. Detection would hit the same constraint as 19. Chosen by the user.
21. **No "Ask AI" sidebar.** It needs an AI backend, and the site loads no third-party scripts. The copy-page menu hands the page to the reader's own assistant instead.
22. **No MCP server, docs in `node_modules`, evals, codemods or migration guides.** leerob.com/docs aims these at libraries, and this is a personal site. The `.md` URLs and `/llms.txt` serve agents.
23. **Language switch on article pages.** The design's article top bar has only the back link. The ID / EN switch from the index top bar (`shared/ui/LanguageToggle`) sits on its right, so a reader of a translated entry can change language. An untranslated entry links to the other language's index. Home keeps the design: no switch; its counterpart is reachable from the indexes, and `hreflang` links it for search engines.
24. **English contact label** is "Send email to Risqi". The accessible name must contain the visible label "Send email" (axe `label-content-name-mismatch`), so the translation "Email Risqi" was changed.

## Open items for the owner

- **Long bio.** Drafted only from facts already in the design. Please rewrite it in `src/_pages/home/model/bio.ts`:

  > Saya software engineer dan penulis. Saya membangun situs web yang ringan, tanpa pelacak, dan sesuai WCAG 2.2 AA: kontras teks yang cukup, fokus keyboard yang selalu terlihat, target sentuh yang cukup besar, dan gerak yang berkurang bila diminta. Kodenya TypeScript dengan Effect, jalan di Cloudflare Workers. Situs yang sedang Anda baca ini contohnya.
  >
  > Situs ini tidak memasang cookie pelacak dan tidak memuat skrip pihak ketiga, jadi tidak perlu banner persetujuan. Halamannya tersedia dalam bahasa Indonesia dan Inggris, dan tema gelap atau terang mengikuti pilihan Anda.
  >
  > Saya menulis catatan teknis dalam bahasa Indonesia tentang Effect, Cloudflare Workers, aksesibilitas, privasi, dan performa web, dan setiap tulisan punya versi Markdown untuk dibaca manusia maupun AI. Kalau Anda punya proyek, pertanyaan, atau sekadar ingin menyapa, kirim surel ke halo@heyris.me.

- **English copy.** The English bio (in `src/_pages/home/model/bio.ts`, translated from the Indonesian draft without new claims; "catatan teknis" is "technical articles" so it doesn't collide with the Notes section), the contact email text, and every English string are my translations. Please review them.
- **Bio accuracy.** The short bio says the code is "TypeScript dengan Effect". This site is Astro and TypeScript without Effect. Keep or change the sentence.
- **Avatar.** The byline uses the illustration crop, as the design does. Supply a photo to replace it.
- **Artwork.** The illustration is the generated placeholder (`designs/generated-4.png`). The design note asks for your own artwork.
- **Domain.** `site` is `https://heyris.me`, used in canonical links, RSS, the sitemap and the copy-page prompts. The live deploy is still `heyris.risqi-romadhoni96.workers.dev`. Confirm `heyris.me` will point at this Worker before relying on those links.
- **Drafts.** 11 posts and 8 notes are drafts without bodies. They are hidden in production until you write them and remove `draft: true`.

## Verification

Run after each slice:

1. `vp run check` (format, lint, types, Knip).
2. `pnpm build`.
3. `pnpm test:e2e --project=chromium --project=webkit`. Firefox doesn't start on macOS 27; CI runs it.

Before calling the build done:

- Each page at 1440 px in light and dark: a pencil `TakeScreenshot` of the design frame next to a Playwright screenshot of the dev server. Also checked at 390 px and 768 px.
- axe (WCAG 2.2 AA tags) on every page in both themes, with the copy menu open, and with a filter applied.
- Behaviour:
  - the theme survives reload without a flash;
  - with reduced motion, the sky and swaps are instant and the shader draws one frame;
  - the rails release at the end of their group;
  - the progress bar follows scroll;
  - the copy menu works from the keyboard;
  - the `.md` URLs return `text/markdown`, and each article's head links to its `.md` with `rel="alternate"`;
  - `/llms.txt` lists every published entry and no drafts;
  - a crawl from `/` and `/en` (Playwright, chromium) gets 200 for every internal `href` and finds the element for every `#fragment`;
  - every `og:image` URL returns `image/png` at 1200 × 630, and two cards are checked by eye;
  - a content image with empty alt fails `pnpm build`, tried once on a scratch entry and then reverted;
  - drafts are absent from `dist/`.
- `pnpm build`, `pnpm astro preview`, then `pnpm unlighthouse:ci` over every page. The budgets stay at performance 90, accessibility 100, best practices 100 and SEO 90. A miss is reported, not hidden by lowering a budget.

### Lighthouse results

Budgets unchanged (90 / 100 / 100 / 90), mobile emulation, eight routes (`/404` is not scored, because Lighthouse refuses to score a 404 document).

Final build, with asynchronous shader linking. Three runs of `pnpm unlighthouse:ci` on the same build:

| Route                                              | Run 1 | Run 2 | Run 3 | Median |
| -------------------------------------------------- | ----- | ----- | ----- | ------ |
| `/`                                                | 100   | 100   | 100   | 100    |
| `/catatan`                                         | 98    | 100   | 100   | 100    |
| `/catatan/retry-dengan-schedule`                   | 100   | 93    | 100   | 100    |
| `/en`                                              | 94    | 92    | 96    | 94     |
| `/en/notes`                                        | 100   | 99    | 100   | 100    |
| `/en/writing`                                      | 100   | 100   | 100   | 100    |
| `/tulisan`                                         | 100   | 100   | 100   | 100    |
| `/tulisan/situs-pribadi-cloudflare-workers-vinext` | 100   | 82    | 100   | 100    |

- Accessibility, best practices and SEO are 100 on every route in every run.
- Every median is at or above 90, but one run missed: the post page scored 82 in run 2, so the target (90 or above in every run) is not met. The Unlighthouse report folder is overwritten each run, so that run's audits were not kept.
- Before this change, four earlier runs on the synchronous build gave `/` 78 to 100, the note page 83 to 100 and `/en` 77 to 100.
- Compile and link no longer block the main thread. On the note page, Playwright probes on Chrome found no WebGL call above 0.3 ms except `getContext` (6 to 64 ms). Lighthouse's audits still attribute 659 to 767 ms of scripting to the shader chunk on that page, which the probes do not reproduce, so its cause is not confirmed.
- Starting the shader after the `load` event was tried and not kept: its traces showed no drop in the note page's blocking time, and it gave more misses across three runs.
