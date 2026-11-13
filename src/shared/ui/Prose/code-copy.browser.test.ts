import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { mountCodeCopy } from "./code-copy";

// The markup `src/app/markdown/code.ts` emits for a numbered block with a file name.
const FIXTURE = `
  <figure class="md-code">
    <figcaption class="md-code__header">
      <span class="md-code__file">retry.ts</span>
      <button type="button" class="md-code__copy" data-copy-code data-copied="Tersalin"><span class="md-code__copy-icon" aria-hidden="true"></span>Salin</button>
    </figcaption>
    <pre class="md-code__pre" tabindex="0"><span class="md-code__gutter" aria-hidden="true">1
2</span><code class="language-ts">const a = 1;
const b = 2;
</code></pre>
  </figure>
`;

beforeAll(() => {
  mountCodeCopy();
});

// The script appends one live region to the body and keeps it, so swap only the fixture.
beforeEach(() => {
  document.querySelector("#fixture")?.remove();
  document.body.insertAdjacentHTML("afterbegin", `<div id="fixture">${FIXTURE}</div>`);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("code copy button", () => {
  it("copies the code without the line numbers", async () => {
    await page.getByRole("button", { name: "Salin" }).click();

    await expect.element(page.getByRole("button", { name: "Tersalin" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe("const a = 1;\nconst b = 2;\n");
  });

  it("announces the copy without moving focus", async () => {
    await page.getByRole("button", { name: "Salin" }).click();

    await expect
      .poll(() => document.querySelector("body > [aria-live=polite]")?.textContent)
      .toBe("Tersalin");
    await expect.element(page.getByRole("button", { name: "Tersalin" })).toHaveFocus();
  });

  it("restores its label after 2 s", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await page.getByRole("button", { name: "Salin" }).click();
    await expect.element(page.getByRole("button", { name: "Tersalin" })).toBeInTheDocument();

    vi.advanceTimersByTime(2000);

    await expect.element(page.getByRole("button", { name: "Salin" })).toBeInTheDocument();
  });

  it("keeps its label when the clipboard refuses", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new DOMException("Denied"));

    await page.getByRole("button", { name: "Salin" }).click();
    await expect.poll(() => writeText.mock.settledResults).toHaveLength(1);

    expect(document.querySelector("[data-copy-code]")?.textContent).toBe("Salin");
  });
});
