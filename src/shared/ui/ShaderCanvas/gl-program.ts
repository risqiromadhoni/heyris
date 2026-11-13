import type { Shader } from "./scenes";

/** Vertices of one triangle that covers the whole clip space. */
export const TRIANGLE_VERTICES = new Float32Array([-1, -1, 3, -1, -1, 3]);

export interface FrameUniforms {
  readonly resolution: WebGLUniformLocation | null;
  readonly time: WebGLUniformLocation | null;
  readonly mouse: WebGLUniformLocation | null;
  readonly quiet: WebGLUniformLocation | null;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const channel = (offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;

  return [channel(1), channel(3), channel(5)];
}

/** Set a shader's constant uniforms. The program must already be in use. */
export function setUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  shader: Shader,
): void {
  for (const [name, value] of Object.entries(shader.floats)) {
    gl.uniform1f(gl.getUniformLocation(program, name), value);
  }

  for (const [name, hex] of Object.entries(shader.colors)) {
    gl.uniform3fv(gl.getUniformLocation(program, name), hexToRgb(hex));
  }
}

/** Locate the per-frame uniforms. A scene that does not declare one gets `null`, which WebGL ignores. */
export function frameUniforms(gl: WebGLRenderingContext, program: WebGLProgram): FrameUniforms {
  return {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    quiet: gl.getUniformLocation(program, "u_quiet"),
  };
}
