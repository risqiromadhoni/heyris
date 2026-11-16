import { describe, expect, it } from "vite-plus/test";

import { isSoftwareRenderer } from "./gl-program";

const SOFTWARE = [
  "Google SwiftShader",
  "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
  "llvmpipe (LLVM 15.0.7, 256 bits)",
  "Mesa softpipe",
  "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)",
] as const;

const HARDWARE = [
  "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)",
  "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 (0x00002484) Direct3D11 vs_5_0 ps_5_0, D3D11)",
  "Apple GPU",
  "Mali-G78",
  "WebKit WebGL",
] as const;

describe("software renderer check", () => {
  it.for(SOFTWARE)("refuses %s", (name) => {
    expect(isSoftwareRenderer(name)).toBe(true);
  });

  it.for(HARDWARE)("accepts %s", (name) => {
    expect(isSoftwareRenderer(name)).toBe(false);
  });
});
