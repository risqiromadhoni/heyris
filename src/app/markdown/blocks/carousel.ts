import { classes, htmlBlock, text } from "../nodes";

/** Copy the carousel needs: its region name and the two button labels. */
export interface CarouselStrings {
  label: string;
  previous: string;
  next: string;
}

// A round arrow button. The arrow is CSS, so the button's name is its aria-label.
function arrow(direction: "previous" | "next", label: string) {
  return htmlBlock(
    "button",
    {
      type: "button",
      className: classes("md-carousel__button", `md-carousel__button--${direction}`),
      ariaLabel: label,
    },
    [
      htmlBlock(
        "span",
        {
          className: [
            "md-carousel__icon",
            direction === "previous" ? "i-ph-caret-left" : "i-ph-caret-right",
          ],
          ariaHidden: "true",
        },
        [],
      ),
    ],
  );
}

/**
 * `:::carousel`: each child block is one slide. Every slide is in the static HTML, so the track
 * scrolls without JavaScript. The first slide and dot start active; the client script moves them.
 */
export function carouselBlock<C extends { type: string }>(
  slides: readonly C[],
  strings: CarouselStrings,
) {
  const total = slides.length;

  const track = htmlBlock(
    "div",
    { className: ["md-carousel__track"] },
    slides.map((slide, index) =>
      htmlBlock(
        "div",
        {
          className: classes("md-carousel__slide", index === 0 && "md-carousel__slide--active"),
          role: "group",
          ariaRoledescription: "slide",
          ariaLabel: `${index + 1} / ${total}`,
        },
        [slide],
      ),
    ),
  );

  const dots = htmlBlock(
    "span",
    { className: ["md-carousel__dots"], ariaHidden: "true" },
    slides.map((_slide, index) =>
      htmlBlock(
        "span",
        { className: classes("md-carousel__dot", index === 0 && "md-carousel__dot--active") },
        [],
      ),
    ),
  );

  const pagination = htmlBlock("div", { className: ["md-carousel__pagination"] }, [
    dots,
    htmlBlock("span", { className: ["md-carousel__counter"] }, [text(`1 / ${total}`)]),
  ]);

  return htmlBlock(
    "div",
    {
      className: ["md-carousel"],
      role: "region",
      ariaRoledescription: "carousel",
      ariaLabel: strings.label,
      dataCarousel: true,
    },
    [track, arrow("previous", strings.previous), arrow("next", strings.next), pagination],
  );
}
