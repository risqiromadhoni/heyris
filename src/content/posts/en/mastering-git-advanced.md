---
title: "Advanced Git for a more efficient workflow"
summary: "Advanced Git commands for rebase, reset, and bisect, including how to set up Husky 9 and Commitlint."
date: 2024-10-01
updated: 2026-11-14
topic: git
---

Once you know the basics of Git, you will often need more advanced commands. This article summarizes the commands people often use to tidy up history and recover from mistakes. It also covers Git hooks and how to keep large repositories fast.

## Rebase and merge

Merge combines two branches. If both branches have commits the other one doesn't, Git creates one merge commit. If only the other branch has new commits, Git just moves the branch pointer forward (a fast-forward). If the other branch has no new commits, the merge changes nothing.

Rebase moves your commits onto a new base. Git rewrites those commits, so each one gets a new hash.

Switch to the feature branch, then rebase onto main:

```sh
git switch feature-branch
git rebase main
```

If you hit a conflict, fix the affected files, mark them with `git add`, then continue:

```sh
git add <file-name>
git rebase --continue
```

To cancel a rebase, run `git rebase --abort`. The branch returns to its state before the rebase started.

Do not rebase commits that other people already use. Colleagues who have built on the old commits need to merge their work again.

After a rebase, push the feature branch with `--force-with-lease`:

```sh
git push --force-with-lease origin feature-branch
```

This command rejects the push if the branch on the remote has changed since you last fetched it.

## Interactive rebase

Interactive rebase cleans up your last few commits before you share them.

```sh
git rebase -i HEAD~5
```

Git opens an editor with a list of commits. Replace `pick` in front of each commit you want to change:

- `reword` (or `r`): change the commit message without changing its contents.
- `edit` (or `e`): stop at that commit. Change the files, run `git commit --amend`, then `git rebase --continue`.
- `squash` (or `s`): combine the commit into the previous one in the list. Git builds a combined message, then opens an editor.
- `fixup` (or `f`): same as `squash`, but this commit's message is discarded.
- `drop` (or `d`): remove the commit.

Reordering lines in the list also reorders the commits in your history.

## Cherry-pick

Cherry-pick copies one commit to another branch. Use it when you need a single change, not the whole branch.

```sh
git switch main
git cherry-pick <hash-commit>
```

Git refuses to cherry-pick when local changes would be overwritten by the commit. Changes already in the staging area block it too, even in files the commit does not touch. Commit or stash your changes first.

## Stash

Stash saves uncommitted changes. It helps when you need to switch branches for a bit.

```sh
git stash
git stash list
git stash apply
git stash pop
```

- `git stash` saves your changes and resets the working tree to the last commit.
- `git stash list` shows every stash entry.
- `git stash apply` applies the latest stash and keeps it in the list.
- `git stash pop` applies the latest stash, then removes it from the list. If a conflict happens, the stash entry stays.

Stash does not include new files that Git does not track yet. Add `-u` to include them:

```sh
git stash push -u
```

## Undoing changes

### Reset

`git reset --soft HEAD~1` undoes the last commit. Its changes stay in the staging area, so you can commit again right away.

```sh
git reset --soft HEAD~1
```

`git reset --hard HEAD~1` undoes the last commit and overwrites every file in the working tree and the staging area with the version from the commit before it. Uncommitted changes are not recorded in the reflog, so this reset discards them. Git can also overwrite untracked files.

```sh
git reset --hard HEAD~1
```

Commit or stash uncommitted work before you run this command.

### Reflog

Git records every move of HEAD and of branches in the reflog. You can still get back commits that a reset discarded:

```sh
git reflog
git branch backup <hash-from-reflog>
```

Git removes reflog entries older than 30 days whose commits can no longer be reached from the tip of their branch. Other entries are removed after 90 days. Removal happens when `git gc` runs.

### Revert

`git revert` creates a new commit that undoes an older one. The old history stays intact, so this works well for commits that are already shared.

```sh
git revert <hash-commit>
```

## Tags

Tags mark a specific point, such as a version release. Use annotated tags (`-a`) for releases. An annotated tag stores the tagger's name, the date, and a message.

```sh
git tag -a v1.0 -m "Version 1.0 release"
git push origin v1.0
```

List all tags with `git tag`. Delete a local tag and a remote tag with two commands:

