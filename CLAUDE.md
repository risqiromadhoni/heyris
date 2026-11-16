# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- Run scripts with `pnpm dev` / `pnpm build` (or `vp run dev` / `vp run build`), never `vp dev` / `vp build`: those run plain Vite without the Astro and Void plugins.
- `vp check` formats, lints and type-checks; `vp check --fix` rewrites files. It skips `.astro` files, so match their existing style by hand.
- The pre-commit hook (`vp staged`) runs `vpr check:fix` over the whole project (`vp check --fix`, `astro check`, then `knip --fix`), then `vp test`. A lint, type or unused-code error, or a failing test, blocks the commit. The `staged` task is a function so lint-staged doesn't append file paths, which Knip and Vitest would misread; it returns both commands in an array, which runs them in order. It checks the working tree, not the staged files, so a commit holding part of the changes passes only if the tree at that moment would pass on its own: set the tree to that commit's state before committing.
- `pnpm check` runs `vp check`, then `astro check` (types in `.astro` files, which `vp check` skips), then Knip (unused files, exports and dependencies). Knip, `vp lint` and `vp fmt` share the ignore list in `tools/ignore-patterns.ts`; add new agent-tooling folders there, not in one tool's config.
- Unused imports, variables and parameters are errors: oxlint's `no-unused-vars` in `.ts`, and `noUnusedLocals` / `noUnusedParameters` in `tsconfig.json` for `astro check`. Prefix a parameter that must stay with `_`.
- `typescript` is pinned to `^6` because `@astrojs/check` 0.9 accepts only TypeScript 5 or 6. Don't upgrade it to 7 until `@astrojs/check` supports it.
- `pnpm test` (`vp test`) runs Vitest once in three projects: `unit` (`src/**/*.test.ts`, Node), `browser` (`src/**/*.browser.test.ts`, headless Chromium) and `types` (`src/**/*.test-d.ts`, `tsc` only). Read `.claude/rules/vitest.md` before writing one.
- `vp check` and the `types` tests read the generated `.astro/` types, so a fresh clone needs `pnpm astro sync` first. CI runs it before both.
- End-to-end and accessibility tests are Playwright (`pnpm test:e2e`); read `.claude/rules/playwright.md` before writing one.
- Lighthouse budgets (in `unlighthouse.config.ts`: performance 90, accessibility 100, best practices 100, SEO 90): `pnpm build`, `pnpm astro preview`, then `pnpm unlighthouse:ci`. Stop the preview with `pnpm astro preview stop`.
- Size budgets live in `.size-limit.json` and are measured with Brotli by `@size-limit/file`: `pnpm build`, then `pnpm size`. They cover the external JS chunks in `dist/client/_astro/` (the WebGL backdrop as its own check) and all CSS; scripts Astro inlines into the HTML aren't counted. `size.yml` runs them on pushes and PRs, and the release workflow runs them before deploy. Raise a limit only on purpose, in the commit that needs it.
- CI in `.github/workflows/` runs the check, test, Playwright, Unlighthouse and size workflows on pushes and pull requests to `main`, through `voidzero-dev/setup-vp` pinned to an exact release. The five are also reusable (`workflow_call`), and the release workflow calls them. Their concurrency groups include the file stem (`${{ github.workflow }}-check-${{ github.ref }}`) because a called workflow sees the caller's `github.workflow`: without the stem, all five called from Release would share one group and cancel one another. Don't drop it.
- Dependabot (`.github/dependabot.yml`) opens weekly grouped PRs for npm and GitHub Actions. Coupled packages share a group: astro with `@astrojs/*`, vite-plus with `@vitest/browser-playwright`, `playwright` with `@playwright/test`, and `size-limit` with `@size-limit/*` (the plugin's peer dependency pins the exact version). An astro upgrade PR still needs its exact versions updated by hand in `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. `.github/CODEOWNERS` makes `@risqiromadhoni` the owner of every file.
- Production deploys run only from `.github/workflows/release.yml`. release-please keeps a release PR open on `main`; merging it tags `vX.Y.Z`, creates the GitHub release, calls the check, Vitest, Playwright, Unlighthouse and size workflows, and only if all five pass runs `void:deploy` (`void deploy --platform cloudflare`) with the `CLOUDFLARE_API_TOKEN` secret. To redeploy without a release (after a `chore(deps)` bump, for example), use Actions → Release → Run workflow, which runs the same gates. If a gate fails from noise (Unlighthouse, usually), use "Re-run failed jobs" on the Release run, and the deploy continues once it passes. `feat` bumps the minor, `fix` and `perf` the patch, and `!` or a `BREAKING CHANGE` footer the major. Don't edit `CHANGELOG.md` or the `version` in `package.json` by hand. `pnpm deploy` is a pnpm built-in, not the script.

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

- `site` comes from `VITE_APP_SITE` (declared in `env.ts`, default `https://heyris.risqi-romadhoni96.workers.dev`). Set it in the build shell, for example `VITE_APP_SITE=https://heyris.me pnpm void:deploy`. In CI, the release workflow reads it from the `VITE_APP_SITE` repo variable, and falls back to the default when that variable is unset. `.env` never reaches it: Void builds ignore `.env`, and `astro.config.mjs` reads only `process.env`. Read it in code as `Astro.site`, `context.site` or `SITE.url`, never as `env.VITE_APP_SITE` from `void/env`, which throws outside a Worker request.
- `tsconfig.json` lists `.astro/types.d.ts` in `files` so it loads before Void's `.void/*.d.ts`. `@cloudflare/workers-types`, which `void/env` pulls in, declares its own global `ImageMetadata`. With `skipLibCheck` the first declaration wins, so if Cloudflare's loads first, every image import fails `astro check` with `Type 'ImageMetadata' is not assignable`. Keep Astro's types in `files`, and keep `.void/*.d.ts` in `include`, because a `files` list replaces the one inherited from `.void/tsconfig.json`.
- `astro.config.mjs` uses `output: "server"` because Void's deploy needs Astro's Worker entry. Pages render on request unless they `export const prerender = true`. Don't switch back to `output: "static"`.
- pnpm 12 installs before `pnpm exec` or `pnpm run` whenever `package.json` differs from `node_modules`. A `git stash` that holds a dependency change therefore uninstalls it on the next pnpm command; run `pnpm install --frozen-lockfile` after `git stash pop`.
- pnpm 12 blocks install scripts. A new dependency that needs one must be added to `allowBuilds` in `pnpm-workspace.yaml` (`false` denies it, as for `puppeteer` and `vue-demi`, which Unlighthouse does not need). Upgrading `astro` or its `@astrojs/*` internals also means updating the exact versions in `minimumReleaseAgeExclude`, and the pinned `@astrojs/markdown-satteri` dev dependency to the version `astro` uses.
- When Astro detects an agent on macOS or Linux, `astro dev` and `astro preview` run in the background, so the command returns at once. Pass `--ignore-lock` to keep either one in the foreground, as Playwright's `webServer` and CI do.
- Void's dev server writes its dev-trigger middleware to `src/middleware.ts` and deletes it when it stops cleanly. The file's `.gitignore` line is committed: Void adds the line only when it's missing and removes only lines it added, so `.gitignore` stays unchanged during dev. A killed server leaves the file behind, and the next server treats it as your own middleware and never deletes it. Delete it before `pnpm build` or `pnpm void:deploy`, or the build ships it. Playwright stops its dev server with SIGTERM for this reason.
- Write your own Astro middleware in `src/middleware/index.ts`. `src/middleware.ts` is gitignored, so a file there would be left out of git. Void doesn't write its own middleware while either file exists.
- Design tokens (colours, type, spacing) are in `DESIGN.md`. `design.pen` is encrypted: open it only through the pencil MCP tools.
- Keep `build.format: "file"` with `trailingSlash: "never"`. Cloudflare redirects `/x` to `/x/` for directory output.
- URLs of the previous heyris.me (`/posts/<slug>`, `/id/posts/<slug>`, `/about`, `/projects`, `/resources`, `/tags`) redirect with a 301. Page URLs are in `oldSiteRedirects` in `astro.config.mjs`. Post URLs are endpoints (`src/pages/posts/[slug].ts`, `src/pages/id/posts/[slug].ts`), not config entries: with `build.format: "file"` the adapter writes a `[slug]` redirect to `_redirects` with a `.html` target, which costs a second hop (301, then 307). Trailing-slash URLs such as `/posts/` stay 404, because Astro's `redirects` cannot match them.
- UnoCSS reads class names from `.astro` files and from `content.filesystem` in `uno.config.ts` (`src/**/*.{md,mdc,markdown}`, `src/app/markdown/**/*.ts`). A class used in any other `.ts` file is not generated.
- The Markdown plugins emit `md-*` classes, styled in `src/shared/ui/Prose/prose.css`.
- Astro caches rendered Markdown in `.astro/data-store.json` and `node_modules/.astro/data-store.json`. After changing a plugin in `src/app/markdown/` or a Shiki option, the dev server keeps serving the old HTML, even with `--force`. Delete both files, then `pnpm astro dev stop` and `pnpm astro dev --background`.
- `@astrojs/cloudflare` prerenders in workerd, which can't compile WebAssembly at runtime. The OG cards use `@resvg/resvg-wasm` through a `?module` import (`src/shared/lib/og-image/render.ts`). Satori fails there.
- Source Serif 4 is requested with `opsz` fixed at 20 through `fontProviders.google()` options in `astro.config.mjs`. Without it, serif text runs about 4 % wider than the design.
- Builds need network access to Google Fonts, for the site fonts and the OG card TTFs.
- Lighthouse scores are noisy: a loaded machine dropped scores by 10 to 25 points in one run. Re-run on a quiet machine before calling a performance miss real. The WebGL backdrop is the largest remaining cost: it compiles asynchronously (`KHR_parallel_shader_compile`, chunked fallback in `src/shared/ui/ShaderCanvas/gl-link.ts`), and Lighthouse's `bootup-time` audit still attributes most page scripting to its chunk. Playwright's bundled Chromium uses SwiftShader without that extension, so measure shader timing in installed Chrome (`channel: "chrome"`).
