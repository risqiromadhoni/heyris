// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import { voidPlugin } from "void";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ configPath: "./.void-wrangler.jsonc" }),
  vite: { plugins: [voidPlugin()] },
});
