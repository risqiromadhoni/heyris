import { element, text } from "./nodes";
import { markdownStrings } from "./strings";
import type { HastPlugin } from "./types";
import type { Locale } from "../../shared/i18n";

// Content links to its own pages with relative paths, so an absolute http(s) URL is another site.
const EXTERNAL = /^https?:\/\//i;

/**
 * Open links to other sites in a new tab. Each gets `rel="noopener noreferrer"`, an arrow icon
 * after its text, and a visually hidden note that it opens a new tab, for screen readers.
 */
export function externalLinks(locale: Locale): HastPlugin {
  const strings = markdownStrings(locale);

  return {
    name: "md-external-links",
    element: {
      filter: ["a"],
      visit(link, ctx) {
        if (!EXTERNAL.test(String(link.properties.href ?? ""))) return;

        // Keep classes the author added with `{.class}`.
        const names = Array.isArray(link.properties.className)
          ? link.properties.className.map(String)
          : [];

        ctx.setProperty(link, "target", "_blank");
        ctx.setProperty(link, "rel", "noopener noreferrer");
        ctx.setProperty(link, "className", [...names, "md-external"]);
        ctx.appendChild(
          link,
          element(
            "span",
            { className: ["md-external__icon", "i-lucide-arrow-up-right"], ariaHidden: "true" },
            [],
          ),
        );
        ctx.appendChild(
          link,
          element("span", { className: ["sr-only"] }, [text(` ${strings.newTab}`)]),
        );
      },
    },
  };
}
