# Note Page Test Plan

## Application Overview

A note is one short Indonesian entry at `/catatan/<slug>`, prerendered from `src/content/notes/id/<slug>.md`. The page (`src/_pages/note/ui/NotePage.astro`, through `BaseLayout`) has the same sticky top bar as a post, with a "Catatan" back link. Its header holds one `h1`, a byline with a reading time and the copy menu, and the note's tags as pills. Below the header are the TL;DR box (`aside` labelled "Singkatnya"), the article body, a feedback line, and the "Catatan lainnya" section with the previous and next notes by date. The document has `lang="id"`, a title of the form "<note title> · Risqi Romadhoni", and a `text/markdown` alternate link to `/catatan/<slug>.md`, which serves the note as Markdown with frontmatter that includes `tags` and `tldr`. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Note page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Loads with a heading, a TL;DR, its tags and the Indonesian language

**File:** `e2e/note-page/loads-with-title-tldr-and-tags.spec.ts`

**Steps:**
  1. Open the note at /catatan/google-places-session-token
    - expect: The html element has lang="id"
    - expect: The document title is "Token sesi Google Places: satu token untuk satu pencarian · Risqi Romadhoni"
    - expect: Exactly one level-1 heading inside the main landmark reads "Token sesi Google Places: satu token untuk satu pencarian"
  2. Check the TL;DR box and the tags
    - expect: A complementary landmark labelled "Singkatnya" contains the TL;DR text "Pakai satu token untuk satu pencarian"
    - expect: One tag pill, "Google Places", is listed in the header
  3. Check the feedback line and the related notes
    - expect: The "Kabari saya" link is a mailto link to risqi.romadhoni96@gmail.com
    - expect: A heading "Catatan lainnya" is visible

#### 1.2. Links its Markdown alternate and serves it as text/markdown

**File:** `e2e/note-page/links-and-serves-its-markdown.spec.ts`

**Steps:**
  1. Open the note at /catatan/google-places-session-token
    - expect: A link rel="alternate" with type="text/markdown" points to /catatan/google-places-session-token.md
  2. Request /catatan/google-places-session-token.md
    - expect: The response is 200 with a Content-Type of "text/markdown; charset=utf-8"
    - expect: The frontmatter has the title, the date 2026-11-14 and a tldr field

#### 1.3. Has no WCAG 2.2 AA violations with the copy menu closed and open

**File:** `e2e/note-page/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open the note at /catatan/google-places-session-token
    - expect: The level-1 heading is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the copy menu closed
    - expect: The scan reports no violations
  3. Open the copy menu with its caret button and scan again
    - expect: The "Lihat sebagai Markdown" link is visible
    - expect: The scan reports no violations

#### 1.4. Has no WCAG 2.2 AA violations in dark mode

**File:** `e2e/note-page/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the note at /catatan/google-places-session-token
    - expect: The html element has the dark class
    - expect: The level-1 heading is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
