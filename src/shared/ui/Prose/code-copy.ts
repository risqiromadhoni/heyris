const COPIED_MS = 2000;

const idleLabels = new WeakMap<HTMLButtonElement, string>();
const timers = new WeakMap<HTMLButtonElement, number>();

let liveRegion: HTMLElement | undefined;

// One polite live region for the page, so the copied state is announced without moving focus.
function announce(message: string): void {
  if (liveRegion === undefined) {
    liveRegion = document.createElement("p");
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
}

// Swap the button's text label for its copied label, then restore the idle label after 2 s.
function showCopied(button: HTMLButtonElement, copied: string): void {
  const label = button.lastChild;

  if (!(label instanceof Text)) return;

  const idle = idleLabels.get(button) ?? label.data;
  idleLabels.set(button, idle);
  window.clearTimeout(timers.get(button));
  label.data = copied;
  announce(copied);
  timers.set(
    button,
    window.setTimeout(() => {
      label.data = idle;
    }, COPIED_MS),
  );
}

/** Copy a code block's text (the `code` element, never the line-number gutter) on button press. */
export function mountCodeCopy(): void {
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest("[data-copy-code]");

    if (!(button instanceof HTMLButtonElement)) return;

    const code = button.closest(".md-code")?.querySelector("pre code");

    if (code === null || code === undefined) return;

    const copied = button.dataset.copied ?? "";

    navigator.clipboard.writeText(code.textContent ?? "").then(
      () => showCopied(button, copied),
      () => undefined,
    );
  });
}
