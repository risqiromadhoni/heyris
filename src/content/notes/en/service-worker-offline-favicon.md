---
title: "An offline-only service worker and a theme-aware favicon"
summary: "The service worker on this site caches only the offline page, and the SVG favicon changes color with the theme."
date: 2026-11-16
topic: web
icon: lightbulb
label: "Offline service worker"
tags: ["Service worker", "PWA", "Favicon"]
tldr: "The service worker caches only the offline page and the files it uses. Each build gets a new version, and the SVG favicon follows the user's color theme."
---

The service worker on this site is deliberately small. It caches only the offline page and the `/_astro/` files that page uses. Every other request goes to the network, so visitors do not get stuck on an old copy.

## Which requests the worker handles

The worker handles only two kinds of request. [The Service Worker API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) explains how a worker can intercept network requests.

| Request | What the worker does |
| --- | --- |
| Page navigation | Try the network first. If it fails, send the offline page in the page's language. |
| `/_astro/*` | Use the cache first. The file names carry a hash, so a cached copy never goes stale. |
| Anything else | Not intercepted. The request goes straight to the network. |

The worker also turns on [navigation preload, as described on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager). It starts the page request in parallel with the worker's startup. The font files that the offline page's stylesheet refers to are cached too.

## Every build gets a new version

Each build gets its own `VERSION` value. The value becomes part of the cache name, so every build uses a different cache. During the build, `src/pages/sw.js.ts` replaces the line `const VERSION = "dev";` with that value:

```ts {title=src/pages/sw.js.ts}
  // Prerendering runs once per build, so the version changes with every build.
  const version = Date.now().toString(36);

  return new Response(source.replace(PLACEHOLDER, `const VERSION = "${version}";`), {
```

When `sw.js` changes, the browser updates the cache in this order:

:::diagram
- Build: VERSION set to a new value
- Browser: sw.js changes, the new worker is installed and fills the new cache
- Activation: the old cache is deleted, and the new worker becomes active at once
:::

On the deployed site, this command prints the value:

```sh
curl -s https://<site-address>/sw.js | grep "const VERSION"
```

When I checked on 16 November 2026, the output was `const VERSION = "mwivxeh9";`. The value changes with every build.

## A favicon that follows the theme

The file `public/favicon.svg` contains a `prefers-color-scheme` rule. Its strokes are `#282828` in light mode and `#F4F1EB` in dark mode. The [prefers-color-scheme media query on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) detects whether the user chose a light or a dark color theme.

PNG and ICO files cannot hold that rule, so their color does not change. `favicon.ico` and the other PNG icons therefore use the dark `#282828` mark on a white background.

## Source and tests

This feature landed in [commit c1b66b2](https://github.com/risqiromadhoni/heyris/commit/c1b66b2) on 16 November 2026 at 11.47 WIB. The worker is registered only in production builds. See `src/app/layouts/BaseLayout.astro`. The Playwright tests for the two offline pages are in `e2e/offline-page/`.
