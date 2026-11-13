# Writing Index Test Plan

## Application Overview

The writing index (`/tulisan`) lists the published posts of the Indonesian locale, grouped by year. `src/pages/tulisan/index.astro` renders `WritingIndexPage` through `BaseLayout`, with the site top bar and footer in their slots. The page is an Indonesian document (`lang="id"`) titled "Tulisan · Risqi Romadhoni", with one level-1 heading "Tulisan" inside the main landmark.

Topic tabs (Semua plus six featured topics) and a search field filter the rows in the browser. Each tab is a button with `aria-pressed`. The topic is kept in the `topik` query parameter and the search text in `q`. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Writing index

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Loads with the right heading, title and language

**File:** `e2e/writing-index/loads-with-the-right-heading-title-and-lang.spec.ts`

**Steps:**
  1. Open the writing index at /tulisan
    - expect: The document title is "Tulisan · Risqi Romadhoni"
    - expect: The html element has lang="id"
    - expect: Exactly one level-1 heading, "Tulisan", is inside the main landmark

#### 1.2. Has no WCAG 2.2 AA violations

**File:** `e2e/writing-index/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open the writing index at /tulisan
    - expect: The level-1 heading "Tulisan" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.3. Filters by topic and keeps it in the URL

**File:** `e2e/writing-index/filters-by-topic-and-keeps-it-in-the-url.spec.ts`

**Steps:**
  1. Open the writing index at /tulisan
    - expect: The "Semua" tab is pressed
  2. Press the "Cloudflare" tab
    - expect: The URL has the query parameter topik=cloudflare
    - expect: The "Cloudflare" tab is pressed and "Semua" is not
    - expect: Only the post "Situs pribadi di Cloudflare Workers dengan vinext" is visible

#### 1.4. Has no WCAG 2.2 AA violations in dark mode

**File:** `e2e/writing-index/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the writing index at /tulisan
    - expect: The html element has the dark class
    - expect: The level-1 heading "Tulisan" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.5. Has no WCAG 2.2 AA violations in English and dark mode

**File:** `e2e/writing-index/has-no-wcag-2-2-aa-violations-in-english-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the English writing index at /en/writing
    - expect: The html element has the dark class
    - expect: The level-1 heading "Writing" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
