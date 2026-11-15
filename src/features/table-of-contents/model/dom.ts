// Where a heading counts as the current section: just below its 96 px `scroll-margin-top`.
const READING_LINE_PX = 104;

/** The elements of one table of contents, found by their `data-toc-*` hooks. */
export interface Parts {
  toggle: HTMLButtonElement;
  panel: HTMLElement;
  close: HTMLButtonElement;
  scroller: HTMLElement;
  list: HTMLElement;
  indicator: HTMLElement;
  links: HTMLAnchorElement[];
}

/** The parts of the table of contents whose panel is `panel`, or `undefined` if one is missing. */
export function findParts(panel: HTMLElement): Parts | undefined {
  const toggle = document.querySelector(`[data-toc-toggle][aria-controls="${panel.id}"]`);
  const close = panel.querySelector("[data-toc-close]");
  const scroller = panel.querySelector("[data-toc-scroller]");
  const list = panel.querySelector("[data-toc-list]");
  const indicator = panel.querySelector("[data-toc-indicator]");

  const links = [...panel.querySelectorAll("[data-toc-link]")].filter(
    (link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement,
  );

  if (
    !(toggle instanceof HTMLButtonElement) ||
    !(close instanceof HTMLButtonElement) ||
    !(scroller instanceof HTMLElement) ||
    !(list instanceof HTMLElement) ||
    !(indicator instanceof HTMLElement)
  ) {
    return undefined;
  }

  return { toggle, panel, close, scroller, list, indicator, links };
}

/** The heading each link points to, or `undefined` where the target is missing. */
export function targetsOf(links: readonly HTMLAnchorElement[]): (HTMLElement | undefined)[] {
  return links.map((link) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));

    return target instanceof HTMLElement ? target : undefined;
  });
}

/**
 * The index of the section being read: the last heading above the reading line, or the last one
 * once the page cannot scroll further. -1 above the first heading.
 */
export function activeIndex(targets: readonly (HTMLElement | undefined)[]): number {
  const root = document.documentElement;

  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
    return targets.findLastIndex((target) => target !== undefined);
  }

  return targets.findLastIndex(
    (target) => target !== undefined && target.getBoundingClientRect().top <= READING_LINE_PX,
  );
}

/** The index of the link whose fragment is `hash` (with its `#`), or -1. */
export function linkIndexForHash(links: readonly HTMLAnchorElement[], hash: string): number {
  if (hash.length < 2) return -1;

  return links.findIndex((link) => link.hash === hash);
}
