---
title: "Dependabot bumped vite-plus but not the vite alias beside it"
summary: "Dependabot bumped one line in pnpm-workspace.yaml, so CI failed with 69 type errors."
date: 2026-11-16
topic: ci
icon: code
label: "The vite alias and vite-plus"
tags: ["Dependabot", "pnpm"]
tldr: "Dependabot bumped vite-plus, but the vite alias on the line beside it stayed at 1.5.1. I set both to the same version, and every check passed."
---

Dependabot opened PR #1 on 16 November 2026 at 10.29 WIB. The PR bumped `vite-plus` from 1.5.1 to 1.6.0. The `vite` alias on the line beside it did not change.

As a result, CI failed with 69 type errors. I fixed it in the second commit of the PR. After that, every check passed, and the PR was merged at 12.52 WIB.

## Two lines for one tool

`pnpm-workspace.yaml` holds the pnpm catalog. The [pnpm catalogs documentation](https://pnpm.io/catalogs) says that a package version is written once in this file, and many `package.json` files use it. In this repo, two lines in the catalog set up Vite+:

```yaml {title=pnpm-workspace.yaml}
catalog:
  vite: npm:@voidzero-dev/vite-plus-core@1.5.1
  vite-plus: 1.6.0
```

That is the catalog at Dependabot's original commit, [31c5bf4](https://github.com/risqiromadhoni/heyris/commit/31c5bf4). The PR was later rebased onto a newer `main`, and that commit became [08211cc](https://github.com/risqiromadhoni/heyris/commit/08211cc). The catalog is the same in both. The `vite` line is an alias to the `@voidzero-dev/vite-plus-core` package. Dependabot changed only the `vite-plus` line.

The `vite-plus` group in `.github/dependabot.yml` matches the name `vite`. I do not know why the alias stayed unchanged. I have not tested whether Dependabot can update it.

## What failed in CI

At commit `31c5bf4`, the "Format, lint, types and unused code" job failed with 69 `TS2339` errors. Each error said `Property 'element' does not exist on type 'ExpectStatic'`. The "Unit, browser and type tests" job also failed.

The lockfile at that commit held two versions of `vite-plus-core`, 1.5.1 and 1.6.0. The `@vitest/browser-playwright` package was bound to 1.5.1, while `vite-plus` in the catalog was already 1.6.0.

## The fix

I set the `vite` alias to 1.6.0 in commit [b1330178](https://github.com/risqiromadhoni/heyris/commit/b1330178). At that commit, every PR check passed.

:::diagram
- Dependabot: bumped vite-plus to 1.6.0
- CI: 69 type errors
- Fix: the vite alias moved to 1.6.0
- CI: every check passed
:::

## New rule in CLAUDE.md

I added one sentence to `CLAUDE.md`. It notes that a vite-plus PR bumps only the `vite-plus` entry. The rule is to change the `vite` alias by hand, then run `pnpm install`.

Source: [PR #1 on GitHub](https://github.com/risqiromadhoni/heyris/pull/1) and the squash commit [8bb81fd](https://github.com/risqiromadhoni/heyris/commit/8bb81fd). The versions above were current when I wrote this note.
