import dayHaze from "../../../../designs/shaders/day-haze.glsl?raw";
import dayLight from "../../../../designs/shaders/day-light.glsl?raw";
import nightSky from "../../../../designs/shaders/night-sky.glsl?raw";

export type SceneName = "backdrop" | "panel";

export interface Shader {
  readonly source: string;
  readonly floats: Readonly<Record<string, number>>;
  readonly colors: Readonly<Record<string, string>>;
}

interface Scene {
  readonly light: Shader;
  readonly dark?: Shader;
}

// WebGL does not apply the GLSL `@default` values, so every uniform a scene uses is set here.
const SCENES: Readonly<Record<SceneName, Scene>> = {
  backdrop: {
    light: {
      source: dayHaze,
      floats: { u_haze: 0.85, u_grain: 0.7, u_cursor: 0.35, u_speed: 0.25 },
      colors: { u_warm: "#FFD9A0", u_cool: "#C4D8FF", u_ink: "#282828" },
    },
    dark: {
      source: nightSky,
      floats: { u_haze: 1, u_stars: 1, u_grain: 1, u_cursor: 0.35, u_speed: 0.25 },
      colors: {
        u_moon: "#D6E0FF",
        u_aurora_a: "#6F7CFF",
        u_aurora_b: "#4FC8B4",
        u_star: "#F3EDDC",
        u_ink: "#E8E5DF",
      },
    },
  },
  panel: {
    light: {
      source: dayLight,
      floats: { u_rays: 0.8, u_dust: 0.55, u_speed: 0.5 },
      colors: { u_light: "#FFE9B8" },
    },
  },
};

/** The shader a scene draws in a theme. `undefined` means the scene draws nothing in that theme. */
export function activeShader(scene: SceneName, dark: boolean): Shader | undefined {
  const entry = SCENES[scene];

  return dark ? entry.dark : entry.light;
}

/**
 * Width of the column night-sky keeps free of stars. From 1024 px it follows the centred 1440 px
 * layout; below that the whole width is the column.
 */
export function quietZone(width: number): number {
  return width >= 1024 ? Math.max(0, (width - 1440) / 2) + 720 : width;
}
