import { text } from "./nodes";
import { markdownStrings } from "./strings";
import type { HastPlugin } from "./types";
import type { Locale } from "../../shared/i18n";

/**
 * Localize the footnote section. Sätteri's `features` are fixed per processor, so the label and
 * the return links' names are set per document from its locale. The label is shown, not
 * screen-reader-only, as in the design.
 */
export function footnoteLabels(locale: Locale): HastPlugin {
  const strings = markdownStrings(locale);

  return {
    name: "md-footnotes",
    element: [
      {
        filter: ["h2"],
        visit(heading, ctx) {
          const parent = ctx.parent(heading);

          if (parent?.type !== "element" || parent.properties.dataFootnotes !== true) return;

          ctx.setField(heading, "children", [text(strings.footnotes)]);
          ctx.setProperty(heading, "className", ["md-footnotes__label"]);
        },
      },
      {
        filter: ["a"],
        visit(link, ctx) {
          if (link.properties.dataFootnoteBackref === undefined) return;

          const number = /(\d+)$/.exec(String(link.properties.ariaLabel ?? ""))?.[1];

          if (number === undefined) return;

          ctx.setProperty(link, "ariaLabel", strings.footnoteBack(Number(number)));
        },
      },
    ],
  };
}
