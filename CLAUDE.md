# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- Run scripts with `pnpm dev` / `pnpm build` (or `vp run dev` / `vp run build`), never `vp dev` / `vp build`: those run plain Vite without the Astro and Void plugins.
- `vp check` formats, lints and type-checks; `vp check --fix` rewrites files. It skips `.astro` files, so match their existing style by hand.
- The pre-commit hook runs `vp check --fix` on staged files (`vp staged`), so a lint or type error blocks the commit.
- There are no tests yet; skip `vp test`.
- Deploy with `pnpm void deploy --platform cloudflare`. Plain `void deploy` fails without an interactive terminal.

## Conventions

- Conventional Commits (`type(scope): summary`, for example `chore(ui): init design`). Branches are `<type>/<kebab-case-summary>`.
- Naming: camelCase for variables and functions, PascalCase for types, classes and components, UPPER_SNAKE_CASE for true constants.
- Comment only non-obvious intent; use TSDoc `/** */` on exported APIs. No commented-out code.
- oxlint enforces `max-lines: 200` per file, counting blank lines and comments. Split a file before it reaches that.

## Gotchas

- `astro.config.mjs` uses `output: "server"` because Void's deploy needs Astro's Worker entry. Pages render on request unless they `export const prerender = true`. Don't switch back to `output: "static"`.
- pnpm 12 blocks install scripts. A new dependency that needs one must be added to `allowBuilds` in `pnpm-workspace.yaml`. Upgrading `astro` or its `@astrojs/*` internals also means updating the exact versions in `minimumReleaseAgeExclude`.
- Design tokens (colours, type, spacing) are in `DESIGN.md`. `design.pen` is encrypted: open it only through the pencil MCP tools.
