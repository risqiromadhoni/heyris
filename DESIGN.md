---
version: alpha
name: heyris
description: Personal site of @risqiromadhoni, a software engineer, with a writing index, long-form posts and short notes.
colors:
  lr-bg: "#FFFFFF"
  lr-text: "#282828"
  lr-heading: "#282828"
  lr-nav: "#676767"
  lr-line: "#2828281A"
  lr-surface: "#F3F3F2"
  lr-bullet: "#676767B3"
  lr-underline: "#6767674D"
typography:
  lr-serif:
    fontFamily: Source Serif 4
  lr-sans:
    fontFamily: DM Sans
  a-mono:
    fontFamily: DM Mono
---

## Overview

A quiet, text-first personal site: a short bio, an index of long posts and notes, and reading pages. Light and dark modes are both first-class, and a day or night illustration with an animated sun and moon toggle carries the atmosphere on the home page. The source of truth is `design.pen`; this document mirrors its variables and behavior notes.

## Colors

Every surface is built from one neutral ramp; there is no accent color. Use `lr-text` for body copy and option labels, `lr-heading` for titles and emphasized labels, and `lr-nav` for navigation, dates, summaries, tags and other metadata. `lr-surface` is the only tinted fill, reserved for raised content such as the contact trigger, code blocks, commit lists, the TL;DR box and a highlighted post row. Separation comes from `lr-line` hairlines instead of shadows or filled blocks. `lr-bullet` marks list numbers and code line numbers, and `lr-underline` is the resting underline of small text links such as the footer. Inline links in posts and notes are `lr-text` with an `lr-nav` underline, so they stand out from the body copy without an accent colour; links to other sites end with an arrow-up-right icon and open in a new tab.

## Themes

Tokens above hold the light values. Dark mode swaps each one to the value below. Toggle it by adding the `dark` class on `<html>`, store `light` or `dark` under the `theme` key in localStorage only when it differs from the system (choosing what the system shows removes the key), and apply it from an inline script in `<head>` before paint, falling back to `prefers-color-scheme`.

| Token          | Light       | Dark        |
| -------------- | ----------- | ----------- |
| `lr-bg`        | `#FFFFFF`   | `#1B1A19`   |
| `lr-text`      | `#282828`   | `#E8E5DF`   |
| `lr-heading`   | `#282828`   | `#F4F1EB`   |
| `lr-nav`       | `#676767`   | `#AAA59E`   |
| `lr-line`      | `#2828281A` | `#E8E5DF2E` |
| `lr-surface`   | `#F3F3F2`   | `#242321`   |
| `lr-bullet`    | `#676767B3` | `#AAA59EB3` |
| `lr-underline` | `#6767674D` | `#AAA59E4D` |

## Typography

`lr-serif` carries all reading and titling: site name, page titles, year headings, post titles and article body. Titles are semibold with tight line height, and the largest page titles also use negative tracking. Article body stays regular with generous line height, and bold is only for run-in lead-ins. `lr-sans` is for interface text: navigation, dates, summaries, tags, reading time, buttons and captions. Small tag labels use slight positive tracking. `a-mono` is only for code, line numbers, file trees and commit hashes.

## Layout

Pages sit on a wide canvas with generous, equal outer padding. The home page splits into a narrow copy column and an illustration column that fills the remaining height. The writing index is a two-column rhythm: a narrow rail on the left for the page title or year, and a wider list on the right. Posts and notes read in a single narrow column under a top bar that holds a back link.

The year rail sticks to the top of the viewport while its group's posts scroll and releases at the end of the group. The group wrapper must be its containing block and must not use `overflow: hidden`. The top bar is sticky above content on a solid page background, with its bottom `lr-line` border as the default state and the track for a thin reading-progress bar that grows from the left with scroll position, using `lr-text` as its fill. Drive progress with a scroll listener or CSS scroll timeline, honor `prefers-reduced-motion`, and mark it decorative with `aria-hidden` or expose it as a `progressbar` labelled "Reading progress".

## Elevation & Depth

The design is flat. Depth comes from `lr-line` borders and the `lr-surface` fill, never drop shadows. Page backgrounds are `lr-bg` overlaid with the shared haze shader from `designs/shaders`; the home illustration panel combines the generated image with the day-light shader and gains night overlay layers in dark mode.

## Shapes

Corners are used sparingly. Content panels such as code blocks, commit lists, figures, the TL;DR box and the highlighted post row have small rounded corners with a hairline border. The contact trigger and theme toggle are fully rounded. Post rows in the index are not cards: they are separated by a bottom hairline.

## Components

- **Navigation:** text links in `lr-nav`; the current page uses `lr-text` with a thick bottom underline. A language toggle sits at the end of the nav.
- **Post row:** title in serif, summary and reading time in sans, tag label above the title, bottom hairline separator.
- **Theme toggle:** a click toggles light and dark. A sun glow and a moon glow each rotate around a far point below the button, so the motion reads as an arc. The outgoing body sets to the right while the incoming one rises from the left. The swap, the arc and the night overlay cross-fade share one slow ease-in-out duration and start on the same click. Animate only after the first click so page load shows the resting state, wrap motion in `motion-safe`, and flip the accessible label between switching to dark and to light. The button keeps its position when toggled, and the WebGL backdrop and panel shaders restart when the `dark` class changes.
