// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import UnoCSS from "unocss/astro";
import { voidPlugin } from "void";
import { DEFAULT_APP_SITE } from "./env.ts";
import { satteriOptions } from "./src/app/markdown/index.ts";

const site = process.env.VITE_APP_SITE || DEFAULT_APP_SITE;

export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  build: { format: "file" },
  adapter: cloudflare({ configPath: "./.void-wrangler.jsonc" }),
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Source Serif 4",
      cssVariable: "--font-source-serif",
      weights: ["200 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["serif"],
      options: { experimental: { variableAxis: { opsz: ["20"] } } },
    },
    {
      provider: fontProviders.google(),
      name: "DM Sans",
      cssVariable: "--font-dm-sans",
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "DM Mono",
      cssVariable: "--font-dm-mono",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
  integrations: [
    UnoCSS(),
    sitemap({
      i18n: {
        defaultLocale: "id",
        locales: { id: "id-ID", en: "en" },
      },
    }),
  ],
  markdown: {
    processor: satteri(satteriOptions),
    syntaxHighlight: false,
  },
  vite: { plugins: [voidPlugin()] },
});
