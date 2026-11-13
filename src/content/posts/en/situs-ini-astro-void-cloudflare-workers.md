---
title: "Astro and Void on Cloudflare Workers: how this site is built"
summary: "The technology behind this site, from Astro 7 and Void to tests and CI."
date: 2026-11-14
topic: astro
---

This site uses Astro 7 and is configured for Cloudflare Workers through Void. Void is a tool for building and deploying full-stack apps with Vite. This post goes through that setup one part at a time. Each section names the file that configures it.

## Server mode and static pages

I use `output: "server"` because Void's deploy needs the Worker entry from Astro. In this mode, Astro [renders each page when it is requested](https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering), unless the page sets `prerender = true`.

Every file in `src/pages` sets `prerender = true`, except the redirect endpoints for old URLs. At build time, Astro writes all of those files out as static files.

The redirect endpoints for old URLs do not use prerender. Astro runs them every time that address is requested.

## Astro configuration

The main settings are in `astro.config.mjs`. I left out the font and integration sections:

```js {title=astro.config.mjs}
export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  build: { format: "file" },
  redirects: oldSiteRedirects,
  adapter: cloudflare({ configPath: "./.void-wrangler.jsonc" }),
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: { prefixDefaultLocale: false },
  },
  // ...
  markdown: {
    processor: satteri(satteriOptions),
    syntaxHighlight: false,
  },
  vite: { plugins: [voidPlugin()] },
});
```

`defaultLocale` is `id`, so Indonesian URLs have no prefix. English uses the `/en` prefix. The `site` value comes from `VITE_APP_SITE` at build time. Its default is in `env.ts`.

## Void and Cloudflare Workers

The Void plugin connects to Vite through `voidPlugin()`. `void.config.ts` configures Cloudflare, including the Worker name, the compatibility date, and the `nodejs_als` flag. That flag enables AsyncLocalStorage. The Void docs require it for the `void/*` helpers. The code in `src/` does not use `void/db`, `void/kv`, or `void/storage`.

The Void docs also require Astro 7, because Void needs Vite 8. The deploy command, `pnpm void:deploy`, runs `void deploy --platform cloudflare`. Void generates `.void-wrangler.jsonc`, which Git ignores.

## Styling with UnoCSS

UnoCSS uses `presetWind4` with its built-in reset, so it needs no extra reset package. `uno.config.ts` turns the color tokens from `DESIGN.md` into `--lr-*` variables. Classes such as `text-lr-nav` use those variables. The `dark` class on the `html` element turns on dark mode.

UnoCSS also scans the Markdown in `src/`. Classes used inside posts are generated too.

## Posts as Markdown

Each post is a Markdown file in `src/content/posts/id/`. The English version, if there is one, uses the same slug in `src/content/posts/en/`. The schema is in `src/content.config.ts`. Four fields are required: `title`, `summary`, `date`, and `topic`. The `topic` value must exist in `src/shared/api/content/topics.ts`.

Astro processes Markdown through `@astrojs/markdown-satteri`, which supports directives. A `:::name` directive opens a block, such as a diagram or a checklist. A name that is not in the list in `src/app/markdown/directives.ts` throws an error while the Markdown is processed.

## Two languages and Markdown copies

Indonesian is the default language. The English version lives at `/en/writing/`. The URL builder for each language is in `src/shared/i18n/routes.ts`.

Each post also has a raw Markdown copy, for example `/en/writing/situs-ini-astro-void-cloudflare-workers.md`. The `/llms.txt` file lists all of these copies in the llmstxt.org format.

## Old heyris.me URLs

The site config redirects old heyris.me URLs to the new ones with status 301. Endpoints in `src/pages` redirect post URLs: `/posts/<slug>` goes to `/en/writing/<slug>`, and `/id/posts/<slug>` goes to `/tulisan/<slug>`. The `redirects` option in `astro.config.mjs` covers other page URLs, such as `/about`.

## Tests and Lighthouse budgets

Vitest runs through `vp test`, with three projects in `vite.config.ts`:

- `unit`: `*.test.ts` files, running in Node.
- `browser`: `*.browser.test.ts` files, running in headless Chromium.
- `types`: `*.test-d.ts` files, which only check types with tsc.

End-to-end tests use Playwright, in the `e2e/` folder. The accessibility scans use axe and cover only the WCAG 2.0, 2.1, and 2.2 tags at levels A and AA (`e2e/fixtures.ts`). The site target is WCAG 2.2 level AA.

The Unlighthouse job builds the site, starts `astro preview`, and checks the pages against the budgets in `unlighthouse.config.ts`. The budgets set a minimum score for each category. The CI job fails when a score falls below its minimum.

The minimum scores are:

- Performance: minimum score 90
- Accessibility: minimum score 100
- Best practices: minimum score 100
- SEO: minimum score 90

## CI and commit history

`.github/workflows` has four workflows: `check`, `test`, `playwright`, and `unlighthouse`. All four run on pushes and pull requests to `main`. The `unlighthouse` workflow can also run by hand through `workflow_dispatch`. When the `site` input is set, the job scans the deployed site instead of a local build.

The commit history starts on November 12, 2026. The commits below, from newest to oldest, mark the build stages:

:::commits
- 49fd2cc test: set up Vitest with unit, browser and type projects
- 77ec300 feat(i18n): add the english routes
- 5cb34c9 feat(markdown): render the design's content blocks from directives
- ed245d0 feat(ui): set up unocss with wind4, typography and design tokens
- c4ea45a ci: add check, playwright and unlighthouse workflows
- 35e91de feat(deploy): integrate void with cloudflare adapter
:::
