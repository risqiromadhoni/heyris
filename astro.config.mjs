// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import { voidPlugin } from "void";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ configPath: "./.void-wrangler.jsonc" }),
  integrations: [UnoCSS()],
  markdown: {
    processor: satteri({ features: { attributes: true } }),
  },
  vite: { plugins: [voidPlugin()] },
});
