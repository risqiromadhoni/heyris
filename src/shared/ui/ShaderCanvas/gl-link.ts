const VERTEX_SOURCE =
  "attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }";

/** The one member of the `KHR_parallel_shader_compile` extension object that is read here. */
interface ParallelShaderCompile {
  readonly COMPLETION_STATUS_KHR: GLenum;
}

/** The objects one link creates. */
interface Stages {
  readonly vertex: WebGLShader;
  readonly fragment: WebGLShader;
  readonly program: WebGLProgram;
}

/** Receives the linked program, or `null` when the link failed. Called once, in a later frame. */
export type LinkDone = (program: WebGLProgram | null) => void;

/** A link in progress. After `cancel`, its `LinkDone` is never called. */
export interface Link {
  readonly cancel: () => void;
}

function createStages(gl: WebGLRenderingContext): Stages | null {
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  const program = gl.createProgram();

  if (vertex && fragment && program) return { vertex, fragment, program };

  if (vertex) gl.deleteShader(vertex);

  if (fragment) gl.deleteShader(fragment);

  if (program) gl.deleteProgram(program);

  return null;
}

/** Delete both shaders, and the program unless it is `keep`. A shader attached to a program is freed with it. */
function freeStages(gl: WebGLRenderingContext, stages: Stages, keep: WebGLProgram | null): void {
  gl.deleteShader(stages.vertex);
  gl.deleteShader(stages.fragment);

  if (stages.program !== keep) gl.deleteProgram(stages.program);
}

function compileVertex(gl: WebGLRenderingContext, stages: Stages): void {
  gl.shaderSource(stages.vertex, VERTEX_SOURCE);
  gl.compileShader(stages.vertex);
}

function compileFragment(gl: WebGLRenderingContext, stages: Stages, source: string): void {
  gl.shaderSource(stages.fragment, source);
  gl.compileShader(stages.fragment);
}

function attachAndLink(gl: WebGLRenderingContext, stages: Stages): void {
  gl.attachShader(stages.program, stages.vertex);
  gl.attachShader(stages.program, stages.fragment);
  gl.linkProgram(stages.program);
}

/**
 * Compile the full-screen vertex stage with `fragmentSource` and link them, without one long main-thread
 * task.
 *
 * With `KHR_parallel_shader_compile`, both stages compile and the program links in one task. Then the
 * driver's `COMPLETION_STATUS_KHR` is polled once per frame, and `LINK_STATUS` is read only once it is true.
 * Without the extension, the same work runs in four frames: vertex compile, fragment compile, link, check.
 * No status is read before the work it reports on has finished, so no read waits for the driver.
 */
export function startLink(gl: WebGLRenderingContext, fragmentSource: string, done: LinkDone): Link {
  const ext: ParallelShaderCompile | null = gl.getExtension("KHR_parallel_shader_compile");
  let stages: Stages | null = null;
  let frame = 0;

  const later = (step: () => void) => {
    frame = requestAnimationFrame(() => {
      frame = 0;
      step();
    });
  };

  const release = (keep: WebGLProgram | null) => {
    if (stages) freeStages(gl, stages, keep);

    stages = null;
  };

  const finish = (linked: WebGLProgram | null) => {
    release(linked);
    done(linked);
  };

  const checkLink = (program: WebGLProgram) => {
    finish(gl.getProgramParameter(program, gl.LINK_STATUS) === true ? program : null);
  };

  const awaitParallel = (program: WebGLProgram, completion: GLenum) => {
    if (gl.getProgramParameter(program, completion) === true) checkLink(program);
    else later(() => awaitParallel(program, completion));
  };

  const runInFrames = (steps: readonly (() => void)[]) => {
    const [step, ...rest] = steps;

    if (!step) return;

    later(() => {
      step();
      runInFrames(rest);
    });
  };

  later(() => {
    const created = createStages(gl);

    if (!created) {
      finish(null);

      return;
    }

    stages = created;

    if (ext) {
      compileVertex(gl, created);
      compileFragment(gl, created, fragmentSource);
      attachAndLink(gl, created);
      later(() => awaitParallel(created.program, ext.COMPLETION_STATUS_KHR));
    } else {
      runInFrames([
        () => compileVertex(gl, created),
        () => compileFragment(gl, created, fragmentSource),
        () => attachAndLink(gl, created),
        () => checkLink(created.program),
      ]);
    }
  });

  return {
    cancel: () => {
      cancelAnimationFrame(frame);
      frame = 0;
      release(null);
    },
  };
}
