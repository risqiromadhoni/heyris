type CopyState = "idle" | "copied" | "failed";

const RESET_MS = 2000;

/**
 * The index of the item an arrow, Home or End key moves to, or `undefined` for other keys. The
 * list wraps at both ends, so ArrowUp from the first item lands on the last.
 */
function targetIndex(key: string, index: number, length: number): number | undefined {
  const last = length - 1;

  if (key === "Home") return 0;

  if (key === "End") return last;

  if (key === "ArrowDown") return (index + 1) % length;

  if (key === "ArrowUp") return index <= 0 ? last : index - 1;

  return undefined;
}

function mountCopyPage(root: HTMLElement): void {
  const main = root.querySelector("[data-copy-main]");
  const caret = root.querySelector("[data-copy-caret]");
  const menu = root.querySelector("[data-copy-menu]");
  const label = root.querySelector("[data-copy-label]");

  if (
    !(main instanceof HTMLButtonElement) ||
    !(caret instanceof HTMLButtonElement) ||
    !(menu instanceof HTMLElement) ||
    !(label instanceof HTMLElement)
  ) {
    return;
  }

  const idleLabel = label.textContent ?? "";
  let timer = 0;

  const isOpen = () => !menu.hidden;

  const items = () =>
    [...menu.querySelectorAll("a")].filter(
      (link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement,
    );

  const setState = (state: CopyState, message: string) => {
    window.clearTimeout(timer);
    root.dataset.state = state;
    label.textContent = state === "idle" ? idleLabel : message;

    if (state !== "idle") {
      timer = window.setTimeout(() => setState("idle", idleLabel), RESET_MS);
    }
  };

  const setOpen = (open: boolean) => {
    menu.hidden = !open;
    caret.setAttribute("aria-expanded", String(open));
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);

    if (returnFocus) caret.focus();
  };

  main.addEventListener("click", () => {
    const url = main.dataset.copyUrl ?? "";

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return response.text();
      })
      .then((text) => navigator.clipboard.writeText(text))
      .then(
        () => setState("copied", main.dataset.copied ?? ""),
        () => setState("failed", main.dataset.failed ?? ""),
      );
  });

  caret.addEventListener("click", () => setOpen(!isOpen()));

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      close(true);

      return;
    }

    const list = items();
    const active = document.activeElement;
    const index = active instanceof HTMLAnchorElement ? list.indexOf(active) : -1;
    const target = targetIndex(event.key, index, list.length);

    if (target === undefined || !isOpen()) return;

    event.preventDefault();
    list[target]?.focus();
  });

  root.addEventListener("focusout", (event) => {
    const next = event.relatedTarget;

    if (!(next instanceof Node) || !root.contains(next)) setOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Node) || !root.contains(event.target)) setOpen(false);
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a") !== null) setOpen(false);
  });
}

/**
 * The split button and its disclosure. The main part fetches the page's Markdown and copies it.
 * The caret opens a list of links that closes on Escape, on an outside click, on leaving the
 * list, and after an item is chosen. Escape returns focus to the caret. Arrow keys, Home and End
 * move between the items.
 */
export function mountCopyPages(): void {
  document.querySelectorAll("[data-copy-page]").forEach((node) => {
    if (node instanceof HTMLElement) mountCopyPage(node);
  });
}
