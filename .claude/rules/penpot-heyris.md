# Penpot file for heyris

Read `penpot.md` first; this file holds only what is specific to this site. The Penpot file mirrors the site: `DESIGN.md` and the code in `src/` stay the source of truth.

## The file (as of 2026-11-16)

- Pages:
  - `Screens · Desktop`: 7 boards at 1440 wide, 1640 apart.
  - `Screens · Mobile`: 7 boards at 390 wide, 490 apart.
  - `Components`: 17 components.
  - `Foundations`: colour tokens, typography specimens and icons.
- The library has 34 colours (light and dark) and 41 typographies.
- Tokens:
  - Colour tokens are in the sets `mode/light` and `mode/dark`, switched by the themes Mode/Light (active) and Mode/Dark. They are the `lr-*` tokens from `DESIGN.md` plus the `code-*` syntax colours.
  - Font family tokens (`font.serif`, `font.sans`, `font.mono`) are in the set `base`.
- Each screen board is as tall as the site's full-page screenshot. On Home, the night layers and the moon are hidden and suffixed "(dark mode)", and the sun is suffixed "(light mode)".
- The illustration is uploaded from `https://heyris.me/_astro/generated-4.CqT2K9Zl_Z1PSyt6.jpg`.

## Open differences from the site

- Source Serif 4 runs about 6 % wider, because the site pins `opsz` 20. Some serif titles touch their dates, and a few link arrows overlap the end of the text.
- 18 mixed-colour texts (the home bio, some post and note meta lines) use raw colours, so they don't follow the theme.
- Underlines use the text colour, not `lr-underline`.
- Board names contain " / ", for example "Writing index · / tulisan".
- DM Mono 600 is set as 500.
- The desktop boards were built with converter v9 and the mobile boards with v10.
- The screens use plain shapes, not instances of the components.
- `DESIGN.md` says post summaries are sans, but the site sets them in Source Serif 4 at 17 px. The boards follow the site.

## One-off fixes on the mobile boards

The following fixes were made by hand. Reapply them after rebuilding those boards:

- the illustration crop
- the search placeholder
- footer spacing
- commit-list truncation
- one diagram label

## Pipeline

The 2026-11-16 build used the method in `penpot.md`, from `/tmp/penpot-migrate`, so it is gone after a reboot. The pipeline had these parts:

- `extract.mjs` and `merge.mjs` wrote one spec per page and viewport: `spec/<page>-<desktop|mobile>.merged.json`.
- `serve.mjs` served those files on 127.0.0.1:4399.
- `converter.js` v10 exposed `storage.loadSpec(name)`, `storage.build(name, { boardName, x, y })`, `storage.findNodes(spec, nameRe, textRe)` and `storage.buildFragment(index, { boardName, x, y })`.
- `BRIEF.md` held the agent rules.

The spec page names were:

| Spec name       | Route                                     |
| --------------- | ----------------------------------------- |
| `home`          | `/`                                       |
| `writing-index` | `/tulisan`                                |
| `notes-index`   | `/catatan`                                |
| `post`          | `/tulisan/backdrop-webgl-renderer-software` |
| `note`          | `/catatan/pin-github-actions-ke-sha`      |
| `not-found`     | `/404`                                    |
| `offline`       | `/offline`                                |

If rebuilding becomes routine, move the pipeline into `tools/penpot/` first, and add that folder to `tools/ignore-patterns.ts` if it shouldn't be linted.
