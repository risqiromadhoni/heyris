import { fenceLanguage, highlight } from "./highlight";
import { classes, element, present, text } from "./nodes";
import type { Props } from "./nodes";
import { markdownStrings } from "./strings";
import type { HastPlugin } from "./types";
import type { Locale } from "../../shared/i18n";

// The gutter's numbers, one per line of the block: `1` through `count`, joined by newlines.
function gutterNumbers(count: number): string {
  return Array.from({ length: count }, (_line, index) => String(index + 1)).join("\n");
}

/**
 * Wrap each code block in a `figure.md-code` with a header: the file name from `{title=…}`, and
 * a copy button. `{.line-numbers}` adds a gutter of numbers. The gutter sits outside `code`, so
 * copying the code never includes it, and it is hidden from assistive technology.
 *
 * The code is highlighted here rather than by Astro's `syntaxHighlight`, which runs first and
 * replaces `<pre>` with Shiki's, dropping the `title` and classes this plugin reads.
 */
export function codeBlocks(locale: Locale): HastPlugin {
  const strings = markdownStrings(locale);

  return {
    name: "md-code",
    element: {
      filter: ["pre"],
      async visit(pre, ctx) {
        const code = pre.children.find(
          (child) => child.type === "element" && child.tagName === "code",
        );

        if (code?.type !== "element") return;

        const title = String(code.properties.title ?? "");
        const names = Array.isArray(code.properties.className) ? code.properties.className : [];
        const numbered = names.includes("line-numbers");
        const source = ctx.textContent(code).replace(/\n$/, "");
        const lines = source.split("\n").length;
        const highlighted = await highlight(source, fenceLanguage(names));

        const gutter = element("span", { className: ["md-code__gutter"], ariaHidden: "true" }, [
          text(gutterNumbers(lines)),
        ]);

        const copy = element(
          "button",
          {
            type: "button",
            className: ["md-code__copy"],
            dataCopyCode: true,
            dataCopied: strings.copied,
          },
          [
            element(
              "span",
              { className: ["md-code__copy-icon", "i-ph-copy"], ariaHidden: "true" },
              [],
            ),
            text(strings.copyCode),
          ],
        );

        const header = element("figcaption", { className: ["md-code__header"] }, [
          ...present([
            title === ""
              ? undefined
              : element("span", { className: ["md-code__file"] }, [text(title)]),
          ]),
          copy,
        ]);

        const body = element(
          "pre",
          { className: ["md-code__pre"], tabIndex: 0 },
          numbered ? [gutter, highlighted?.code ?? code] : [highlighted?.code ?? code],
        );

        const figure: Props = { className: classes("md-code", numbered && "md-code--numbered") };

        if (highlighted !== undefined) figure.style = highlighted.style;

        return element("figure", figure, [header, body]);
      },
    },
  };
}
