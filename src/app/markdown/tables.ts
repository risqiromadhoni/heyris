import { htmlBlock } from "./nodes";
import { localeOf } from "./source";
import { markdownStrings } from "./strings";
import type { MdastPlugin } from "./types";

/**
 * Wrap every table in a focusable, labelled scroll frame (`.md-table`), so a wide table scrolls
 * inside its own box instead of squeezing its columns or widening the page. The frame is always
 * focusable, so keyboard users can scroll it whether or not it overflows.
 */
export function tableFrames(fileURL: URL | undefined): MdastPlugin {
  const label = markdownStrings(localeOf(fileURL)).table.label;

  // The frame holds the original table, so the visitor sees it again: skip the ones already framed.
  const framed = new WeakSet<object>();

  return {
    name: "md-table-frames",
    table(node, ctx) {
      if (framed.has(node)) {
        return;
      }

      framed.add(node);

      ctx.replaceNode(
        node,
        htmlBlock(
          "div",
          { className: ["md-table"], role: "region", tabIndex: 0, ariaLabel: label },
          [node],
        ),
      );
    },
  };
}
