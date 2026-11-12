# Home Page Test Plan

## Application Overview

heyris is the personal site of @risqiromadhoni, built with Astro 7 and served by Void on Cloudflare Workers. The home page (`src/pages/index.astro`, prerendered) is still Astro's starter page: an English document titled "Astro" with one level-1 heading "Astro" inside the main landmark, viewport and description meta tags, and SVG and ICO favicons. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Home page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Shows the site title and heading

**File:** `e2e/home-page/shows-the-site-title-and-heading.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The document title is "Astro"
    - expect: Exactly one level-1 heading is visible and it reads "Astro"
    - expect: The heading is inside the main landmark

#### 1.2. Declares document metadata

**File:** `e2e/home-page/declares-document-metadata.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The html element has lang="en"
    - expect: A meta charset tag declares utf-8
    - expect: A viewport meta tag sets width=device-width
    - expect: A meta description summarises the site

#### 1.3. Serves both favicons

**File:** `e2e/home-page/serves-both-favicons.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: One icon link points to /favicon.svg with type image/svg+xml
    - expect: One icon link points to /favicon.ico
  2. Request /favicon.svg
    - expect: The response is 200 with an image/svg+xml content type
  3. Request /favicon.ico
    - expect: The response is 200

#### 1.4. Loads without console errors

**File:** `e2e/home-page/loads-without-console-errors.spec.ts`

**Steps:**
  1. Listen for console errors and uncaught page errors, then open the home page at /
    - expect: No console error is logged
    - expect: No uncaught page error is thrown

#### 1.5. Has no WCAG 2.2 AA violations

**File:** `e2e/home-page/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The heading "Astro" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
