---
title: "Git for beginners: basic terms and commands"
summary: "Basic Git terms and the commands you need to start tracking code changes."
date: 2024-10-01
updated: 2026-11-14
topic: git
---

Git is a distributed version control system (DVCS). It helps developers track code changes while they build software.

The Linux developer community, especially Linus Torvalds, created Git in 2005 to manage development of the Linux kernel. Git was made because BitKeeper, the tool the kernel project had used since 2002, stopped being free of charge. Git is still widely used today.

## Why use Git

1. Git records changes over time. You can return to an older version if you need to.
2. Several developers can work on the same project at the same time. Git merges changes that do not overlap. If two changes touch the same line, Git marks them as a conflict.
3. Branches keep work separate. You can build a feature on its own branch, then merge it when it is ready.
4. Every developer has a full copy of the repository, including its history. You can still commit without a connection to the server.
5. Git is designed to be fast, including for large projects.

## Basic Git terms

- Repository or repo: a project folder that Git tracks, along with its full history of changes.
- Commit: a single point in Git's history. Each commit stores the state of the files at that moment and has a unique ID.
- Branch: a line of development.
- Merge: combining changes from one branch into another.
- Remote: a repository hosted somewhere else, for example on GitHub or GitLab.
- Clone: making a complete copy of a remote repository on your computer.
- Pull: fetching changes from a remote and bringing them into the active branch.
- Push: sending commits from a local branch to a remote.

## Installing Git

Check first whether Git is already on your computer:

```bash
git --version
```

If that command does not show a version number, install Git for your operating system:

- Windows: download the installer from the [Git for Windows download page](https://git-scm.com/install/windows), then run it.
- macOS: run `xcode-select --install` to install the Xcode Command Line Tools. Or run `brew install git` if you use Homebrew.
- Linux: on Debian and Ubuntu, run `sudo apt install git`. On Fedora, run `sudo dnf install git`. Other distributions have their own commands. See the [Git download page for Linux](https://git-scm.com/install/linux).

## Setting up Git

Before you use Git, set your name and email. Git stores both in every commit.

```bash
git config --global user.name "Your Name"
git config --global user.email "name@example.com"
```

Also set the initial branch name to `main`:

```bash
git config --global init.defaultBranch main
```

Without this setting, Git uses `master` as the initial branch name. Git 3.0 will use `main` by default, but no release date has been set.

## Basic Git commands

### Create a new repository

Go to your project folder, then run:

```bash
git init
```

Git creates a hidden folder named `.git`. That folder stores the full history of the project.

### Clone a repository from a remote

```bash
git clone https://github.com/account-name/repo-name.git
```

This command creates a new folder named `repo-name` that contains a copy of the repository.

### Check the status

```bash
git status
```

This command shows the active branch and the files that changed since the last commit.

### Stage and save changes

Run `git add` to put a file in the staging area, the list of changes that goes into the next commit. Then run `git commit` to save everything in the staging area as one commit:

```bash
git add README.md
git commit -m "Add README"
```

Replace `README.md` with the name of the file you changed. Write a commit message that explains the change.

### View the commit history

```bash
git log
git log --oneline
```

`git log` shows the full history. `git log --oneline` shows one line for each commit.

### Create and switch branches

Create a new branch, then switch to it:

```bash
git branch login-feature
git switch login-feature
```

Or create and switch in one step:

```bash
git switch -c login-feature
```

`git switch` is only for switching branches. `git checkout` still works. For example, `git checkout -b login-feature` creates and switches in one step.

### Merge branches

Switch to `main`, then merge the feature branch:

```bash
git switch main
git merge login-feature
```

If two branches change the same line in one file, Git stops and marks a conflict. Open the file and choose the correct content. Delete the conflict markers (`<<<<<<<`, `=======` and `>>>>>>>`). Then run `git add` and `git commit`.

### Connect to a remote

Replace the URL with your repository's address:

```bash
git remote add origin https://github.com/account-name/repo-name.git
```

Push the `main` branch to the remote for the first time. The `-u` option links the local branch with the remote branch:

```bash
git push -u origin main
```

If Git asks for a password when you push over HTTPS, use a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) instead of the password.

After that, `git push` is enough. If the remote has commits that are not on your computer yet, the push is rejected. Run `git pull` first, then try again. If `git pull` stops because the histories have diverged, see the next section.

### Get changes from a remote

```bash
git pull origin main
```

Pull fetches new commits from the remote and applies them to the active branch. If only the remote has new commits, Git moves your branch forward (a fast-forward).

If the local and remote histories have diverged, Git stops and asks you to choose how to combine them. For a single pull, use merge:

```bash
git pull --no-rebase origin main
```

To use merge for every pull, set it once:

```bash
git config --global pull.rebase false
```

To learn more, read the [Pro Git book](https://git-scm.com/book) on the official Git website.
