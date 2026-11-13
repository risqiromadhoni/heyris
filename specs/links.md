# Links Test Plan

## Application Overview

Every internal link on the site should resolve. The crawl starts from the Indonesian home (`/`) and the English home (`/en`). It reads each HTML page's `a[href]` and `link[href]` targets and its element ids, then follows internal links breadth-first, visiting each URL once. Links to other origins and `mailto:` links are skipped.

Each internal target must answer with status 200. Paths with a file extension (`.md`, `.xml`, `.txt`, images) are checked for status only, and are not scanned for ids. Each `#fragment` must name an element id on the page it points to. The crawl runs against the dev server, so drafts are included, and it stays under about 60 seconds.

## Test Scenarios

### 1. Links

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Resolves every internal link and #fragment reachable from / and /en

**File:** `e2e/links/every-internal-link-and-fragment-resolves.spec.ts`

**Steps:**
  1. Open the home page at / to learn the site origin
    - expect: The page loads
  2. Crawl breadth-first from / and /en, visiting each URL once
    - expect: Each internal HTML URL returns status 200
    - expect: Each internal file URL (.md, .xml, .txt) returns status 200
  3. Check each #fragment against the element ids of the page it points to
    - expect: Every fragment names an existing element id
    - expect: The crawl followed links beyond the two start pages
