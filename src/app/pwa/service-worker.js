// Offline fallback only. Every request goes to the network; when a page navigation fails, the
// worker answers with the offline page of the URL's locale. Nothing else is cached except the
// hashed `/_astro/` files the offline pages need. `src/pages/sw.js.ts` replaces the version below
// with one per build, so each deploy installs a fresh copy of the offline pages.
const VERSION = "dev";
const CACHE = `offline-${VERSION}`;
const OFFLINE_PAGES = { id: "/offline", en: "/en/offline" };
const ASSET_URL = /["'(](\/_astro\/[^"'()\s]+)/g;

/** The hashed asset paths a cached text response refers to. */
async function assetsIn(cache, path) {
  const response = await cache.match(path);
  const text = response ? await response.text() : "";

  return [...text.matchAll(ASSET_URL)].map((match) => match[1]);
}

/**
 * Caches the hashed assets that the cached files at `paths` refer to, and returns their paths.
 * A failed download leaves the offline page without that asset instead of failing the install.
 */
async function cacheLinked(cache, paths) {
  const assets = [
    ...new Set((await Promise.all(paths.map((path) => assetsIn(cache, path)))).flat()),
  ];

  await Promise.allSettled(assets.map((asset) => cache.add(asset)));

  return assets;
}

async function install() {
  const cache = await caches.open(CACHE);
  const pages = Object.values(OFFLINE_PAGES);

  await cache.addAll(pages);

  const linked = await cacheLinked(cache, pages);

  // Stylesheets refer to fonts, one level further down.
  await cacheLinked(
    cache,
    linked.filter((asset) => asset.endsWith(".css")),
  );
}

async function activate() {
  const names = await caches.keys();

  await Promise.all(
    names
      .filter((name) => name.startsWith("offline-") && name !== CACHE)
      .map((name) => caches.delete(name)),
  );
  await self.registration.navigationPreload?.enable();
  await self.clients.claim();
}

function offlinePageFor(url) {
  const english = url.pathname === "/en" || url.pathname.startsWith("/en/");

  return english ? OFFLINE_PAGES.en : OFFLINE_PAGES.id;
}

async function navigate(event) {
  try {
    return (await event.preloadResponse) ?? (await fetch(event.request));
  } catch {
    const page = await caches.match(offlinePageFor(new URL(event.request.url)));

    return page ?? Response.error();
  }
}

async function cachedAsset(request) {
  return (await caches.match(request)) ?? fetch(request);
}

self.addEventListener("install", (event) => {
  event.waitUntil(install().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activate());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(navigate(event));

    return;
  }

  const url = new URL(request.url);

  // `/_astro/` file names carry a content hash, so a cached copy is never out of date.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_astro/")) {
    event.respondWith(cachedAsset(request));
  }
});
