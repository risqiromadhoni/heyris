# Notes Index Test Plan

## Application Overview

The notes index (`/catatan`) lists the published notes of the Indonesian locale. Pinned notes sit in a "Disematkan" group, and the rest are grouped by month. `src/pages/catatan/index.astro` renders `NotesIndexPage` through `BaseLayout`, with the site top bar and footer in their slots. The page is an Indonesian document (`lang="id"`) titled "Catatan · Risqi Romadhoni", with one level-1 heading "Catatan" inside the main landmark.

Topic pills (Semua plus five featured topics, each with its count) and a search field filter the rows in the browser. Each pill is a button with `aria-pressed`. The topic is kept in the `topik` query parameter and the search text in `q`. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Notes index

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Loads with the right heading, title and language

**File:** `e2e/notes-index/loads-with-the-right-heading-title-and-lang.spec.ts`

**Steps:**
  1. Open the notes index at /catatan
    - expect: The document title is "Catatan · Risqi Romadhoni"
    - expect: The html element has lang="id"
    - expect: Exactly one level-1 heading, "Catatan", is inside the main landmark

#### 1.2. Has no WCAG 2.2 AA violations

**File:** `e2e/notes-index/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open the notes index at /catatan
    - expect: The level-1 heading "Catatan" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.3. Filters by topic and keeps it in the URL

**File:** `e2e/notes-index/filters-by-topic-and-keeps-it-in-the-url.spec.ts`

**Steps:**
  1. Open the notes index at /catatan
    - expect: The "Semua" pill is pressed
  2. Press the "Cloudflare" pill
    - expect: The URL has the query parameter topik=cloudflare
    - expect: The "Cloudflare" pill is pressed
    - expect: Only the notes on the Cloudflare topic are visible, pinned ones included

#### 1.4. Has no WCAG 2.2 AA violations in dark mode, with and without a topic filter

**File:** `e2e/notes-index/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the notes index at /catatan
    - expect: The html element has the dark class
    - expect: The level-1 heading "Catatan" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with no filter applied
    - expect: The scan reports no violations
  3. Press the "Cloudflare" pill and scan again
    - expect: The URL has topik=cloudflare
    - expect: The scan reports no violations

#### 1.5. Has no WCAG 2.2 AA violations in English and dark mode

**File:** `e2e/notes-index/has-no-wcag-2-2-aa-violations-in-english-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the English notes index at /en/notes
    - expect: The html element has the dark class
    - expect: The level-1 heading "Notes" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
