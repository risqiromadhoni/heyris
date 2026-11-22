import { htmlBlock, present, text } from "../nodes";

/** A diagram box: a title and an optional subtitle. */
export interface DiagramBox {
  title: string;
  subtitle: string | undefined;
}

// The stem and caret between two boxes. Decorative, so hidden from assistive technology.
function connector() {
  return htmlBlock("span", { className: ["md-diagram__connector"], ariaHidden: "true" }, [
    htmlBlock("span", { className: ["md-diagram__stem"] }, []),
    htmlBlock("span", { className: ["md-diagram__caret", "i-ph-caret-down"] }, []),
  ]);
}

/** `:::diagram`: boxes in order, each joined to the next by a connector. */
export function diagramBlock(boxes: ReadonlyArray<DiagramBox>) {
  return htmlBlock(
    "ol",
    { className: ["md-diagram"] },
    boxes.map((box, index) =>
      htmlBlock("li", { className: ["md-diagram__step"] }, [
        htmlBlock("div", { className: ["md-diagram__box"] }, [
          htmlBlock("span", { className: ["md-diagram__title"] }, [text(box.title)]),
          ...present([
            box.subtitle === undefined
              ? undefined
              : htmlBlock("span", { className: ["md-diagram__subtitle"] }, [text(box.subtitle)]),
          ]),
        ]),
        ...present([index < boxes.length - 1 ? connector() : undefined]),
      ]),
    ),
  );
}
