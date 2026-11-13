# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- Run scripts with `pnpm dev` / `pnpm build` (or `vp run dev` / `vp run build`), never `vp dev` / `vp build`: those run plain Vite without the Astro and Void plugins.
- `vp check` formats, lints and type-checks; `vp check --fix` rewrites files. It skips `.astro` files, so match their existing style by hand.
- The pre-commit hook (`vp staged`) runs `vpr check:fix` over the whole project (`vp check --fix`, `astro check`, then `knip --fix`), then `vp test`. A lint, type or unused-code error, or a failing test, blocks the commit. The `staged` task is a function so lint-staged doesn't append file paths, which Knip and Vitest would misread; it returns both commands in an array, which runs them in order.
- `pnpm check` runs `vp check`, then `astro check` (types in `.astro` files, which `vp check` skips), then Knip (unused files, exports and dependencies). Knip, `vp lint` and `vp fmt` share the ignore list in `tools/ignore-patterns.ts`; add new agent-tooling folders there, not in one tool's config.
- Unused imports, variables and parameters are errors: oxlint's `no-unused-vars` in `.ts`, and `noUnusedLocals` / `noUnusedParameters` in `tsconfig.json` for `astro check`. Prefix a parameter that must stay with `_`.
- `typescript` is pinned to `^6` because `@astrojs/check` 0.9 accepts only TypeScript 5 or 6. Don't upgrade it to 7 until `@astrojs/check` supports it.
- `pnpm test` (`vp test`) runs Vitest once in three projects: `unit` (`src/**/*.test.ts`, Node), `browser` (`src/**/*.browser.test.ts`, headless Chromium) and `types` (`src/**/*.test-d.ts`, `tsc` only). Read `.claude/rules/vitest.md` before writing one.
- `vp check` and the `types` tests read the generated `.astro/` types, so a fresh clone needs `pnpm astro sync` first. CI runs it before both.
- End-to-end and accessibility tests are Playwright (`pnpm test:e2e`); read `.claude/rules/playwright.md` before writing one.
- Lighthouse budgets (in `unlighthouse.config.ts`: performance 90, accessibility 100, best practices 100, SEO 90): `pnpm build`, `pnpm astro preview`, then `pnpm unlighthouse:ci`. Stop the preview with `pnpm astro preview stop`.
- CI in `.github/workflows/` runs the check, test, Playwright and Unlighthouse workflows on pushes and pull requests to `main`, through `voidzero-dev/setup-vp` pinned to an exact release.
- Deploy with `pnpm void:deploy` (`void deploy --platform cloudflare`). Plain `void deploy` fails without an interactive terminal, and `pnpm deploy` is a pnpm built-in, not the script.

## Conventions

- Conventional Commits (`type(scope): summary`, for example `chore(ui): init design`). Branches are `<type>/<kebab-case-summary>`.
- Naming: camelCase for variables and functions, PascalCase for types, classes and components, UPPER_SNAKE_CASE for true constants.
- Comment only non-obvious intent; use TSDoc `/** */` on exported APIs. No commented-out code.
- oxlint enforces `max-lines: 200` per file, counting blank lines and comments. Split a file before it reaches that.
- Style with UnoCSS (`uno.config.ts`): `presetWind4` (Tailwind 4 compatible utilities and reset), `presetTypography`, the MDC extractor and the variant group transformer. Don't add `@unocss/reset` or another base preset.
- Use the `lr-*` theme colours (`bg-lr-bg`, `text-lr-nav`, `border-lr-line`; opacity modifiers work) and `font-serif` / `font-sans` / `font-mono`, never raw hex values or font stacks. They mirror the `DESIGN.md` tokens, so change both together. Dark mode is the `dark` class on `<html>` and the tokens swap themselves, so `dark:` variants are rarely needed. `prose` already uses the tokens.
- Variant groups (`hover:(bg-lr-surface text-lr-heading)`) work in any file. In Markdown, add classes with `{.class}` after a heading, link, emphasis or block (Sätteri `attributes`); `src/**/*.{md,mdc,markdown}` is scanned for them.
- The vendored anti-slop rules (`tools/oxlint/anti-slop/`, provenance in its `UPSTREAM.md`) are on. Every non-const `as` needs a `// SAFETY: <invariant>` comment just above it, the one required exception to the minimal-comment rule. Parse at the boundary instead of using `unknown` or `object` parameters, returns or dictionaries, or ad hoc `typeof` checks. Fix findings; never disable a rule or launder types to pass. Update the plugin through the `install-anti-slop` skill.

## Layout (Feature-Sliced Design)

The design contract is `docs/design-implementation.md`; its "Folder structure" section has the full tree.

