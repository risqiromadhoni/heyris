import { figurePairBlock, figureBlock } from "./blocks/figure";
import { carouselBlock } from "./blocks/carousel";
import { diagramBlock } from "./blocks/diagram";
import { checklistBlock, commitsBlock } from "./blocks/lists";
import { splitCommit, splitFirst } from "./blocks/parse";
import { windowBlock } from "./blocks/window";
import { describeSource, localeOf } from "./source";
import { markdownStrings } from "./strings";
import type { MarkdownStrings } from "./strings";
import { text } from "./nodes";
import type { MdastPlugin } from "./types";

// Directive names the container blocks accept. Any other `:::name` fails the build.
const CONTAINERS = [
  "figure",
  "figure-pair",
  "window",
  "diagram",
  "commits",
  "checklist",
  "carousel",
];

/**
 * Turn container directives into the design's blocks. Each block is an mdast node that renders
 * as an HTML element, so the output is plain `md-*` markup. Unknown container names throw, since
 * they would otherwise drop their content. Leaf and text directives come from prose such as
 * `Catatan:penting`, so their source text is restored instead.
 */
export function directiveBlocks(fileURL: URL | undefined): MdastPlugin {
  const strings: MarkdownStrings = markdownStrings(localeOf(fileURL));
  const source = describeSource(fileURL);

  return {
    name: "md-directives",
    containerDirective(node, ctx) {
      if (!CONTAINERS.includes(node.name)) {
        throw new Error(
          `Unknown directive :::${node.name} in ${source}. Known: ${CONTAINERS.join(", ")}.`,
        );
      }

      const items = node.children.flatMap((child) =>
        child.type === "list" ? child.children.map((item) => ctx.textContent(item)) : [],
      );

      const address = node.attributes?.address ?? undefined;
      const wide = (node.attributes?.class ?? "").split(/\s+/).includes("wide");

      switch (node.name) {
        case "figure":
          return ctx.replaceNode(node, figureBlock(node.children, wide));
        case "figure-pair":
          return ctx.replaceNode(node, figurePairBlock(node.children));
        case "window":
          return ctx.replaceNode(node, windowBlock(address, node.children));
        case "carousel":
          return ctx.replaceNode(node, carouselBlock(node.children, strings.carousel));
        case "diagram":
          return ctx.replaceNode(node, diagramBlock(items.map(boxOf)));
        case "commits":
          return ctx.replaceNode(node, commitsBlock(items.map(splitCommit)));
        case "checklist":
          return ctx.replaceNode(node, checklistBlock(items.map(rowOf)));
      }
    },
    leafDirective(node, ctx) {
      ctx.replaceNode(node, { type: "paragraph", children: [text(`::${node.name}`)] });
    },
    textDirective(node, ctx) {
      ctx.replaceNode(node, [text(`:${node.name}`), ...node.children]);
    },
  };
}

// `Title: subtitle`, split at the first colon.
function boxOf(item: string) {
  const { head, tail } = splitFirst(item, ": ");

  return { title: head, subtitle: tail };
}

// `Label: detail`, split at the first colon.
function rowOf(item: string) {
  const { head, tail } = splitFirst(item, ": ");

  return { label: head, detail: tail };
}
