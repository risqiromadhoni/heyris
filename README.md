# heyris

[![Latest release](https://img.shields.io/github/v/release/risqiromadhoni/heyris?sort=semver)](https://github.com/risqiromadhoni/heyris/releases/latest)
[![Commits since latest release](https://img.shields.io/github/commits-since/risqiromadhoni/heyris/latest?sort=semver)](https://github.com/risqiromadhoni/heyris/commits/main)
[![Last commit](https://img.shields.io/github/last-commit/risqiromadhoni/heyris/main)](https://github.com/risqiromadhoni/heyris/commits/main)
[![Check](https://github.com/risqiromadhoni/heyris/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/risqiromadhoni/heyris/actions/workflows/check.yml)
[![Test](https://github.com/risqiromadhoni/heyris/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/risqiromadhoni/heyris/actions/workflows/test.yml)
[![Playwright](https://github.com/risqiromadhoni/heyris/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/risqiromadhoni/heyris/actions/workflows/playwright.yml)
[![Release](https://github.com/risqiromadhoni/heyris/actions/workflows/release.yml/badge.svg)](https://github.com/risqiromadhoni/heyris/actions/workflows/release.yml)
[![Code licence: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)

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
