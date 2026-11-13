/**
 * Scale the reading-progress bar with the scroll position. Scroll and resize events are passive
 * and coalesced into one update per animation frame. The bar is decorative, so it has no
 * transition and no reduced-motion case.
 */
export function mountReadingProgress(): void {
  const bar = document.querySelector("[data-reading-progress]");

  if (!(bar instanceof HTMLElement)) return;

  let frame = 0;

  const update = () => {
    frame = 0;

    const range = document.documentElement.scrollHeight - window.innerHeight;
    const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;

    bar.style.transform = `scaleX(${progress})`;
  };

  const schedule = () => {
    if (frame === 0) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}
