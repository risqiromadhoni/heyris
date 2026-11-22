/** A heading as Astro's `render()` reports it. */
export interface RenderedHeading {
  depth: number;
  slug: string;
  text: string;
}

/** One link in the table of contents. */
export interface TocItem {
  /** 2 for a section, 3 for a subsection, 4 for a part of a subsection. */
  depth: 2 | 3 | 4;
  /** The heading's id, the link's fragment. */
  slug: string;
  text: string;
}

// The footnotes section's own heading, which the Markdown pipeline adds after the body.
const FOOTNOTES_SLUG = "footnote-label";

// The heading-anchor plugin appends a `#` link to `h2` and `h3` only, and Astro's heading text
// includes it. An `h4` has no anchor, so a `#` at its end is part of the title.
const ANCHOR_SUFFIX = /\s*#$/;

/**
 * The sections of an article in reading order, three levels deep (`h2` to `h4`), without the
 * footnotes heading, and with the `#` of the heading anchor removed from the `h2` and `h3` titles.
 */
export function tocItems(headings: ReadonlyArray<RenderedHeading>): Array<TocItem> {
  return headings.flatMap((heading) => {
    if (heading.slug === FOOTNOTES_SLUG) return [];

    const { depth, slug } = heading;

    if (depth !== 2 && depth !== 3 && depth !== 4) return [];

    const text = (depth === 4 ? heading.text : heading.text.replace(ANCHOR_SUFFIX, "")).trim();

    return text === "" ? [] : [{ depth, slug, text }];
  });
}
