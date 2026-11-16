---
title: "Release 1.0.0: release-please, five checks, one approval"
summary: "How release 1.0.0 ran from release-please to the Cloudflare deploy, and three things I did not expect."
date: 2026-11-16
topic: ci
---

On 16 November 2026 at 13.24 WIB, [release PR #5](https://github.com/risqiromadhoni/heyris/pull/5) was merged into `main`. release-please created the `v1.0.0` tag and the [GitHub release](https://github.com/risqiromadhoni/heyris/releases/tag/v1.0.0) right away. The deploy to Cloudflare finished at 13.31 WIB.

Three things about this flow surprised me. First, the CI runs for the release PR waited for approval. Second, a called workflow uses its caller's name in `github.workflow`, so each group needs its own suffix. Third, the Check stayed red after the fix.

## The flow from commit to deploy

The `Release` workflow runs on every push to `main`.

:::diagram
- Push to main: release-please reads the commits
- Release PR: created with GITHUB_TOKEN
- Merge PR: tag v1.0.0 and the GitHub release
- Five checks: check, test, playwright, unlighthouse, size
- Approval: a reviewer in the production environment
- Deploy: vp run void\:deploy
:::

The five checks and the deploy run only when `release_created` is `true`. They can also run by hand through `workflow_dispatch`. The condition lives in `.github/workflows/release.yml`.

## Version one and the token

The `release-please` job uses `googleapis/release-please-action` at version 5.0.0, pinned to a commit SHA. I chose the built-in `GITHUB_TOKEN` over a personal access token.

The [release-please-action README](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs) says that tags and release PRs made with the built-in token do not trigger other workflows. The README suggests a PAT if CI must run on the release PR. I kept the built-in token, and the result is in the section "The release PR waits for approval" below.

This repo had no earlier version tag, so release-please needs to know the first version. I set it with a `Release-As: 1.0.0` footer in commit `27f3ac8`. The file `.release-please-manifest.json` holds one line: `{".":"1.0.0"}`.

## Five checks called from Release

The `v1.0.0` tag was created with `GITHUB_TOKEN`, so it triggers no other workflow. The checks cannot wait for a tag event. So `release.yml` calls the five workflows directly with `uses:`. Each one has a `workflow_call` trigger for this. The `deploy` job waits for all of them through `needs`:

```yaml {title=.github/workflows/release.yml}
  deploy:
    name: Deploy to Cloudflare
    needs: [release-please, check, test, e2e, lighthouse, size]
    if: ${{ needs.release-please.outputs.release_created == 'true' || github.event_name == 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment:
      name: production
      url: ${{ vars.VITE_APP_SITE }}
```

## Path filters and bundle size

Commit `28b03fb` (PR #8) limits four workflows on PRs. Test, Playwright, Unlighthouse, and Size run on a PR only when the files they use change. Check has no filter, so it runs on every push and PR.

Path filters apply only to `push` and `pull_request` events. When Release calls a workflow, the filter does not apply. So every deploy passes all five full checks. On the 1.0.0 release run, all five passed.

Size checks the budgets in `.size-limit.json`: 4.5 kB for the WebGL backdrop JS, 3 kB for other JS, and 14 kB for CSS, measured with Brotli.

## One concurrency group for each workflow

Each workflow that can be called has its own concurrency group. This is the group in `check.yml`, lines 13 to 15:

```yaml {title=.github/workflows/check.yml}
concurrency:
  group: ${{ github.workflow }}-check-${{ github.ref }}
  cancel-in-progress: true
```

The workflow name in that group is there for a reason. GitHub's [reusing workflow configurations docs](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations) say that a called workflow uses its caller's name in `github.workflow`. They also warn against using the same `concurrency.group` in the caller and the called workflow when `cancel-in-progress` is `true`, because the workflow that is already running can be cancelled. All seven jobs of the 1.0.0 release run reported the workflow name `Release` in the Actions jobs API. With that name on every job, the five groups would be identical without a suffix. The `-check-`, `-test-`, and other suffixes keep them apart.

I did not see any job cancelled because of this. I kept the workflow name in the group.

## Approval before deploy

The `deploy` job uses the `production` environment. That environment has required reviewers, and only the `main` branch may deploy to it. The job waits until a reviewer approves it. The [deployment environments docs](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) say that one required reviewer is enough.

I approved this run. The deploy started at 13.30 WIB and succeeded at 13.31 WIB.

## The release PR waits for approval {#pr-menunggu}

PR #5 was opened by github-actions[bot] at 11.48 WIB. The first five `pull_request` runs for that PR, Check, Test, Playwright, Unlighthouse, and Size, were created at 11.48 WIB with the status `action_required`.

The [GITHUB_TOKEN docs](https://docs.github.com/en/actions/concepts/security/github_token) say that events from `GITHUB_TOKEN` create no new workflow runs. The exception is `pull_request` events that are opened, synchronized, or reopened. Their runs wait in an approval-required state. Someone with write access starts them by choosing "Approve workflows to run". The same page says that a pull request created or updated with a GitHub App token or a PAT does not need that approval.

I kept `GITHUB_TOKEN` instead of a PAT, so a person has to approve those runs before CI runs on the release PR.

## The check that stayed red

The Check on PR #5 failed because `vp check` rejected `.release-please-manifest.json`. The log said "Formatting issues found" for that file. release-please writes the manifest as one line of JSON, and the formatter flagged that format.

Commit `7416554` (PR #7) added that file to `fmt.ignorePatterns` in `vite.config.ts`, line 63. PR #7 was merged at 13.03 WIB, and PR #8 at 13.09 WIB.

The Check on PR #5 failed again at 13.15 WIB, on the same head commit, `6641f78`. The checkout step in that run fetched `refs/remotes/pull/5/merge`, which was commit `676b083`, titled `Merge 6641f78 into c03b772`. Commit `c03b772` was the `main` commit at 12.44 WIB (PR #6). So that merge was made before PR #7 and PR #8 reached `main`, and `vite.config.ts` in that tree did not yet ignore the manifest. The log still named the same manifest file.

In this case, Check passed at 13.20 WIB after I closed and reopened PR #5. GitHub made a new merge ref from `main` after PR #8. The other four workflows showed `skipped`.

## Timeline on 16 November 2026

| Time (WIB) | Event |
| --- | --- |
| 11.48 | release-please opens PR #5 |
| 13.03 | PR #7 merged to main |
| 13.09 | PR #8 merged to main |
| 13.15 | Check on PR #5 fails again |
| 13.20 | Check green after PR #5 is reopened |
| 13.24 | PR #5 merged, tag v1.0.0 and release created |
| 13.24 to 13.30 | Five checks pass |
| 13.30 to 13.31 | Deploy runs after approval, then succeeds |

## Commits that shape this flow

Commits below, from the earliest:

:::commits
- 27f3ac8 ci(release): deploy to Cloudflare from release-please releases
- 5408d8d ci(size): enforce JS and CSS size budgets with size-limit
- 4af10e3 ci(release): gate deploy on every CI workflow
- 7416554 chore(fmt): leave release-please's manifest unformatted (#7)
- 28b03fb ci: run heavy workflows only when their inputs change (#8)
- 4bff11e chore(main): release 1.0.0 (#5)
:::

## What I have not checked

Two things I have not checked:

- Live site: a successful deploy does not show that the page visitors see runs build 1.0.0.
- `VITE_APP_SITE`: I have not checked whether that repo variable is set. If it is empty, the deploy step unsets it, and the site uses the default value.
