# Home Page Test Plan

## Application Overview

heyris is the personal site of @risqiromadhoni, built with Astro 7 and served by Void on Cloudflare Workers. The home page (`src/pages/index.astro`, prerendered) renders `HomePage` through `BaseLayout`: an Indonesian document (`lang="id"`) titled "Risqi Romadhoni" with one level-1 heading inside the main landmark, whose accessible name is "@risqiromadhoni" (its greeting spans are hidden from assistive technology), viewport and description meta tags (the Indonesian home description), and SVG and ICO favicons. The accessibility target is WCAG 2.2 Level AA.

## Test Scenarios

### 1. Home page

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Shows the site title and heading

**File:** `e2e/home-page/shows-the-site-title-and-heading.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The document title is "Risqi Romadhoni"
    - expect: Exactly one level-1 heading is visible and its accessible name is "@risqiromadhoni"
    - expect: The heading is inside the main landmark

#### 1.2. Declares document metadata

**File:** `e2e/home-page/declares-document-metadata.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The html element has lang="id"
    - expect: A meta charset tag declares utf-8
    - expect: A viewport meta tag sets width=device-width
    - expect: A meta description starts with "Situs pribadi @risqiromadhoni"

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
    - expect: The heading "@risqiromadhoni" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations

#### 1.6. Toggles the dark class on the html element when the theme button is clicked

**File:** `e2e/home-page/toggles-the-dark-class-on-click.spec.ts`

**Steps:**
  1. Open the home page at / in light mode
    - expect: The html element does not have the dark class
  2. Click the theme toggle "Beralih ke mode gelap"
    - expect: The html element has the dark class
  3. Click the theme toggle "Beralih ke mode terang"
    - expect: The html element does not have the dark class

#### 1.7. Saves the chosen theme in localStorage under the theme key

**File:** `e2e/home-page/saves-the-theme-in-local-storage.spec.ts`

**Steps:**
  1. Open the home page at /
  2. Click the theme toggle to switch to dark mode
    - expect: localStorage.theme is "dark"
  3. Click the theme toggle again to switch back to light mode
    - expect: localStorage.theme is "light"

#### 1.8. Flips the theme button's accessible name between dark and light mode

**File:** `e2e/home-page/flips-the-accessible-name-with-the-theme.spec.ts`

**Steps:**
  1. Open the home page at / in light mode
    - expect: The theme button's accessible name is "Beralih ke mode gelap"
  2. Click the theme button
    - expect: The theme button's accessible name is "Beralih ke mode terang"

#### 1.9. Keeps the chosen theme across reloads, with the class set before the document is parsed

**File:** `e2e/home-page/keeps-the-theme-across-reloads-without-a-flash.spec.ts`

**Steps:**
  1. Open the home page at / and switch to dark mode
  2. Reload the page, with a script that records the html class at DOMContentLoaded
    - expect: The html element has the dark class after the reload
    - expect: The class recorded at DOMContentLoaded already includes dark
    - expect: The theme button's accessible name is "Beralih ke mode terang"

#### 1.10. Sets data-moved on the theme toggle only after the first click

**File:** `e2e/home-page/marks-the-theme-toggle-as-moved-after-the-first-click.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The theme toggle has no data-moved attribute
  2. Click the theme toggle
    - expect: The theme toggle has data-moved

#### 1.11. Runs no animation on the sun or the moon when the theme toggles with reduced motion

**File:** `e2e/home-page/runs-no-sky-animation-with-reduced-motion.spec.ts`

**Steps:**
  1. Open the home page at / with prefers-reduced-motion set to reduce
    - expect: The page loads
  2. Click the theme toggle
    - expect: The theme toggle has data-moved
  3. Count the running animations on the sun and on the moon
    - expect: The sun has no running animation
    - expect: The moon has no running animation

#### 1.12. Selects the short bio by default and shows only its text

**File:** `e2e/home-page/defaults-the-bio-to-the-short-text.spec.ts`

**Steps:**
  1. Open the home page at /
    - expect: The radio "Singkat" is checked and "Panjang" is not
    - expect: The short text is visible
    - expect: The long-only text is hidden

#### 1.13. Selects the long bio with the arrow keys and shows its text

**File:** `e2e/home-page/shows-the-long-bio-with-the-arrow-keys.spec.ts`

**Steps:**
  1. Open the home page at / and focus the radio "Singkat"
  2. Press ArrowRight
    - expect: The radio "Panjang" is focused and checked
    - expect: The long-only text is visible
    - expect: The short-only text is hidden

#### 1.14. Swaps the title to the greeting while the contact link is hovered or focused, and keeps the heading name

**File:** `e2e/home-page/shows-the-greeting-while-the-contact-is-hovered-or-focused.spec.ts`

**Steps:**
  1. Open the home page at / and hover the contact link "Kirim email ke Risqi"
    - expect: The level-1 heading has data-state="greeting" and the greeting is opaque
    - expect: The heading's accessible name is "@risqiromadhoni"
  2. Move the pointer away
    - expect: The heading has data-state="farewell"
  3. Focus the contact link
    - expect: The heading has data-state="greeting"
    - expect: The heading's accessible name is "@risqiromadhoni"

#### 1.15. Has no WCAG 2.2 AA violations in dark mode

**File:** `e2e/home-page/has-no-wcag-2-2-aa-violations-in-dark-mode.spec.ts`

**Steps:**
  1. Set the saved theme to dark before the page loads, then open the home page at /
    - expect: The html element has the dark class
    - expect: The heading "@risqiromadhoni" is visible
  2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    - expect: The scan reports no violations
