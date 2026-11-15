# Post Page Test Plan

## Application Overview

A post is one Indonesian article at `/tulisan/<slug>`, prerendered from `src/content/posts/id/<slug>.md`. The page (`src/_pages/post/ui/PostPage.astro`, through `BaseLayout`) has a sticky top bar with a "Tulisan" back link and a reading-progress bar, then one `h1` in the main landmark, a byline with the "Salin Halaman" copy menu, the article body with its Markdown blocks (figures, windows, diagrams, commit lists, checklists, carousels and code blocks), and a feedback line that opens a correction email. The document has `lang="id"`, a title of the form "<post title> · Risqi Romadhoni", and a `text/markdown` alternate link to `/tulisan/<slug>.md`, which serves the entry as Markdown with YAML frontmatter. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Post page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Loads with a heading, a title and the Indonesian language

**File:** `e2e/post-page/loads-with-title-heading-and-language.spec.ts`

**Steps:**
  1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: The html element has lang="id"
    - expect: The document title is "Astro dan Void di Cloudflare Workers: cara situs ini dibangun · Risqi Romadhoni"
    - expect: Exactly one level-1 heading inside the main landmark reads "Astro dan Void di Cloudflare Workers: cara situs ini dibangun"
  2. Check the feedback line
    - expect: The "Kabari saya" link is a mailto link to risqi.romadhoni96@gmail.com with the subject "Koreksi: Astro dan Void di Cloudflare Workers: cara situs ini dibangun", URL-encoded

#### 1.2. Links its Markdown alternate and serves it as text/markdown

**File:** `e2e/post-page/links-and-serves-its-markdown.spec.ts`

**Steps:**
  1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: A link rel="alternate" with type="text/markdown" points to /tulisan/situs-ini-astro-void-cloudflare-workers.md
  2. Request /tulisan/situs-ini-astro-void-cloudflare-workers.md
    - expect: The response is 200 with a Content-Type of "text/markdown; charset=utf-8"
    - expect: The body starts with frontmatter whose title is "Astro dan Void di Cloudflare Workers: cara situs ini dibangun"

#### 1.3. Has no WCAG 2.2 AA violations with the copy menu closed and open

**File:** `e2e/post-page/has-no-wcag-2-2-aa-violations.spec.ts`

**Steps:**
  1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: The level-1 heading is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the copy menu closed
    - expect: The scan reports no violations
  3. Open the copy menu with its caret button and scan again
    - expect: The "Lihat sebagai Markdown" link is visible
    - expect: The scan reports no violations

#### 1.4. Copy menu opens, moves between items and closes on Escape with focus returned

**File:** `e2e/post-page/copy-menu-works-from-the-keyboard.spec.ts`

**Steps:**
  1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: The caret button "Opsi lain" is collapsed (aria-expanded="false")
  2. Focus the caret and press Enter
    - expect: The caret has aria-expanded="true" and the menu is visible
  3. Press ArrowDown twice
    - expect: Focus moves to "Lihat sebagai Markdown", then to "Buka di ChatGPT"
  4. Press Escape
    - expect: The menu closes
    - expect: Focus returns to the caret, which is collapsed again

#### 1.5. Has no WCAG 2.2 AA violations in dark mode, with the copy menu closed and open

**File:** `e2e/post-page/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    - expect: The html element has the dark class
    - expect: The level-1 heading is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the copy menu closed
    - expect: The scan reports no violations
  3. Open the copy menu with its caret button and scan again
    - expect: The "Lihat sebagai Markdown" link is visible
    - expect: The scan reports no violations

#### 1.6. Update history opens from the clock button, scans clean and closes on Escape

**File:** `e2e/post-page/shows-the-update-history.spec.ts`

**Steps:**
  1. Open the updated post at /tulisan/typescript-monorepo-setup-guide
    - expect: The body has no "Terbit pertama kali" line
    - expect: The "Riwayat pembaruan" button is collapsed (aria-expanded="false")
  2. Hover the "Riwayat pembaruan" button
    - expect: The button has aria-expanded="true"
    - expect: The panel lists "Diperbarui" on 14 November 2026 before "Terbit" on 1 Desember 2024
  3. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the panel open
    - expect: The scan reports no violations
  4. Focus the button and press Escape
    - expect: The panel closes and the button is collapsed again
  5. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers, which has no updates
    - expect: There is no "Riwayat pembaruan" button
