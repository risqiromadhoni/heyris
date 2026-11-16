---
title: "A WebGL backdrop drawn by the CPU lowers the Lighthouse score"
summary: "A WebGL backdrop is cheap on a GPU but costly on a CPU. Lighthouse's default throttling gave a score of 98, and devtools throttling gave 63."
date: 2026-11-16
topic: web
---

The WebGL backdrop on this site is cheap on a computer with a GPU. On a computer without one, Lighthouse recorded about 42 seconds of work for the backdrop's file. Lighthouse's default throttling gave a score of 98 on the deployed site, while devtools throttling gave 63 on a local copy. The two runs are not fully comparable, and the reason is below. This post covers how I found the problem and what I changed.

## The backdrop is drawn with WebGL

The page background is a WebGL shader in `src/shared/ui/ShaderCanvas/`. The shader redraws on every frame. Drawing stops when the visitor asks for reduced motion, or when the tab is hidden.

With a GPU, that work is small. Without one, the browser draws the shader on the CPU. That work runs on the main thread, where the page also runs. The page looks fast, but the main thread stays busy.

## What I saw in PageSpeed Insights

On November 16, 2026, PageSpeed Insights gave this site a score of 64. Its Total Blocking Time was 7,850 ms. CLAUDE.md records the same score. I could not repeat the measurement, because the PageSpeed API quota had run out.

## How I measured

I ran Lighthouse 13.6.0 with the desktop preset. Chrome 157 ran in headless mode on my Mac. Every number in this post comes from one run, not an average. According to CLAUDE.md, Lighthouse scores can drop 10 to 25 points on a busy machine.

Lighthouse offers two throttling methods. The default, simulated, estimates the page from one load. The devtools method applies throttling in a real browser. The [Lighthouse throttling docs](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) explain the difference.

## Two methods, two results

The table lists seven runs. The first row uses the deployed site. Rows marked "before the fix" use a local build of `main`. A "flag only" row uses a variant I was still working on, and the rest use the code after the fix.

| Run                                    | Throttling          | Score     | Backdrop file time |
| -------------------------------------- | ------------------- | --------- | ------------------ |
| Deployed site, no GPU                  | Simulated (default) | 98        | 6,859 ms           |
| Local, before the fix, no GPU          | Devtools, CPU 1x    | 63        | 42,526 ms          |
| Local, before the fix, no GPU          | Devtools, CPU 2x    | No score  | 44,570 ms          |
| Local, flag only, no GPU               | Devtools, CPU 1x    | 63        | 44,564 ms          |
| Local, after the fix, no GPU           | Devtools, CPU 1x    | 100       | No entry           |
| Local, after the fix, no GPU           | Devtools, CPU 2x    | 100       | No entry           |
| Local, after the fix, with GPU         | Devtools, CPU 1x    | 100       | 400 ms             |

The backdrop file time is the total browser time for the backdrop's script file, from the bootup-time audit in the Lighthouse report. "No entry" means the file did not appear in the report.

On the deployed site, simulated throttling gave a score of 98 and a TBT of 130 ms. In the local copy, devtools gave a score of 63 and a TBT of 1,360 ms. The two rows are not fully comparable. I did not run devtools with 1x CPU on the deployed site.

At 2x CPU slowdown, Lighthouse gave no score. It reported that the page took too long to load. The page never went quiet long enough to measure.

## Where the time went

In the local copy before the fix, the backdrop file took 42,526 ms. Of that, 174 ms was JavaScript. I have not broken down the rest. The pattern fits a shader drawn on the CPU.

## Why the flag alone was not enough

The `failIfMajorPerformanceCaveat` option asks the browser to refuse a WebGL context when there is no GPU or the performance is low. The [MDN reference for getContext](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) describes the option. My first fix used only that option.

The flag-only variant still ran the backdrop. Its score was 63, and the backdrop file took 44,564 ms. I opened Chrome with `--use-angle=swiftshader` and `--enable-unsafe-swiftshader`. CLAUDE.md records the same behavior: Chrome honours the flag only when software GL is its fallback, not when SwiftShader is requested explicitly.

## A fix with two checks

The `openHardwareContext` function now runs two checks. The first checks the flag. The second reads the renderer name.

:::diagram
- Check 1: the browser refuses a context without a GPU
- Check 2: the renderer name points to software GL
- Result: the WebGL context is used, or the backdrop is skipped
:::

:::figure
::::window{address="src/shared/ui/ShaderCanvas/gl-program.ts"}
```ts {title=src/shared/ui/ShaderCanvas/gl-program.ts}
export function openHardwareContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const gl = canvas.getContext("webgl", { antialias: false, failIfMajorPerformanceCaveat: true });

  if (!gl || !isSoftwareRenderer(rendererName(gl))) return gl;

  gl.getExtension("WEBGL_lose_context")?.loseContext();

  return null;
}
```
::::
:::

If the second check finds software GL, the function releases the context with `WEBGL_lose_context` and returns `null`. The page then renders without the backdrop.

The renderer name is not always easy to read. Chrome reports the generic name `WebKit WebGL`. The real name is in the [WEBGL_debug_renderer_info extension](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info). The code reads that extension when the generic name is `WebKit WebGL`. The `SOFTWARE_RENDERER` regex matches SwiftShader, llvmpipe, softpipe, software, and basic render.

The unit tests in `gl-program.test.ts` check five software names and five hardware names. They test name matching only and do not start a browser. When I ran them, all ten tests passed.

The fix came in through [PR #6](https://github.com/risqiromadhoni/heyris/pull/6), and its tests through [PR #10](https://github.com/risqiromadhoni/heyris/pull/10):

:::commits
- c03b772 perf(shader): skip the WebGL backdrop on software renderers (#6)
- 6f5dbf6 test(shader): cover the software renderer check (#10)
:::

## Results and limits

With both checks, the score is 100 at 1x and 2x CPU slowdown, with no GPU. Main-thread work totals 202 ms at 1x and 226 ms at 2x, and the backdrop file does not appear in the report. On a computer with a GPU, the backdrop still shows, and its file takes 400 ms.

The fix has a cost: visitors without a GPU do not see the backdrop. The page works without it, as CLAUDE.md notes. The commit message for the fix also records that Unlighthouse on GitHub's runners timed out while waiting for the main thread to go idle.

The numbers here come from one machine and one run each. A new measurement on another machine may give different numbers.
