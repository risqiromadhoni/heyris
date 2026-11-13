# Search and Share Test Plan

## Application Overview

Crawlers and link previews read three things. `/robots.txt` (`src/pages/robots.txt.ts`) allows every crawler and names the sitemap at `<VITE_APP_SITE>/sitemap-index.xml`. `<VITE_APP_SITE>` is the site URL the build shell sets, `https://heyris.risqi-romadhoni96.workers.dev` by default (`env.ts`). Each page with a canonical link also declares an Open Graph image, an absolute URL under `/og/` that mirrors the page path and ends in `.png`. The image is a prerendered 1200 × 630 PNG rendered at build time (`src/pages/og/[...path].png.ts`), and its `og:image:width`, `og:image:height` and `og:image:type` tags state that. This plan covers the home page and the published post "Astro dan Void di Cloudflare Workers: cara situs ini dibangun".

## Test Scenarios

### 1. Robots file

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Lists the sitemap in robots.txt

**File:** `e2e/seo/robots-lists-the-sitemap.spec.ts`

**Steps:**
  1. Request /robots.txt
    - expect: The response status is 200
    - expect: The body allows every crawler with "User-agent: *" and "Allow: /"
    - expect: The body contains "Sitemap: <VITE_APP_SITE>/sitemap-index.xml"

### 2. Open Graph images

**Seed:** `e2e/seed.spec.ts`

#### 2.1. Serves the home page's Open Graph image as a 1200 by 630 PNG

**File:** `e2e/seo/home-og-image-is-a-png.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The meta tag og:image:width is "1200", og:image:height is "630" and og:image:type is "image/png"
    - expect: The meta tag og:image points to <VITE_APP_SITE>/og/index.png
  2. Request the image path /og/index.png
    - expect: The response status is 200 with a Content-Type of "image/png"
    - expect: The body starts with the PNG signature and its IHDR chunk gives a width of 1200 and a height of 630

#### 2.2. Serves the published post's Open Graph image as a 1200 by 630 PNG

**File:** `e2e/seo/post-og-image-is-a-png.spec.ts`

**Steps:**
  1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: The meta tag og:image points to <VITE_APP_SITE>/og/tulisan/situs-ini-astro-void-cloudflare-workers.png
  2. Request the image path /og/tulisan/situs-ini-astro-void-cloudflare-workers.png
    - expect: The response status is 200 with a Content-Type of "image/png"
    - expect: The body starts with the PNG signature and its IHDR chunk gives a width of 1200 and a height of 630