```sh
git tag -d v1.0
git push --delete origin v1.0
```

## Bisect to find the commit that broke something

`git bisect` finds the first commit that introduced a bug, using a binary search. You mark one broken commit and one commit that still works.

```sh
git bisect start
git bisect bad
git bisect good <correct-commit-hash>
```

Git checks out a commit in the middle. Test the code there, then mark the result with `git bisect good` or `git bisect bad`. Repeat until Git points to a single commit.

To test automatically, run a script with `git bisect run`. The script must exit with code 0 for a good commit. Exit codes 1 to 127, except 125, mean the commit is bad. Exit code 125 skips the commit. Any exit code above 127 aborts the bisect.

```sh
git bisect run npm test
```

With pnpm, use `git bisect run pnpm test`.

When you finish, run `git bisect reset` to return to where you started.

## Hooks with Husky and Commitlint

A hook is a script that Git runs when certain events happen, such as before a commit. Hooks in `.git/hooks` exist only on your machine, so your teammates do not get them automatically.

Here is a simple hook that runs lint before each commit:

```sh {title=.git/hooks/pre-commit}
#!/bin/sh
npm run lint || { echo "Lint failed, commit aborted."; exit 1; }
```

Make it executable with `chmod +x .git/hooks/pre-commit`. Git ignores hooks that are not executable.

With pnpm, replace `npm run lint` on the second line with `pnpm run lint`.

Husky keeps hooks in a `.husky` folder inside the repository, so you can share them through commits. For a Node.js project, install Husky, then run its init command:

```sh
npm install --save-dev husky
npx husky init
```

With pnpm, use `pnpm add --save-dev husky`, then `pnpm exec husky init`.

`husky init` creates `.husky/pre-commit` with `npm test` in it, or `pnpm test` if you use pnpm. It also adds a `prepare` script set to `husky` in `package.json`. That script sets up Husky again every time `npm install` or `pnpm install` runs.

Husky 9 runs the contents of a hook file as ordinary shell commands. Write the commands directly, without a shebang and without `chmod +x`. This example replaces `npm test` with `npm run lint`:

```sh
echo "npm run lint" > .husky/pre-commit
```

With pnpm, use `echo "pnpm run lint" > .husky/pre-commit`.

Commitlint checks that commit messages follow the Conventional Commits format. Install the packages:

```sh
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

With pnpm, use `pnpm add --save-dev @commitlint/cli @commitlint/config-conventional`.

Commitlint 21 needs Node.js 22.12 or newer. Create a configuration file:

```js {title=commitlint.config.js}
export default {
  extends: ['@commitlint/config-conventional'],
};
```

Then add a `commit-msg` hook that checks the commit message:

```sh
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

Git passes the path of the commit message file as the first argument. The command above forwards it to Commitlint through `$1`. Commits whose messages do not match the format are rejected.

With pnpm, use `echo 'pnpm exec commitlint --edit $1' > .husky/commit-msg`.

## Large repositories

Repositories with a large history and lots of content often feel slow to clone and check out.

A partial clone downloads file contents only when they are needed. This command needs a server that supports Git filters:

```sh
git clone --filter=blob:none <repository-url>
```

Sparse-checkout shows only the folders you choose in the working tree:

```sh
git sparse-checkout set <folder-name>
```

The `git maintenance start` command runs maintenance tasks in the background:

```sh
git maintenance start
```

By default, `prefetch` and `commit-graph` run hourly. `loose-objects` and `incremental-repack` run daily, and `pack-refs` runs weekly.

Git LFS stores the contents of large binary files, such as PSD files, separately from regular Git objects. Install it once per user account, then mark the file patterns you want to store with LFS:

```sh
git lfs install
git lfs track "*.psd"
```

Commit the `.gitattributes` file that `git lfs track` creates. Files that already exist in your history do not change. To change them, use `git lfs migrate`. That command rewrites history, so run it with care.

## Cleaning up a repository with git gc

`git gc` removes objects that are no longer used and reorganizes the repository's storage.

```sh
git gc
```

If background maintenance already runs through `git maintenance start`, do not run `git gc` at the same time. Use `git maintenance run --task=gc` instead. `git gc` does not take the object database lock the same way `git maintenance run` does.

Avoid `--prune=now` unless you are sure no other Git process is writing to the repository. This option deletes objects without the usual two-week grace period, which increases the risk of corruption.
