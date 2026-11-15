// How long the panel stays after the pointer leaves, so it can cross the gap to the panel.
const CLOSE_DELAY_MS = 150;

function mountUpdateHistory(root: HTMLElement): void {
  const trigger = root.querySelector("[data-history-trigger]");
  const panel = root.querySelector("[data-history-panel]");

  if (!(trigger instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) return;

  let timer = 0;

  const setOpen = (open: boolean) => {
    window.clearTimeout(timer);
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  };

  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") setOpen(true);
  });

  root.addEventListener("pointerleave", (event) => {
    // A keyboard user may still be on the button; a mouse click's focus does not count.
    if (event.pointerType !== "mouse" || trigger.matches(":focus-visible")) return;

    timer = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  });

  trigger.addEventListener("focus", () => setOpen(true));
  trigger.addEventListener("click", () => setOpen(true));

  root.addEventListener("focusout", (event) => {
    const next = event.relatedTarget;

    if (!(next instanceof Node) || !root.contains(next)) setOpen(false);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || panel.hidden) return;

    event.preventDefault();
    setOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Node) || !root.contains(event.target)) setOpen(false);
  });
}

/**
 * The byline's update timeline. The clock button opens it on hover, on keyboard focus and on
 * click or tap, and it stays open while the pointer is over the button or the panel. Escape, an
 * outside press, or focus leaving the button closes it.
 */
export function mountUpdateHistories(): void {
  document.querySelectorAll("[data-update-history]").forEach((node) => {
    if (node instanceof HTMLElement) mountUpdateHistory(node);
  });
}
