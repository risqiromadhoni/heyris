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
    - expect: The "Kabari saya" link is a mailto link to risqi@heyris.me with the subject "Koreksi: Astro dan Void di Cloudflare Workers: cara situs ini dibangun", URL-encoded

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
  5. Open the post at /tulisan/rilis-1-0-0-github-actions, which has no updates
    - expect: There is no "Riwayat pembaruan" button

#### 1.7. Table of contents opens beside the text, follows the reading position and scans clean

**File:** `e2e/post-page/shows-a-table-of-contents.spec.ts`

**Steps:**
  1. Open the post at /tulisan/what-is-monorepo in a 1440 x 900 viewport
    - expect: The "Daftar isi" button is collapsed (aria-expanded="false")
  2. Click the "Daftar isi" button
    - expect: The button has aria-expanded="true"
    - expect: The "Daftar isi" navigation lists "Manfaat monorepo" first and "Kapan memakai monorepo" last
    - expect: The panel does not overlap the article text
  3. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the panel open
    - expect: The scan reports no violations
  4. Click the "Contoh struktur folder" link in the panel
    - expect: The URL hash is #contoh-struktur-folder
    - expect: The link has aria-current="location"
    - expect: The panel stays open
  5. Resize the viewport to 390 x 800 and press Escape with focus in the panel
    - expect: The panel closes and focus returns to the "Daftar isi" button
  6. Open the panel again
    - expect: The panel spans the full viewport height at the right edge
  7. Run an axe scan with the side sheet open
    - expect: The scan reports no violations

#### 1.8. A section URL opens the table of contents beside the text

**File:** `e2e/post-page/opens-the-table-of-contents-from-a-section-url.spec.ts`

**Steps:**
  1. Open /tulisan/what-is-monorepo#workflow-github-actions in a 1440 x 900 viewport
    - expect: The "Daftar isi" button has aria-expanded="true"
    - expect: The "Workflow GitHub Actions" link has aria-current="location"
  2. Open /tulisan/what-is-monorepo#workflow-github-actions in a 390 x 800 viewport
    - expect: The "Daftar isi" button stays collapsed, so the side sheet does not cover the section

#### 1.9. Checklist rows line up at every width

**File:** `e2e/post-page/aligns-checklist-rows.spec.ts`

**Steps:**
  1. Open /tulisan/how-transfer-domain-to-cloudflare at 1280 and 375 pixels wide
    - expect: Every `.md-checklist__label` in the first checklist has the same left edge
  2. Run an axe scan in light and dark mode
    - expect: The scan reports no violations

#### 1.10. A wide table scrolls inside a labelled frame

**File:** `e2e/post-page/frames-a-wide-table.spec.ts`

**Steps:**
  1. Open /tulisan/backdrop-webgl-renderer-software in a 375 x 812 viewport
    - expect: The page does not scroll sideways
    - expect: The table sits in a `.md-table` frame with role="region" and tabindex="0" whose content is wider than the frame
  2. Focus the frame and press ArrowRight
    - expect: The frame scrolls sideways
  3. Run an axe scan in light and dark mode
    - expect: The scan reports no violations
