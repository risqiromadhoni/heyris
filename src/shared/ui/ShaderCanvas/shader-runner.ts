import { startLink, type Link } from "./gl-link";
import {
  frameUniforms,
  openHardwareContext,
  setUniforms,
  TRIANGLE_VERTICES,
  type FrameUniforms,
} from "./gl-program";
import { activeShader, quietZone, type SceneName, type Shader } from "./scenes";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

interface Active {
  readonly program: WebGLProgram;
  readonly uniforms: FrameUniforms;
}

/**
 * Run one canvas: its WebGL context, the program for the current theme, the render loop and the
 * observers. Frames are scheduled only through `request`. `settled` runs once the first program is
 * drawn, or once it is known there is none. A theme change links in the background, and the previous
 * program keeps drawing until the new one is ready.
 */
export function runShader(canvas: HTMLCanvasElement, scene: SceneName, settled: () => void): void {
  const gl = openHardwareContext(canvas);

  if (!gl) {
    settled();

    return;
  }

  const root = document.documentElement;
  const still = matchMedia(REDUCED_MOTION);
  const pointer = { x: 0, y: 0, live: false };
  const buffer = gl.createBuffer();
  let active: Active | null = null;
  let linking: Link | null = null;
  let frame = 0;
  let dark = root.classList.contains("dark");
  let waiting: (() => void) | null = settled;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE_VERTICES, gl.STATIC_DRAW);

  const cancel = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const settle = () => {
    const callback = waiting;

    waiting = null;
    callback?.();
  };

  const looping = () => !still.matches && !document.hidden;

  const render = (now: number) => {
    frame = 0;

    const current = active;

    if (!current) return;

    // Rendered at CSS-pixel size: the shaders' constants (halo, star cells, grain) are authored in CSS px.
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    const box = canvas.getBoundingClientRect();
    const { uniforms } = current;

    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, still.matches ? 0 : now / 1000);
    gl.uniform2f(
      uniforms.mouse,
      pointer.live ? pointer.x - box.left : 0,
      pointer.live ? box.bottom - pointer.y : 0,
    );
    gl.uniform1f(uniforms.quiet, quietZone(width));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (looping()) frame = requestAnimationFrame(render);
  };

  const request = () => {
    cancel();

    if (active && !document.hidden) frame = requestAnimationFrame(render);
  };

  // The scene draws nothing in this theme, or its link failed: stop drawing and blank the canvas.
  const clear = () => {
    cancel();

    if (active) gl.deleteProgram(active.program);

    active = null;
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  // Swap in a linked program. The previous one stops here, so the canvas is never blank in between.
  const adopt = (program: WebGLProgram, shader: Shader) => {
    const previous = active;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const position = gl.getAttribLocation(program, "a_position");

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    setUniforms(gl, program, shader);
    active = { program, uniforms: frameUniforms(gl, program) };

    if (previous) gl.deleteProgram(previous.program);

    request();
  };

  const build = () => {
    linking?.cancel();
    linking = null;

    const shader = activeShader(scene, dark);

    if (!shader) {
      clear();
      settle();

      return;
    }

    linking = startLink(gl, shader.source, (program) => {
      linking = null;

      if (program) adopt(program, shader);
      else clear();

      settle();
    });
  };

  const onTheme = () => {
    const next = root.classList.contains("dark");

    if (next === dark) return;

    dark = next;
    build();
  };

  const onVisibility = () => {
    if (document.hidden) cancel();
    else request();
  };

  const move = (event: PointerEvent) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.live = true;
  };

  const resize = new ResizeObserver(request);
  const theme = new MutationObserver(onTheme);

  resize.observe(canvas);
  theme.observe(root, { attributeFilter: ["class"] });
  still.addEventListener("change", request);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", move, { passive: true });

  build();
}
