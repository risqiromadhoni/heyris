# Content authoring

Entries are Markdown files in `src/content/posts/<locale>/<slug>.md` (tulisan) and `src/content/notes/<locale>/<slug>.md` (catatan). `<locale>` is `id` or `en`. The English version of an entry is the same slug under `en/`. Open `src/content/posts/id/situs-pribadi-cloudflare-workers-vinext.md` as the reference for every construct below.

## Frontmatter

Schema: `src/content.config.ts`. Allowed `topic` and `icon` values: `src/shared/api/content/topics.ts`.

| Field         | Posts | Notes | Meaning                                                                                  |
| ------------- | ----- | ----- | ---------------------------------------------------------------------------------------- |
| `title`       | yes   | yes   | Page title and row title.                                                                |
| `summary`     | yes   | yes   | One line on index rows, RSS and `llms.txt`.                                              |
| `date`        | yes   | yes   | `2026-10` (month) for posts, `2026-11-12` (day) for notes.                               |
| `topic`       | yes   | yes   | Enum key. Featured topics get a tab or pill; the rest appear under "Semua" only.         |
| `draft`       | yes   | yes   | `true` shows the entry in `pnpm dev` only. Builds leave it out.                          |
| `readingTime` | opt.  | opt.  | Minutes. Overrides the count from the word count (200 words a minute).                   |
| `label`       | no    | opt.  | Text for the home note list. Falls back to `title`.                                      |
| `icon`        | no    | yes   | Phosphor icon key from `NOTE_ICONS`.                                                     |
| `tags`        | no    | opt.  | List of strings, shown as pills. Defaults to `[]`.                                       |
| `pinned`      | no    | opt.  | Shows the note as a card in the pinned section of the notes index, not in a month group. |
| `tldr`        | no    | opt.  | Text for the "Singkatnya" box, shown above the body.                                     |

A translation is a separate file. If `en/<slug>.md` is missing, the English index shows the Indonesian entry, marked `lang="id"`, and links to the Indonesian page.

## Headings and anchors

- `h2` and `h3` get a `#` link, and their ids come from the heading text.
- Write `{#id}` at the end of a heading to fix its id. Use it on any heading another page links to, so the link still works after the heading is renamed.
- The link check (`e2e/links/`) fails on a `#fragment` with no matching id.

## Images

Every image needs alt text (`![Deskripsi](/gambar.png)`). `pnpm build` fails on an empty alt and names the file and the image. Decorative art is CSS, not an image.

## Code fences

- ` ```ts {title=retry.ts} ` shows the file name in a header, with a copy button.
- ` ```md {.line-numbers} ` adds a number gutter. The numbers are not copied.

## Container directives

Blocks use `:::name` to open and `:::` to close. A container nested inside another adds one colon per level, so the outer block uses three colons, the next four, and so on.

| Directive                        | Contents                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `:::figure` / `:::figure{.wide}` | A framed block with a decorative backdrop. `.wide` makes it wider on desktop.                       |
| `:::figure-pair`                 | Two or more `window` blocks, each a framed panel. Side by side, stacked on narrow screens.          |
| `::::window{address="…"}`        | Window chrome with an address pill. Wraps any block, including a fence (shown as a source listing). |
| `:::diagram`                     | One box per list item, written `Judul: subtitle`.                                                   |
| `:::commits`                     | One row per list item, written `hash message`. The first word is the hash.                          |
| `:::checklist`                   | One row per list item, written `label: detail`.                                                     |
| `:::carousel`                    | Each child block is one slide. Slides are in the HTML, so the track scrolls without JavaScript.     |

The names are the list in `src/app/markdown/directives.ts`. An unknown container name fails `pnpm build`. Single-colon and double-colon directives such as `::name` or `Catatan:penting` are not containers: they render as the literal text.

## Writing

Based on https://leerob.com/docs.

- Keep it short. One idea per paragraph.
- Use scannable headings: one `h2` per step or topic, `h3` under it.
- Put code in fences a reader can copy, with a title when it is a file.
- Give commands instead of click paths.
- Add complexity one step at a time. Explain the basic case before the options.
- Cite the design contract, `docs/design-implementation.md`, for anything about layout or behaviour.

## Drafts and builds

- `draft: true` entries are listed and reachable only under `pnpm dev`, which is how you preview a new entry.
- A build leaves drafts out of the index, the feeds, `llms.txt`, the sitemap and the OG images.
- The OG card, the `.md` endpoint and the `llms.txt` line are generated from the entry. Nothing else needs a manual edit.
