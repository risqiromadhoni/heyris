---
title: "Loading WebAssembly in Workers with a module import"
summary: "Workers does not allow WebAssembly to be compiled from bytes, so the file is imported as a module."
date: 2026-11-14
topic: cloudflare
icon: sparkle
label: "WebAssembly on Workers"
tags: ["Cloudflare Workers", "WebAssembly"]
tldr: "Workers does not allow compiling WebAssembly from bytes. With the Cloudflare toolchain, a .wasm import gives a WebAssembly.Module, and this site uses the ?module suffix."
---

This site builds its Open Graph cards with `@resvg/resvg-wasm`, a WebAssembly library that converts SVG to PNG. On Workers, the library cannot be loaded from bytes. The approach that works is to import its `.wasm` file as a module.

## Why it cannot be compiled from bytes

The [Cloudflare documentation](https://developers.cloudflare.com/workers/runtime-apis/web-standards/#javascript-standards) says Workers does not allow `WebAssembly.compile` and `WebAssembly.instantiate` when they take bytes, for security reasons. The streaming versions, `WebAssembly.compileStreaming` and `WebAssembly.instantiateStreaming`, are not allowed either.

## Importing as a module

The [Cloudflare WebAssembly documentation](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/#bundling) says the Cloudflare toolchain bundles `.wasm` and `.wasm?module` files into the Worker so they are available at runtime. The import gives a `WebAssembly.Module`, as the [Cloudflare adapter documentation for Astro](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#cloudflare-module-imports) describes. The code that builds the cards on this site uses the `?module` suffix:

```ts {title=src/shared/lib/og-image/render.ts}
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import rasteriserModule from "@resvg/resvg-wasm/index_bg.wasm?module";
```

With a module, `initWasm` calls `WebAssembly.instantiate` with that module, not with bytes. If it receives a URL or a Response, it uses `instantiateStreaming`, or `instantiate` with bytes. Workers does not allow either path. A second call to `initWasm` throws an error, so the code stores the promise in `rasteriserReady` and reuses it.

## When the cards are made

The OG card route, `src/pages/og/[...path].png.ts`, sets `prerender = true`. So the cards are made at build time, not when a request arrives. The build output for this site shows this. The `og` folder is in the `client` output folder, while the `server` folder has no `.wasm` file and no `resvg` code.

The Cloudflare adapter for Astro runs prerender in `workerd` by default. The [`prerenderEnvironment`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#prerenderenvironment) option sets this. The docs say the goal is to match the production environment as closely as possible. `astro.config.mjs` on this site does not change that option.
