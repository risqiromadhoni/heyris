---
title: "Monorepo: what it is and how to set it up with pnpm"
summary: "What a monorepo is, how to set one up with pnpm workspaces, and the GitHub features that help manage it."
date: 2024-10-05
updated: 2026-11-14
topic: monorepo
---

A monorepo stores the code of many projects in one repository. The other approach, called multi-repo, gives each project its own repository. The [pnpm workspace documentation](https://pnpm.io/workspaces) also calls monorepos "monolithic repositories."

## Benefits of monorepos

Google's 2016 article on keeping all of its code in one repository documents some of these benefits: [Why Google stores billions of lines of code in a single repository](https://cacm.acm.org/research/why-google-stores-billions-of-lines-of-code-in-a-single-repository/).

1. Code sharing: projects can use each other's code directly. The code does not need to be copied to another repository.
2. Large-scale refactoring: changes that touch many projects are easier to make.
3. Simpler dependencies. The Google article names this benefit for its internal code. In pnpm, a `catalog` in `pnpm-workspace.yaml` stores a dependency's version range as a reusable constant. Packages use it through `catalog:`, which makes it easier to keep one version of each dependency across the workspace.
4. Collaboration: teams can read each other's code and find APIs they can reuse.
5. Atomic commits: one commit can hold changes across several projects.

## Challenges of monorepos

1. Repository size: the repository can grow over time. GitHub recommends that the `.git` folder be no larger than 10 GB, because large repositories slow down fetches and lengthen clone times.
2. Build complexity: build tools have to handle many projects at once. Google lists investment in tooling as one of three categories of monorepo cost.
3. One change can break other packages: packages that depend on a package with `workspace:` use its latest code right away.
4. Access control: GitHub permissions apply to each repository. CODEOWNERS decides who is asked to review changes in a folder. If part of the code must be restricted, consider a separate repository.
5. Git performance: Git operations can slow down at large scale. Git has sparse checkout to load only certain folders, and partial clone for very large repositories.

## Setting up a monorepo with pnpm

pnpm has built-in workspace support for monorepos. The steps below are written for pnpm 12. The result is three packages: `project-a`, `project-b`, and `shared-utils`.

### Create the root folder

```sh
mkdir my-monorepo
cd my-monorepo
pnpm init
```

`pnpm init` creates `package.json`. The command also fills in the `packageManager` field with the pnpm version.

### Create pnpm-workspace.yaml

Create a `pnpm-workspace.yaml` file in the root folder. The `packages` key holds the patterns for the package folders.

```yaml {title=pnpm-workspace.yaml}
packages:
  - 'packages/*'
```

This pattern matches each folder one level below `packages/`.

### Create the folders and packages

```sh
mkdir -p packages/project-a packages/project-b packages/shared-utils
cd packages/project-a
pnpm init
cd ../project-b
pnpm init
cd ../shared-utils
pnpm init
```

The package name follows the folder name. The `shared-utils` folder produces a package named `shared-utils`.

### Link local packages

Declare dependencies on local packages with the `workspace:` protocol. By default, pnpm fetches a package from the registry when this protocol is not used.

Add this to `packages/project-a/package.json`:

```json
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

Then run `pnpm install` from the root folder. The command links `shared-utils` to `project-a` and creates `pnpm-lock.yaml` in the root.

`workspace:*` accepts only local packages. When a package is published, pnpm replaces that value with a version number.

### Add scripts at the root

Replace the contents of `scripts` in the root `package.json` with this:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test"
  }
}
```

The `pnpm -r` command runs a script in every package and skips the root folder. It also skips packages that do not have that script.

The `build` and `test` scripts run in dependency order. So `shared-utils` finishes building before `project-a`.

The `dev` script uses `--parallel`. Without this flag, pnpm waits for a dependency's `dev` script to finish before it starts the packages that use it. If that dev script runs a server, it never finishes, so the packages that depend on it never start.

The default `test` script from `pnpm init` always fails with `Error: no test specified`. Replace it with a real test in packages that already have tests, or delete it from packages that do not. If the placeholder stays, `pnpm test` stops with an error. If no package has a `test` script, `pnpm test` finishes without an error but runs no tests.

### Other tools

pnpm handles package linking and running scripts. The [`tasks` setting](https://pnpm.io/workspace-task-orchestration) determines the order of scripts when one runs across many packages at once.

pnpm 12.4 adds the [`pnpm pipeline`](https://pnpm.io/cli/pipeline) command. It runs tasks only for projects that changed compared with `origin/main`. Projects that depend on them also run. For tasks that declare `outputs`, it uses cached results when they are available. The command needs a `pipelines` list in `pnpm-workspace.yaml`. The feature is still experimental, so its configuration and output may change. A plain `pnpm -r run` never uses this cache.

[Turborepo](https://turborepo.dev/) and [Nx](https://nx.dev/) also cache task results. Nx has `nx affected`, which runs only the tasks that a change affects.

## Example folder structure

This structure uses pnpm. Only folders that match a pattern in `pnpm-workspace.yaml` become packages. So `tools/` and `docs/` are not pnpm packages.

```text
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── README.md
├── packages/
│   ├── project-a/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.js
│   │   └── tests/
│   │       └── index.test.js
│   ├── project-b/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.js
│   │   └── tests/
│   │       └── index.test.js
│   └── shared-utils/
│       ├── package.json
│       └── src/
│           └── utils.js
├── tools/
│   └── build-scripts/
│       └── build.js
└── docs/
    ├── project-a/
    │   └── README.md
    └── project-b/
        └── README.md
```

- `packages/` holds all projects and packages.
- `project-a` and `project-b` are separate example projects in the monorepo.
- `shared-utils` is a package that other projects use.
- `tools/` holds build scripts and other utilities used across the monorepo.
- `docs/` holds documentation for each project.

## Managing a monorepo with GitHub

GitHub has several features for managing monorepos.

### GitHub Actions workflows

You can limit a GitHub Actions workflow with the `paths` filter under `on.push`. With this filter, the workflow runs only when files in certain folders change. The [GitHub Actions documentation on path filters](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore) describes the patterns you can use.

### Branch protection rules

Branch protection rules control what can be merged into the main branch. You can require status checks to pass, or a review, before a merge. GitHub also offers rulesets as another way to manage branches.

### The CODEOWNERS file

The `CODEOWNERS` file sets who is asked to review changes in a folder. Put it in `.github/CODEOWNERS`. The following line makes the team `@org/tim-a` the owner of the `project-a` folder:

```text
/packages/project-a/ @org/tim-a
```

The owning team must be visible (a team setting on GitHub) and have write access to the repository, even when each of its members already has write access. When a pull request that is not a draft changes files in that folder, GitHub asks the owners to review it automatically. Approval from owners is required only if the branch rule enables "Require review from Code Owners".

### GitHub Projects

GitHub Projects helps you track work across packages in one table or board.

## Good practices

1. Use Conventional Commits, for example `feat(ui): add copy button`. This format makes it easier to generate changelogs and set versions automatically.
2. Set up a linter and a formatter, such as ESLint and Prettier, so the code style stays consistent.
3. Automate as much as possible with GitHub Actions, for example for testing, builds, and deployment.
4. Write a clear README for each project and for the monorepo root.
5. Record release changes with `pnpm change`. This command creates a Markdown file in the `.changeset/` folder. Then run `pnpm version -r` to bump the versions and write the changelogs. This workflow is built into pnpm. See the [pnpm versioning documentation](https://pnpm.io/versioning) for details.

   The files use the Changesets format. If you prefer the Changesets CLI, install `@changesets/cli` in the root with `pnpm add -Dw @changesets/cli`, then run `pnpm changeset init`. After that, `pnpm changeset` creates a changeset, and `pnpm changeset version` updates the versions and changelogs. The [pnpm guide to Changesets](https://pnpm.io/using-changesets) has the details.

## When to use a monorepo

In my view, a monorepo is most useful for projects that depend on each other. For standalone projects, multi-repo can be simpler.

[Google's 2018 case study](https://dl.acm.org/doi/10.1145/3183519.3183550) also lists the strengths of multi-repo: freedom to choose tools, and benefits for access control and stability.
