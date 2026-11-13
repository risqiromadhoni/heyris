import { element, text } from "./nodes";
import { markdownStrings } from "./strings";
import type { HastPlugin } from "./types";
import type { Locale } from "../../shared/i18n";

/**
 * Append a `#` link to each prose `h2` and `h3`. It needs the heading's id, so the plugin list
 * runs Astro's heading-id plugin first. Headings in the footnote section get no link.
 */
export function headingAnchors(locale: Locale): HastPlugin {
  const strings = markdownStrings(locale);

  return {
    name: "md-heading-anchors",
    element: {
      filter: ["h2", "h3"],
      visit(heading, ctx) {
        const parent = ctx.parent(heading);

        if (parent?.type === "element" && parent.properties.dataFootnotes === true) return;

        const id = String(heading.properties.id ?? "");

        if (id === "") return;

        ctx.appendChild(
          heading,
          element(
            "a",
            { className: ["heading-anchor"], href: `#${id}`, ariaLabel: strings.headingAnchor },
            [element("span", { ariaHidden: "true" }, [text("#")])],
          ),
        );
      },
    },
  };
}
