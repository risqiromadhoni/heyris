---
title: "Turborepo in a monorepo: its role and how to use it"
summary: "How to set up a monorepo with pnpm, then use Turborepo to run tasks and store their results."
date: 2024-10-06
topic: monorepo
---

A monorepo is a single repository that holds the code for many projects at once. Turborepo runs tasks in a monorepo like that, then stores their results in a cache.

## Setting up a pnpm workspace

The examples below use a pnpm workspace with three packages: `project-a`, `project-b`, and `shared-utils`. The `project-a` package uses `shared-utils`.

Create the root folder, then run `pnpm init` inside it:

```bash
mkdir my-monorepo && cd my-monorepo
pnpm init
```

Next, create a `pnpm-workspace.yaml` file in the root. Its `packages` key lists the package folder patterns:

```yaml {title=pnpm-workspace.yaml}
packages:
  - 'packages/*'
```

After that, create three package folders, then run `pnpm init` in each folder:

```bash
mkdir -p packages/project-a packages/project-b packages/shared-utils
cd packages/project-a && pnpm init
cd ../project-b && pnpm init
cd ../shared-utils && pnpm init
cd ../..
```

Because `pnpm-workspace.yaml` already exists, `pnpm init` in each package writes no pnpm version. Only the root `package.json` gets a pnpm version.

In `packages/project-a/package.json`, add `shared-utils` as a dependency with the `workspace:` protocol:

```json {title=package.json}
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

Run `pnpm install` from the root. It links `shared-utils` to `project-a`. The `name` field in `packages/shared-utils/package.json` must be `shared-utils`. Otherwise, pnpm can't find that package.

## Running tasks with Turborepo

Turborepo runs tasks such as build and test across many packages, in the order set by the dependencies between packages. The examples below use Turborepo 2.11 or later.

### Installing Turborepo

Install Turborepo in the root. The `pnpm-workspace.yaml` file must already exist. Without it, the command fails.

```bash
pnpm add turbo --save-dev --workspace-root
```

Turborepo reads the package manager from the root `package.json`. When `pnpm init` runs in the root, pnpm usually writes `devEngines.packageManager` and the `packageManager` field to that file. Check both. If `devEngines.packageManager` is missing, for example because the project was created with `--no-init-package-manager`, add it by hand. It looks like this:

```json {title=package.json}
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": "12.18.0"
    }
  }
}
```

If you add it by hand, set `version` to the output of `pnpm -v`. The 12.18.0 in the example only shows the format.

### Defining tasks in turbo.json

Tasks are defined in `turbo.json` in the root folder. The key is `tasks`. Turborepo 1.x called it `pipeline`.

```json {title=turbo.json}
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

The `dependsOn` key lists the tasks that must finish before a task runs. The `^` prefix refers to the package's dependencies, so `^build` means the build in the dependency packages runs first. With this config, the `shared-utils` build runs before the `project-a` build. Without `^`, the task waits for other tasks in the same package. In this example, `test` runs only after `build` finishes.

The `outputs` key lists the result files that can be stored in the cache. Without `outputs`, Turborepo stores no result files at all. Tasks that keep running, such as `dev`, get `persistent: true` and `cache: false`.

To migrate from 1.x, run the official codemod:

```bash
pnpm dlx @turbo/codemod migrate
```

### The turbo run and turbo watch commands

Run tasks with `turbo run`:

```bash
pnpm exec turbo run build
```

To run one package, use `--filter` with the package name. The three dots after the name select that package together with its dependencies:

```bash
pnpm exec turbo run build --filter=project-a...
```

To let Turborepo set the task order, set the `build` script in the root `package.json` to `turbo run build`.

`turbo watch` reruns tasks when a file changes. The dependency order still applies:

```bash
pnpm exec turbo watch test
```

`turbo watch` doesn't restart `persistent` tasks, such as `dev`, when a file changes. Those tasks keep running the same way they do with `turbo run`, so `turbo watch dev test` runs both at the same time.

If the tool in that task doesn't reload modules from its dependencies, set `interruptible: true` in `turbo.json`. With that setting, `turbo watch` restarts the task when a file changes.

### Local and remote cache

Task results are stored in `.turbo/cache`. When a task's inputs are the same, Turborepo takes the result from the cache and doesn't run the task again.

Turborepo also stores logs and other data in the `.turbo` folder, so add that folder to the root `.gitignore`:

```text {title=.gitignore}
.turbo
```

Remote Caching shares that cache with other machines, such as laptops and CI servers. The feature is free. You can use Vercel's managed cache even if your app isn't hosted on Vercel. You can also use your own server. To connect the repository to Vercel:

```bash
pnpm exec turbo login
pnpm exec turbo link
```

For your own server, run `pnpm exec turbo login --manual`, then enter the API URL, team name, and token.

### Partial monorepo with prune

To create a partial monorepo, for example for a Docker build, use `turbo prune`:

```bash
pnpm exec turbo prune project-a --docker
```

This command creates an `out` folder with `project-a`, the packages it needs, and a pruned lockfile. The `--docker` flag arranges the output to match how Docker caches layers.

### Running tasks for changed packages

The `--affected` flag runs tasks in the packages that changed compared with `main`, along with the packages that depend on them:

```bash
pnpm exec turbo run build test --affected
```

For `--affected` to have enough Git history in GitHub Actions, set `filter: blob:none` and `fetch-depth: 0` on `actions/checkout`.

First published on October 6, 2024. Updated on November 14, 2026.
