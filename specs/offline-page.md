# Offline Page Test Plan

## Application Overview

The service worker (`src/app/pwa/service-worker.js`, served at `/sw.js`) answers a page navigation that fails for lack of network with an offline page. There is one per locale: `/offline` in Indonesian and `/en/offline` in English (`src/pages/offline.astro` and `src/pages/en/offline.astro`, rendering `src/_pages/offline`). Each goes through `BaseLayout` with the site top bar and footer, one level-1 heading, its body text and a "try again" link whose empty href reloads the URL the service worker answered. Both carry `<meta name="robots" content="noindex">` and are left out of the sitemap. The service worker registers only in production builds, so these tests open the pages directly. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Offline page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Shows the Indonesian offline page

**File:** `e2e/offline-page/shows-the-indonesian-offline-page.spec.ts`

**Steps:**
  1. Open the Indonesian offline page at /offline
    - expect: The html element has lang="id"
    - expect: A level-1 heading reads "Anda sedang offline"
    - expect: A link named "Coba lagi" has an empty href
    - expect: A meta tag named robots has the content "noindex"

#### 1.2. Shows the English offline page

**File:** `e2e/offline-page/shows-the-english-offline-page.spec.ts`

**Steps:**
  1. Open the English offline page at /en/offline
    - expect: The html element has lang="en"
    - expect: A level-1 heading reads "You're offline"
    - expect: A link named "Try again" has an empty href
    - expect: A meta tag named robots has the content "noindex"

#### 1.3. Has no WCAG 2.2 AA violations

**File:** `e2e/offline-page/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open /offline
    - expect: The level-1 heading "Anda sedang offline" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
  3. Open /en/offline
    - expect: The level-1 heading "You're offline" is visible
  4. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.4. Has no WCAG 2.2 AA violations in dark mode

**File:** `e2e/offline-page/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open /offline
    - expect: The html element has the dark class
    - expect: The level-1 heading "Anda sedang offline" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
