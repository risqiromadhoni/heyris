import type { SceneName } from "./scenes";
import { runShader } from "./shader-runner";

const IDLE_TIMEOUT_MS = 1000;
const FALLBACK_DELAY_MS = 200;

/** The backdrop starts first, so the panel's compile begins only once the backdrop's program is ready. */
const SCENE_ORDER: readonly SceneName[] = ["backdrop", "panel"];

interface ShaderJob {
  readonly canvas: HTMLCanvasElement;
  readonly scene: SceneName;
}

function isSceneName(value: string | undefined): value is SceneName {
  return value === "backdrop" || value === "panel";
}

/** Run `task` after the first paint, then in idle time. */
function whenIdle(task: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
      } else {
        setTimeout(task, FALLBACK_DELAY_MS);
      }
    });
  });
}

/** Run the jobs in turn: each starts once the one before it has its program, or knows it has none. */
function startNext(jobs: readonly ShaderJob[]): void {
  const [job, ...rest] = jobs;

  if (!job) return;

  runShader(job.canvas, job.scene, () => startNext(rest));
}

/** Start every `canvas[data-shader-scene]` on the page, once, after the first paint, one at a time. */
export function mountShaderCanvases(): void {
  const canvases = document.querySelectorAll("canvas[data-shader-scene]");

  whenIdle(() => {
    const jobs: ShaderJob[] = [];

    canvases.forEach((element) => {
      if (!(element instanceof HTMLCanvasElement)) return;

      const scene = element.dataset.shaderScene;

      if (isSceneName(scene)) jobs.push({ canvas: element, scene });
    });

    jobs.sort((a, b) => SCENE_ORDER.indexOf(a.scene) - SCENE_ORDER.indexOf(b.scene));
    startNext(jobs);
  });
}
