import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { mountReadingProgress } from "./reading-progress";

const bar = () => document.querySelector<HTMLElement>("[data-reading-progress]");

beforeEach(() => {
  document.body.innerHTML = `
    <div data-reading-progress></div>
    <article style="height: ${window.innerHeight * 3}px"></article>
  `;
  window.scrollTo(0, 0);
});

afterEach(() => {
  window.scrollTo(0, 0);
});

describe("reading progress", () => {
  it("starts empty at the top", () => {
    mountReadingProgress();

    expect(bar()?.style.transform).toBe("scaleX(0)");
  });

  it("tracks the scroll position", async () => {
    mountReadingProgress();

    const range = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo(0, range / 2);
    await expect.poll(() => bar()?.style.transform).toBe("scaleX(0.5)");

    window.scrollTo(0, range);
    await expect.poll(() => bar()?.style.transform).toBe("scaleX(1)");
  });

  it("stays empty when the page does not scroll", () => {
    document.querySelector("article")?.remove();
    mountReadingProgress();

    expect(bar()?.style.transform).toBe("scaleX(0)");
  });
});