- `src/pages/` holds thin Astro routes only. Each imports one page from `@/_pages/<slice>` and renders it. Routes may import `@/app/layouts` and `@/app/feed`.
- `src/_pages/<slice>` is the FSD pages layer. Imports point down only: `_pages` imports `features` and `shared`, `features` imports `shared`, and `shared` imports neither. Nothing under `_pages`, `features` or `shared` imports `app`.
- Import a slice through its `index.ts`, not a deep path. Two exceptions: `app/layouts` and `app/feed` have no index, and `@/shared/api/content/topics` is imported directly by `content.config.ts` and `shared/i18n`.
- A component used by one page stays in that page's slice. Move it to `features/` or `shared/` once a second page uses it.
- There is no entities or widgets layer. Content queries live in `shared/api/content`.

## Content

Frontmatter, directive syntax and writing rules: `docs/content-authoring.md`.

- Entries live in `src/content/{posts,notes}/{id,en}/<slug>.md`. A translation is the same slug under `en/`.
- `draft: true` entries show in `pnpm dev` only.
- `vp fmt` skips `src/content/**`, so keep Markdown formatting by hand.

## i18n

- `src/shared/i18n/routes.ts` is the only file that knows the localized segments (`tulisan`/`writing`, `catatan`/`notes`). Build links with `localizedPath()`.
- UI strings live in `src/shared/i18n/id.ts` and `en.ts`. `en.ts` is typed as `Dictionary` (`typeof id`), so a missing or extra key fails the type check.

## Gotchas

- `astro.config.mjs` uses `output: "server"` because Void's deploy needs Astro's Worker entry. Pages render on request unless they `export const prerender = true`. Don't switch back to `output: "static"`.
- pnpm 12 installs before `pnpm exec` or `pnpm run` whenever `package.json` differs from `node_modules`. A `git stash` that holds a dependency change therefore uninstalls it on the next pnpm command; run `pnpm install --frozen-lockfile` after `git stash pop`.
- pnpm 12 blocks install scripts. A new dependency that needs one must be added to `allowBuilds` in `pnpm-workspace.yaml` (`false` denies it, as for `puppeteer` and `vue-demi`, which Unlighthouse does not need). Upgrading `astro` or its `@astrojs/*` internals also means updating the exact versions in `minimumReleaseAgeExclude`, and the pinned `@astrojs/markdown-satteri` dev dependency to the version `astro` uses.
- When Astro detects an agent it runs `astro dev` and `astro preview` in the background, so the command returns at once. Pass `--ignore-lock` to keep one in the foreground, as Playwright's `webServer` and CI do.
- Void's dev server writes `src/middleware.ts` and a `.gitignore` line for it, and removes both when it stops cleanly. A killed server leaves them behind: delete both before `pnpm build` or `pnpm void:deploy`, or the build ships Void's dev-trigger middleware. Never commit that line. Playwright stops its dev server with SIGTERM for this reason.
- Design tokens (colours, type, spacing) are in `DESIGN.md`. `design.pen` is encrypted: open it only through the pencil MCP tools.
- Keep `build.format: "file"` with `trailingSlash: "never"`. Cloudflare redirects `/x` to `/x/` for directory output.
- UnoCSS reads class names from `.astro` files and from `content.filesystem` in `uno.config.ts` (`src/**/*.{md,mdc,markdown}`, `src/app/markdown/**/*.ts`). A class used in any other `.ts` file is not generated.
- The Markdown plugins emit `md-*` classes, styled in `src/shared/ui/Prose/prose.css`.
- `@astrojs/cloudflare` prerenders in workerd, which can't compile WebAssembly at runtime. The OG cards use `@resvg/resvg-wasm` through a `?module` import (`src/shared/lib/og-image/render.ts`). Satori fails there.
- Source Serif 4 is requested with `opsz` fixed at 20 through `fontProviders.google()` options in `astro.config.mjs`. Without it, serif text runs about 4 % wider than the design.
- Builds need network access to Google Fonts, for the site fonts and the OG card TTFs.
- Lighthouse scores are noisy: a loaded machine dropped scores by 10 to 25 points in one run. Re-run on a quiet machine before calling a performance miss real. The WebGL backdrop is the largest remaining cost: it compiles asynchronously (`KHR_parallel_shader_compile`, chunked fallback in `src/shared/ui/ShaderCanvas/gl-link.ts`), and Lighthouse's `bootup-time` audit still attributes most page scripting to its chunk. Playwright's bundled Chromium uses SwiftShader without that extension, so measure shader timing in installed Chrome (`channel: "chrome"`).
