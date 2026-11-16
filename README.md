# heyris

Source of [heyris.me](https://heyris.me), Risqi Romadhoni's personal site: writing and notes in Indonesian and English.

Built with [Astro](https://astro.build) and [UnoCSS](https://unocss.dev), deployed to Cloudflare Workers with [Void](https://void.cloud), and checked with [Vite+](https://viteplus.dev).

## Develop

Needs Node.js 22.23.4 or later (`engines` in `package.json`). pnpm downloads the version pinned in `devEngines` itself.

```sh
pnpm install
pnpm astro sync
pnpm astro dev
```

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `pnpm build`    | Production build into `dist/`                 |
| `pnpm check`    | Format, lint, types and unused code           |
| `pnpm test`     | Vitest: unit, browser and type tests          |
| `pnpm test:e2e` | Playwright end-to-end and accessibility tests |
| `pnpm size`     | JS and CSS size budgets, after a build        |

Conventions, layout and known pitfalls are in [`CLAUDE.md`](CLAUDE.md). Posts and notes live in `src/content/`.

## Release

Commits follow [Conventional Commits](https://www.conventionalcommits.org). release-please keeps a release PR open on `main`; merging it tags the release, runs every CI workflow, and deploys only if all of them pass.

## Licence

The code is MIT. Posts, notes and design files are all rights reserved. See [`LICENSE`](LICENSE) for which files are which.
