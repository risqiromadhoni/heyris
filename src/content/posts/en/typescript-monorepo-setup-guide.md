---
title: "TypeScript library in a monorepo with pnpm and Turborepo"
summary: "How to set up a monorepo with pnpm and Turborepo, then build a TypeScript library that other packages use."
date: 2024-12-01
updated: 2026-11-14
topic: monorepo
---

A monorepo keeps several packages in one repository. The libraries and apps inside it can use each other without being published to npm first. For background, read [Monorepo: what it is and how to set one up with pnpm](/en/writing/what-is-monorepo).

A monorepo makes it easier to share code and manage dependencies in one place. This guide uses pnpm as the package manager and Turborepo to run tasks in each package. pnpm supports workspaces natively and stores each package file once in a single store, then links it into each project.

The steps in this guide were tested on macOS arm64 with Node.js 26.13.0, pnpm 12.18.0, TypeScript 7.0.2, tsdown 0.23.7 and Turborepo 2.11.11.

## Setting up the monorepo root

The root folder holds the shared configuration and all the packages. Create the root folder and its `package.json` file with these commands:

```bash
mkdir ts-monorepo && cd ts-monorepo
pnpm init
```

Add these two fields to `package.json`. The other fields from `pnpm init` stay in place.

```json {title=package.json}
{
  "private": true,
  "scripts": {
    "build": "turbo run build"
  }
}
```

The `private` field makes npm refuse to publish the root. Turborepo 2 reads the package manager from the root `package.json`. In pnpm 12, `pnpm init` already writes it.

Create `pnpm-workspace.yaml` in the root folder. pnpm reads the list of packages from this file:

```yaml {title=pnpm-workspace.yaml}
packages:
  - "packages/*"
```

pnpm also reads the `workspaces` field in `package.json`. Since pnpm 12.7, pnpm creates `pnpm-workspace.yaml` from that field and prints a warning. Writing this file yourself keeps the warning from appearing.

Install Turborepo:

```bash
pnpm add -D turbo
```

## Configuring tasks with Turborepo

Create `turbo.json` in the root folder. The [turbo.json reference](https://turborepo.dev/docs/reference/configuration) explains each key.

```json {title=turbo.json}
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

Turborepo 2 uses the `tasks` key and rejects the `pipeline` key. `"dependsOn": ["^build"]` makes each dependency finish its build first. `outputs` lists the files saved to the cache. If this list is empty, Turborepo does not save any files.

To learn how Turborepo runs tasks and stores their results, read [Turborepo in a monorepo: its role and how to use it](/en/writing/turborepo-in-our-monorepo).

## Creating the TypeScript library

Create the library package in the `packages/` folder. The folder name becomes the package name:

```bash
mkdir -p packages/my-library && cd packages/my-library
pnpm init
pnpm add -D typescript tsdown @types/node
```

This guide uses [tsdown](https://tsdown.dev/) to bundle the library. The [tsup page on npm](https://www.npmjs.com/package/tsup) says that project is no longer actively maintained and recommends tsdown instead.

Create `tsconfig.json`:

```json {title=packages/my-library/tsconfig.json}
{
  "compilerOptions": {
    "outDir": "dist",
    "module": "ESNext",
    "target": "ES6",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

This configuration does not need to change for tsdown. In TypeScript 7, a `module` set to ESNext defaults `moduleResolution` to `bundler`.

Create `src/index.ts`:

```ts {title=packages/my-library/src/index.ts}
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## Building the library

`pnpm init` writes `"main": "index.js"` to `package.json`. That file does not exist in this library. The build writes its output to `dist/`, so `package.json` must point there. Change the library's `package.json` to the version below. Keep the `devDependencies` that pnpm added.

```json {title=packages/my-library/package.json}
{
  "name": "my-library",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "types": "./dist/index.d.cts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "scripts": {
    "build": "tsdown src/index.ts --format esm,cjs --dts"
  }
}
```

The `exports` field sets which files are read for `import` (ESM) and `require` (CJS). The `main` and `types` fields stay for tools that do not read `exports` yet.

Go back to the root and run the build:

```bash
cd ../..
pnpm build
```

Turbo runs the library build, then tsdown writes four files to `dist/`:

```text
dist/
├── index.cjs
├── index.d.cts
├── index.d.mts
└── index.mjs
```

The `--format esm,cjs` flag produces ESM and CJS formats. The `--dts` flag produces type declaration files.

## Using the library from another package

Create the `app` package, then link `my-library` from the workspace:

```bash
mkdir -p packages/app && cd packages/app
pnpm init
cd ../..
pnpm --filter app add my-library --workspace
```

The `--workspace` flag makes pnpm take `my-library` from the workspace. pnpm then saves it as `workspace:*`. Do not skip this flag. Without it, `pnpm add my-library --filter app` installs an npm package that happens to share the name, not the package in the workspace.

Create `packages/app/src/index.ts`:

```ts {title=packages/app/src/index.ts}
import { greet } from "my-library";

console.log(greet("World"));
```

Run these commands from the root:

```bash
pnpm build
node packages/app/src/index.ts
```

The program prints `Hello, World!`. Node.js 22.18 or later can run `.ts` files directly. Node only strips type annotations and does not check types.

Before you publish the library to npm, run `pnpm dlx publint` in the package folder. [publint](https://publint.dev/) checks the contents of `package.json`. In this example, publint finds no errors. publint only suggests adding `engines.node`.
