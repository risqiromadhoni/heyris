# Not Found Page Test Plan

## Application Overview

A request for a path that no page serves gets the not-found page (`src/pages/404.astro`, rendering `src/_pages/not-found`) through `BaseLayout`, with HTTP status 404. The page has the site top bar and footer, one level-1 heading in Indonesian ("Halaman tidak ditemukan"), its body text, links to the home page, Tulisan and Catatan, and a block with `lang="en"` that repeats the title and body in English. It carries `<meta name="robots" content="noindex">` and no canonical link or Open Graph image. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Not found page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Shows the heading with status 404

**File:** `e2e/not-found/shows-the-heading-with-status-404.spec.ts`

**Steps:**
  1. Request a path that does not exist at /does-not-exist
    - expect: The response status is 404
    - expect: A level-1 heading reads "Halaman tidak ditemukan"
    - expect: The English block, marked lang="en", has a level-2 heading "Page not found"
    - expect: A meta tag named robots has the content "noindex"

#### 1.2. Has no WCAG 2.2 AA violations

**File:** `e2e/not-found/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Request a path that does not exist at /does-not-exist
    - expect: The level-1 heading is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.3. Has no WCAG 2.2 AA violations in dark mode

**File:** `e2e/not-found/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then request /does-not-exist
    - expect: The html element has the dark class
    - expect: The level-1 heading "Halaman tidak ditemukan" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
