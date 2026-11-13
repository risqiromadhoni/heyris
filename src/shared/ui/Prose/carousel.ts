interface Carousel {
  track: HTMLElement;
  slides: HTMLElement[];
  dots: HTMLElement[];
  counter: HTMLElement | undefined;
  previous: HTMLButtonElement | undefined;
  next: HTMLButtonElement | undefined;
  current: number;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const htmlElements = (root: Element | Document, selector: string): HTMLElement[] =>
  [...root.querySelectorAll(selector)].filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );

// The slide whose centre is nearest the centre of the visible track.
function nearestSlide({ track, slides }: Carousel): number {
  const visibleCentre = track.scrollLeft + track.clientWidth / 2;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - visibleCentre);

    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
}

// Active slide, its dot and counter, `inert` on the others, and buttons disabled at the ends.
function render({ slides, dots, counter, previous, next, current }: Carousel): void {
  slides.forEach((slide, index) => {
    const active = index === current;

    slide.classList.toggle("md-carousel__slide--active", active);
    slide.inert = !active;
  });

  dots.forEach((dot, index) => dot.classList.toggle("md-carousel__dot--active", index === current));

  if (counter !== undefined) {
    counter.textContent = `${current + 1} / ${slides.length}`;
  }

  if (previous !== undefined) {
    previous.disabled = current === 0;
  }

  if (next !== undefined) {
    next.disabled = current === slides.length - 1;
  }
}

// Scroll a slide to the centre of the track. Reduced motion gets an instant jump.
function scrollToSlide({ track, slides }: Carousel, index: number): void {
  const slide = slides[index];

  if (slide === undefined) return;

  track.scrollTo({
    left: slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2,
    behavior: window.matchMedia(REDUCED_MOTION).matches ? "auto" : "smooth",
  });
}

function mountCarousel(region: HTMLElement): void {
  const track = region.querySelector(".md-carousel__track");
  const counter = region.querySelector(".md-carousel__counter");
  const previous = region.querySelector(".md-carousel__button--previous");
  const next = region.querySelector(".md-carousel__button--next");

  if (!(track instanceof HTMLElement)) return;

  const carousel: Carousel = {
    track,
    slides: htmlElements(track, ".md-carousel__slide"),
    dots: htmlElements(region, ".md-carousel__dot"),
    counter: counter instanceof HTMLElement ? counter : undefined,
    previous: previous instanceof HTMLButtonElement ? previous : undefined,
    next: next instanceof HTMLButtonElement ? next : undefined,
    current: 0,
  };

  if (carousel.slides.length === 0) return;

  // The track scrolls, so it must be reachable by keyboard for the scrolling to be too.
  track.tabIndex = 0;

  const step = (offset: number) => {
    const last = carousel.slides.length - 1;

    scrollToSlide(carousel, Math.min(last, Math.max(0, carousel.current + offset)));
  };

  let frame = 0;

  track.addEventListener(
    "scroll",
    () => {
      if (frame !== 0) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;

        const current = nearestSlide(carousel);

        if (current !== carousel.current) {
          carousel.current = current;
          render(carousel);
        }
      });
    },
    { passive: true },
  );

  carousel.previous?.addEventListener("click", () => step(-1));
  carousel.next?.addEventListener("click", () => step(1));

  region.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      step(-1);
    } else if (event.key === "ArrowRight") {
      step(1);
    }
  });

  render(carousel);
}

/** Mount every carousel on the page. Without this script the track still scrolls natively. */
export function mountCarousels(): void {
  htmlElements(document, "[data-carousel]").forEach(mountCarousel);
}
