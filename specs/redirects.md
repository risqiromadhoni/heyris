# Old Site Redirects Test Plan

## Application Overview

The previous heyris.me served English at the root and Indonesian under `/id`. `astro.config.mjs` lists permanent redirects (`oldSiteRedirects`) so those URLs keep working: posts to `/en/writing/<slug>` and `/tulisan/<slug>`, the posts indexes, `/about`, `/projects`, `/resources` and `/tags` to the closest page. In server mode Astro answers a GET with a 301 and a `Location` header. Tag pages, `/experiences` and URLs with a trailing slash (`/posts/`) stay 404: the site uses `trailingSlash: "never"`, and Astro's `redirects` cannot match a trailing slash.

## Test Scenarios

### 1. Old URLs

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Redirects each old URL with a 301

**File:** `e2e/redirects/redirects-the-old-site-urls-permanently.spec.ts`

**Steps:**
  1. Request an old URL such as /posts/how-internet-work without following redirects
    - expect: The response status is 301
    - expect: The Location path is the new URL, for example /en/writing/how-internet-work
