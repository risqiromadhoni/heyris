import { beforeEach, describe, expect, it } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";

import { mountCarousels } from "./carousel";

// The markup `src/app/markdown/blocks/carousel.ts` emits, with inline layout standing in for
// prose.css: one full-width slide per view on a horizontally scrolling track.
const slide = (n: number) =>
  `<div class="md-carousel__slide" role="group" aria-roledescription="slide" aria-label="${n} / 3" style="flex: 0 0 100%; height: 40px">Slide ${n}</div>`;

const FIXTURE = `
  <div class="md-carousel" role="region" aria-roledescription="carousel" aria-label="Galeri" data-carousel style="width: 300px">
    <div class="md-carousel__track" style="display: flex; overflow-x: auto">${[1, 2, 3].map(slide).join("")}</div>
    <button type="button" class="md-carousel__button md-carousel__button--previous" aria-label="Sebelumnya"></button>
    <button type="button" class="md-carousel__button md-carousel__button--next" aria-label="Berikutnya"></button>
    <div class="md-carousel__pagination">
      <span class="md-carousel__dots" aria-hidden="true"><span class="md-carousel__dot"></span><span class="md-carousel__dot"></span><span class="md-carousel__dot"></span></span>
      <span class="md-carousel__counter">1 / 3</span>
    </div>
  </div>
`;

const slides = () => Array.from(document.querySelectorAll<HTMLElement>(".md-carousel__slide"));
const counter = () => document.querySelector(".md-carousel__counter")?.textContent;
const previous = () => page.getByRole("button", { name: "Sebelumnya" });
const next = () => page.getByRole("button", { name: "Berikutnya" });

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
  mountCarousels();
});

describe("carousel", () => {
  it("starts on the first slide with the others inert", async () => {
    expect(slides().map((element) => element.inert)).toEqual([false, true, true]);
    expect(counter()).toBe("1 / 3");
    await expect.element(previous()).toBeDisabled();
    await expect.element(next()).toBeEnabled();
  });

  it("makes the track reachable by keyboard", () => {
    expect(document.querySelector<HTMLElement>(".md-carousel__track")?.tabIndex).toBe(0);
  });

  it("leaves a carousel without slides alone", () => {
    document.body.innerHTML = `<div data-carousel><div class="md-carousel__track"></div></div>`;
    mountCarousels();

    expect(document.querySelector<HTMLElement>(".md-carousel__track")?.tabIndex).toBe(-1);
  });

  it("moves to the next slide and back with the buttons", async () => {
    await next().click();
    await expect.poll(counter).toBe("2 / 3");
    expect(slides().map((element) => element.inert)).toEqual([true, false, true]);

    await previous().click();
    await expect.poll(counter).toBe("1 / 3");
  });

  it("follows the arrow keys and stops at the last slide", async () => {
    await next().click();
    await expect.poll(counter).toBe("2 / 3");

    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(counter).toBe("3 / 3");
    await expect.element(next()).toBeDisabled();

    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(counter).toBe("3 / 3");
  });

  it("follows a direct scroll of the track", async () => {
    const track = document.querySelector<HTMLElement>(".md-carousel__track");

    track?.scrollTo({ left: 600 });

    await expect.poll(counter).toBe("3 / 3");
    expect(document.querySelectorAll(".md-carousel__dot")[2]?.className).toContain(
      "md-carousel__dot--active",
    );
  });
});
