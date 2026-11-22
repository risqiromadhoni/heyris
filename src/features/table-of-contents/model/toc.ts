import { activeIndex, findParts, linkIndexForHash, targetsOf } from "./dom";
import type { Parts } from "./dom";

// From this width the panel sits in the right gutter beside the text instead of over it.
const ASIDE_QUERY = "(min-width: 1280px)";

// Room kept above and below the active link when the list scrolls to show it.
const SCROLL_PADDING_PX = 12;

// How long the page must stop scrolling before the reading position takes over again after a
// link was chosen. Smooth scrolling fires scroll events every frame until it lands.
const SETTLE_MS = 150;

function mountTableOfContents(parts: Parts): void {
  const { toggle, panel, close, scroller, list, indicator, links } = parts;
  const aside = window.matchMedia(ASIDE_QUERY);
  let current = -2;
  let frame = 0;
  // While the page scrolls to a chosen link, that link stays active instead of every section
  // the scroll passes on its way.
  let chosen = false;
  let settle = 0;

  const isOpen = () => !panel.hidden;

  const revealLink = (link: HTMLAnchorElement) => {
    const linkBox = link.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();

    if (linkBox.top < box.top + SCROLL_PADDING_PX) {
      scroller.scrollTop -= box.top + SCROLL_PADDING_PX - linkBox.top;
    } else if (linkBox.bottom > box.bottom - SCROLL_PADDING_PX) {
      scroller.scrollTop += linkBox.bottom - (box.bottom - SCROLL_PADDING_PX);
    }
  };

  // Mark the link at `index` and move the indicator to it. `instant` skips the slide, for opening.
  const show = (index: number, instant: boolean) => {
    if (index === current && !instant) return;

    current = index;
    links.forEach((link, position) => {
      if (position === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    const link = links[index];

    if (link === undefined) {
      delete list.dataset.active;

      return;
    }

    if (instant) list.dataset.instant = "";

    indicator.style.setProperty("--toc-y", `${link.offsetTop}px`);
    indicator.style.setProperty("--toc-h", `${link.offsetHeight}px`);
    list.dataset.active = "";
    revealLink(link);

    if (instant) {
      // Two frames: the first paints the new position, the second turns the slide back on.
      requestAnimationFrame(() => requestAnimationFrame(() => delete list.dataset.instant));
    }
  };

  const update = (instant: boolean) => show(activeIndex(targetsOf(links)), instant);

  const waitForSettle = () => {
    window.clearTimeout(settle);
    settle = window.setTimeout(() => {
      chosen = false;
      update(false);
    }, SETTLE_MS);
  };

  const schedule = () => {
    if (chosen) {
      waitForSettle();

      return;
    }

    if (!isOpen() || frame !== 0) return;

    frame = requestAnimationFrame(() => {
      frame = 0;
      update(false);
    });
  };

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));

    if (open) update(true);
  };

  // The toggle sits in the article header, usually far above; focusing it must not scroll there.
  const closeAndFocus = () => {
    setOpen(false);
    toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  close.addEventListener("click", closeAndFocus);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return;

    const focus = document.activeElement;

    if (focus !== toggle && !(focus instanceof Node && panel.contains(focus))) return;

    event.preventDefault();
    closeAndFocus();
  });

  // Over the text, the panel behaves like a menu: an outside press or a chosen link closes it.
  document.addEventListener("pointerdown", (event) => {
    if (!isOpen() || aside.matches || !(event.target instanceof Node)) return;

    if (!panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  panel.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("[data-toc-link]") : null;
    const index = link instanceof HTMLAnchorElement ? links.indexOf(link) : -1;

    if (index === -1) return;

    if (!aside.matches) {
      setOpen(false);

      return;
    }

    chosen = true;
    show(index, false);
    waitForSettle();
  });

  // A URL that names one of the sections opens the panel beside the text, on arrival and on a
  // later fragment change. Over the text it would hide the very section the link points to.
  const openForHash = () => {
    const index = linkIndexForHash(links, window.location.hash);

    if (index === -1 || !aside.matches) return;

    const opening = !isOpen();

    if (opening) setOpen(true);

    chosen = true;
    show(index, opening);
    waitForSettle();
  };

  window.addEventListener("hashchange", openForHash);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    if (isOpen()) update(true);
  });

  openForHash();
}

/**
 * The table of contents beside an article. The toggle slides the panel in from the right and
 * out again; the close button and Escape close it and return focus to the toggle. While open,
 * the link of the section being read is marked `aria-current` and an indicator slides to it.
 * Below 1280 px the panel covers the text, so an outside press or choosing a link closes it.
 * From 1280 px a URL fragment naming one of the sections opens it with that section marked.
 */
export function mountTablesOfContents(): void {
  document.querySelectorAll("[data-toc]").forEach((node) => {
    const parts = node instanceof HTMLElement ? findParts(node) : undefined;

    if (parts !== undefined) mountTableOfContents(parts);
  });
}
