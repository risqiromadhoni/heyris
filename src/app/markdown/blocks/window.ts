import { htmlBlock, present, text } from "../nodes";

// Three decorative dots, then the address pill when the window has an address.
function chrome(address: string | undefined) {
  const dot = htmlBlock("span", { className: ["md-window__dot"] }, []);

  const pill =
    address === undefined
      ? undefined
      : htmlBlock("span", { className: ["md-window__address"] }, [text(address)]);

  return htmlBlock("div", { className: ["md-window__bar"] }, [
    htmlBlock("span", { className: ["md-window__dots"], ariaHidden: "true" }, [dot, dot, dot]),
    ...present([pill]),
  ]);
}

/** `::window{address=…}`: browser chrome around its content. */
export function windowBlock<C extends { type: string }>(
  address: string | undefined,
  children: ReadonlyArray<C>,
) {
  return htmlBlock("div", { className: ["md-window"] }, [
    chrome(address),
    htmlBlock("div", { className: ["md-window__content"] }, children),
  ]);
}
