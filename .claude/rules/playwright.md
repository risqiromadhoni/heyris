# Playwright

`@playwright/test` (1.65) is the one Playwright dependency. It provides the e2e runner, both MCP servers in `.mcp.json` and the Test Agents in `.claude/agents/`, so upgrading it upgrades all three.

## MCP servers

Both run through `pnpm exec`, so they use the lockfile's Playwright. The docs' `npx @playwright/mcp@latest` does not work here: npm refuses to run in this repo because `package.json` `devEngines` requires pnpm, and `@latest` pulls an alpha Playwright.

- `playwright` (`playwright mcp --headless --isolated --caps=testing`): a general browser. Use it to check a page you changed, or the deployed site after `pnpm void:deploy`. `--isolated` keeps the profile in memory, so no cookies carry over and two sessions never fight over one profile lock. `--caps=testing` adds `browser_generate_locator` and `browser_verify_*`. It drives the installed Google Chrome; drop `--headless` to watch it.
- `playwright-test` (`playwright run-test-mcp-server --headless`): the test runner over MCP, used by the Test Agents. It runs tests through `playwright.config.ts`, which starts the dev server itself.
- Neither is for the user's own logged-in browser (that is Claude in Chrome) or for reading documentation.

How they behave:

- Every action returns an accessibility snapshot whose elements carry refs (`e5`). Pass the ref as `target`. Refs die when the page changes, so snapshot again after navigating. On a large page, `browser_find` returns only the matching subtree.
- Browser tools on `playwright-test` require an `intent` string describing the step; the generator turns it into the test's step comment.
- `playwright` writes snapshots (`.yml`) and screenshots to `.playwright-mcp/` (gitignored) and links the file in its result. Prefer snapshots; take a screenshot only to judge layout or colour.
- For local pages, start the dev server with `pnpm astro dev --background`; `pnpm astro dev status` prints its URL (http://localhost:4321 by default).

## Test Agents

`.claude/agents/playwright-test-{planner,generator,healer}.md` come from `playwright init-agents --loop=claude`. They call `mcp__playwright-test__*` tools, so the server name must stay `playwright-test`.

- Planner: runs the seed (`e2e/seed.spec.ts`), explores, and saves a plan with `planner_save_plan` to `specs/<name>.md`.
- Generator: writes one test per plan scenario to the scenario's `**File:**` path.
- Healer: runs the suite, debugs failures and patches tests. It marks a test `test.fixme()` when it believes the app, not the test, is wrong.

Conventions:

- Tests live in `e2e/` (the config's `testDir`), not `tests/` as the Playwright docs show, one test per file under `e2e/<suite>/`. Plan `**File:**` paths must point there.
- Tests import `test` and `expect` from `e2e/fixtures.ts`, not `@playwright/test`, to get `makeAxeBuilder`. The seed does the same, so generated tests follow it.
- A generated test starts with `// spec:` and `// seed:` lines and keeps one comment per plan step. They tie the test to its plan and are the accepted exception to the minimal-comment rule, in `e2e/` only.
- `vp fmt` skips `specs/**`: oxfmt flattens the plan's 4-space `- expect:` lines into the step text, and the generator reads that structure. Change a plan by saving it again through `planner_save_plan`, or by hand keeping that indentation.
- After upgrading Playwright, regenerate the agents with `pnpm exec playwright init-agents --loop=claude`. It replaces `.mcp.json` with only its own `npx` entry, so restore the file from git and keep the `pnpm exec` commands, then review the regenerated agent files.

## Accessibility

The target is WCAG 2.2 Level AA. `makeAxeBuilder()` returns an `AxeBuilder` limited to the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a` and `wcag22aa`. In axe-core 4.14, `target-size` is the only `wcag22aa` rule and no rule is tagged `wcag22a` yet.

- Scan every page and every state worth testing (menu open, dialog shown): wait for that state, then `expect((await makeAxeBuilder().analyze()).violations).toEqual([])`.
- Fix violations. Never pass a scan with `exclude()` or `disableRules()`; if a fix has to wait, tell the user.
- The WCAG tags leave out axe's best-practice rules, such as `landmark-one-main` and `region`. Lighthouse's accessibility score counts them and the Unlighthouse budget is 100, so a page must pass both.
- Automated scans cover only part of WCAG. They do not replace manual checks with a keyboard and a screen reader.

## Running

- `pnpm test:e2e` runs chromium, firefox and webkit. Add `--project=chromium` for one browser. `pnpm test:e2e:report` serves the last HTML report.
- The config starts `astro dev --ignore-lock` itself, or reuses a server already listening on port 4321 outside CI. `--ignore-lock` matters: when Astro 7 detects an agent it backgrounds `astro dev` and `astro preview`, so the parent exits at once, Playwright reports `Process from config.webServer exited early`, and an orphan keeps the port. Stop an orphan with `pnpm astro dev stop`.
- Keep `gracefulShutdown: SIGTERM` on the `webServer`. Playwright's default SIGKILL skips Void's cleanup, which leaves its generated `src/middleware.ts` and that file's `.gitignore` line behind (see the Void gotcha in `CLAUDE.md`).
- Firefox 159, the build Playwright 1.65 ships, does not start on macOS 27 (`Could not find profile folder`, even outside Playwright). On such a Mac run `--project=chromium --project=webkit`; CI on Ubuntu runs all three. Never heal a test for that error.
- CI runs the suite in `.github/workflows/playwright.yml` and uploads `playwright-report/`.
