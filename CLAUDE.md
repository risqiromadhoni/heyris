# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- Run scripts with `pnpm dev` / `pnpm build` (or `vp run dev` / `vp run build`), never `vp dev` / `vp build`: those run plain Vite without the Astro and Void plugins.
- `vp check` formats, lints and type-checks; `vp check --fix` rewrites files. It skips `.astro` files, so match their existing style by hand.
- The pre-commit hook runs `vp check --fix` on staged files (`vp staged`), so a lint or type error blocks the commit.
- `pnpm check` runs `vp check` then Knip (unused files, exports and dependencies). Knip, `vp lint` and `vp fmt` share the ignore list in `tools/ignore-patterns.ts`; add new agent-tooling folders there, not in one tool's config.
- There are no unit tests, so skip `vp test`. End-to-end and accessibility tests are Playwright (`pnpm test:e2e`); read `.claude/rules/playwright.md` before writing one.
- Lighthouse budgets (in `unlighthouse.config.ts`: performance 90, accessibility 100, best practices 100, SEO 90): `pnpm build`, `pnpm astro preview`, then `pnpm unlighthouse:ci`. Stop the preview with `pnpm astro preview stop`.
- CI in `.github/workflows/` runs the check, Playwright and Unlighthouse workflows on pushes and pull requests to `main`, through `voidzero-dev/setup-vp` pinned to an exact release.
- Deploy with `pnpm void:deploy` (`void deploy --platform cloudflare`). Plain `void deploy` fails without an interactive terminal, and `pnpm deploy` is a pnpm built-in, not the script.

## Conventions

- Conventional Commits (`type(scope): summary`, for example `chore(ui): init design`). Branches are `<type>/<kebab-case-summary>`.
- Naming: camelCase for variables and functions, PascalCase for types, classes and components, UPPER_SNAKE_CASE for true constants.
- Comment only non-obvious intent; use TSDoc `/** */` on exported APIs. No commented-out code.
- oxlint enforces `max-lines: 200` per file, counting blank lines and comments. Split a file before it reaches that.
- The vendored anti-slop rules (`tools/oxlint/anti-slop/`, provenance in its `UPSTREAM.md`) are on. Every non-const `as` needs a `// SAFETY: <invariant>` comment just above it, the one required exception to the minimal-comment rule. Parse at the boundary instead of using `unknown` or `object` parameters, returns or dictionaries, or ad hoc `typeof` checks. Fix findings; never disable a rule or launder types to pass. Update the plugin through the `install-anti-slop` skill.

## Gotchas

- `astro.config.mjs` uses `output: "server"` because Void's deploy needs Astro's Worker entry. Pages render on request unless they `export const prerender = true`. Don't switch back to `output: "static"`.
- pnpm 12 blocks install scripts. A new dependency that needs one must be added to `allowBuilds` in `pnpm-workspace.yaml` (`false` denies it, as for `puppeteer` and `vue-demi`, which Unlighthouse does not need). Upgrading `astro` or its `@astrojs/*` internals also means updating the exact versions in `minimumReleaseAgeExclude`.
- When Astro detects an agent it runs `astro dev` and `astro preview` in the background, so the command returns at once. Pass `--ignore-lock` to keep one in the foreground, as Playwright's `webServer` and CI do.
- Void's dev server writes `src/middleware.ts` and a `.gitignore` line for it, and removes both when it stops cleanly. A killed server leaves them behind: delete both before `pnpm build` or `pnpm void:deploy`, or the build ships Void's dev-trigger middleware. Never commit that line. Playwright stops its dev server with SIGTERM for this reason.
- Design tokens (colours, type, spacing) are in `DESIGN.md`. `design.pen` is encrypted: open it only through the pencil MCP tools.
