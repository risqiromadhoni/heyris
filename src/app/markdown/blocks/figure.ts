import { classes, htmlBlock } from "../nodes";

/**
 * `:::figure` and `:::figure{.wide}`: a framed block with a decorative backdrop behind its
 * content. The backdrop is empty, so the artwork is CSS, not an image.
 */
export function figureBlock<C extends { type: string }>(children: ReadonlyArray<C>, wide: boolean) {
  return htmlBlock("figure", { className: classes("md-figure", wide && "md-figure--wide") }, [
    htmlBlock("div", { className: ["md-figure__backdrop"], ariaHidden: "true" }, []),
    htmlBlock("div", { className: ["md-figure__content"] }, children),
  ]);
}

/**
 * `:::figure-pair`: each child window becomes a figure of its own with the same backdrop, so the
 * pair reads as two framed panels side by side, stacked on narrow screens.
 */
export function figurePairBlock<C extends { type: string }>(children: ReadonlyArray<C>) {
  return htmlBlock(
    "div",
    { className: ["md-figure-pair"] },
    children.map((child) => figureBlock([child], false)),
  );
}
