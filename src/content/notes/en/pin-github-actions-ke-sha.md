---
title: "Pin GitHub Actions to commit SHAs, with the version in a comment"
summary: "A tag can move to another commit, but a commit SHA cannot. This repo now pins every outside action to a full SHA."
date: 2026-11-16
topic: ci
icon: list-checks
label: "Pin Actions to SHAs"
tags: ["GitHub Actions", "Security"]
tldr: "A tag such as v1.22.0 can be moved to another commit, but a full commit SHA cannot. This repo now uses SHAs for 16 action calls, with the version in a comment."
---

Workflows usually call an action by tag, for example `actions/checkout@v7.0.1`. That tag can be moved to another commit. The [GitHub security guide for Actions](https://docs.github.com/en/actions/reference/security/secure-use) says that if an action's repository is compromised, someone could reassign or delete its tags. A full commit SHA identifies the exact contents of a commit, so those contents cannot change without the SHA changing.

That guide has a section on pinning to a full commit SHA. I followed it: each outside action in a `uses:` line now has the full SHA, and the version sits in a comment.

## What changed in PR #9 {#changes}

PR [#9](https://github.com/risqiromadhoni/heyris/pull/9) changed 7 files. It added 19 lines and removed 17. The merged commit, [809cb07](https://github.com/risqiromadhoni/heyris/commit/809cb07), is dated 16 November 2026, 14.05 WIB.

## Pins in each workflow {#pins}

There are now 16 calls to actions from outside the repo, each with a full SHA:

| Workflow file | `uses:` lines |
| --- | --- |
| `check.yml` | 2 |
| `test.yml` | 3 |
| `playwright.yml` | 3 |
| `unlighthouse.yml` | 3 |
| `size.yml` | 2 |
| `release.yml` | 3 |

`release.yml` also calls five local workflows with `./.github/workflows/`. A local call has no ref, so there is no SHA to add.

## How to pin one action {#pin-one}

:::checklist
- Find the release tag: open the Releases page of the action's repo, then note the tag in use, for example v7.0.1.
- Get the SHA: run `gh api repos/actions/checkout/commits/v7.0.1 --jq .sha` with the tag exactly as it appears in the workflow.
- Write the SHA and version: SHA first, version in the comment, like `uses: actions/checkout@<SHA> # v7.0.1`.
- Turn off persist-credentials: set `with:` on the checkout step to `persist-credentials: false`.
:::

This is an example from `.github/workflows/check.yml`:

```yaml {title=.github/workflows/check.yml}
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
```

According to the [actions/checkout README](https://github.com/actions/checkout), checkout saves the token by default. That lets later steps run git commands that need authentication. With `persist-credentials: false`, git does not store the token.

I set this option on every checkout step, in all six workflows. The deploy job in `release.yml` also holds the Cloudflare token, so I did not want another credential left in its workspace.

## What is not proven yet {#unverified}

I have not seen Dependabot update a SHA and its version comment together. This repo has never had a Dependabot PR for GitHub Actions. The first four Dependabot PRs, #1 to #4, were all for npm. The `.github/dependabot.yml` file already includes the github-actions ecosystem. The [Dependabot guide for actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot) covers updating actions, but it does not say how to handle a SHA pin with a comment. Until a PR proves it, check the SHA and comment each time an update lands.
