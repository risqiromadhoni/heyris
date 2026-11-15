import extractorMdc from "@unocss/extractor-mdc";
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerVariantGroup,
} from "unocss";
import type { Theme } from "unocss/preset-wind4";

/**
 * Colour tokens from DESIGN.md. Each becomes a `--lr-<token>` custom property that swaps when
 * `<html>` has the `dark` class, and a theme colour such as `text-lr-nav` or `border-lr-line`.
 */
const COLOR_TOKENS = {
  bg: { light: "#FFFFFF", dark: "#1B1A19" },
  text: { light: "#282828", dark: "#E8E5DF" },
  heading: { light: "#282828", dark: "#F4F1EB" },
  nav: { light: "#676767", dark: "#AAA59E" },
  line: { light: "#2828281A", dark: "#E8E5DF2E" },
  surface: { light: "#F3F3F2", dark: "#242321" },
  bullet: { light: "#676767B3", dark: "#AAA59EB3" },
  underline: { light: "#6767674D", dark: "#AAA59E4D" },
} as const;

type ColorToken = keyof typeof COLOR_TOKENS;

type ColorMode = "light" | "dark";

/**
 * Each stack starts with the variable the Astro fonts API generates (`fonts` in
 * astro.config.mjs), then the fallbacks the design already used.
 */
const FONT_FAMILIES = {
  serif: "var(--font-source-serif), ui-serif, Georgia, serif",
  sans: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-dm-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

/**
 * The 14 text styles from `docs/design-implementation.md`, "Tokens and type scale". Sizes are px.
 */
const TYPE_SHORTCUTS = {
  "type-display":
    "font-serif text-[42.4px] leading-[1.15] font-semibold tracking-[-0.85px] text-lr-heading",
  "type-article":
    "font-serif text-[30px] leading-[1.1] font-semibold tracking-[-0.6px] text-lr-heading",
  "type-h2":
    "font-serif text-[23.2px] leading-[1.4] font-semibold tracking-[-0.46px] text-lr-heading",
  "type-site":
    "font-serif text-[19.2px] leading-[normal] font-semibold tracking-[0px] text-lr-heading",
  "type-row": "font-serif text-[20px] leading-[1.4] font-semibold tracking-[0px] text-lr-heading",
  "type-card": "font-serif text-[19px] leading-[1.35] font-semibold tracking-[0px] text-lr-heading",
  "type-related":
    "font-serif text-[16px] leading-[1.4] font-semibold tracking-[0px] text-lr-heading",
  "type-body": "font-serif text-[17px] leading-[1.6] font-normal tracking-[0px] text-lr-text",
  "type-link": "font-serif text-[17px] leading-[1.06] font-normal tracking-[0px] text-lr-nav",
  "type-ui": "font-sans text-[14px] leading-[normal] font-normal tracking-[0px] text-lr-nav",
  "type-meta": "font-sans text-[13px] leading-[normal] font-normal tracking-[0px] text-lr-nav",
  "type-tag": "font-sans text-[12.5px] leading-[normal] font-normal tracking-[0.4px] text-lr-nav",
  "type-code": "font-mono text-[15.3px] leading-[1.78] font-normal tracking-[0px] text-lr-heading",
  "type-pre": "font-mono text-[13.5px] leading-[1.65] font-normal tracking-[0px] text-lr-text",
};

/** Unwraps the default export of an icon set's JSON module. */
const loadIcons = <T>(icons: Promise<{ default: T }>) => icons.then((module) => module.default);

const tokenVariables = (mode: ColorMode) =>
  Object.entries(COLOR_TOKENS)
    .map(([token, values]) => `--lr-${token}:${values[mode]};`)
    .join("");

const proseColor = (token: ColorToken) => {
  const value = `var(--lr-${token})`;

  return [value, value];
};

export default defineConfig<Theme>({
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetTypography({
      colorScheme: {
        body: proseColor("text"),
        headings: proseColor("heading"),
        lead: proseColor("nav"),
        links: proseColor("nav"),
        bold: proseColor("heading"),
        counters: proseColor("bullet"),
        bullets: proseColor("bullet"),
        hr: proseColor("line"),
        quotes: proseColor("text"),
        "quote-borders": proseColor("line"),
        captions: proseColor("nav"),
        kbd: proseColor("heading"),
        "kbd-shadows": proseColor("line"),
        code: proseColor("heading"),
        "pre-code": proseColor("text"),
        "pre-bg": proseColor("surface"),
        "th-borders": proseColor("line"),
        "td-borders": proseColor("line"),
      },
      cssExtend: {
        a: { "text-decoration-thickness": "1px" },
        "a:not(:hover)": { "text-decoration-color": "var(--lr-underline)" },
        "a:hover": { "text-decoration-color": "var(--lr-nav)" },
        kbd: { "box-shadow": "0 0 0 1px var(--lr-line)" },
      },
    }),
    presetIcons({
      collections: {
        ph: () => loadIcons(import("@iconify-json/ph/icons.json", { with: { type: "json" } })),
        lucide: () =>
          loadIcons(import("@iconify-json/lucide/icons.json", { with: { type: "json" } })),
        "simple-icons": () =>
          loadIcons(import("@iconify-json/simple-icons/icons.json", { with: { type: "json" } })),
      },
    }),
  ],
  extractors: [extractorMdc()],
  transformers: [transformerVariantGroup()],
  content: {
    filesystem: ["src/**/*.{md,mdc,markdown}", "src/app/markdown/**/*.ts"],
  },
  // Icons the Markdown plugins emit at build time. The extractor finds them through the glob above;
  // listing them keeps them generated even if a plugin file is renamed or moved.
  safelist: [
    "i-ph-copy",
    "i-ph-git-commit",
    "i-ph-check-circle",
    "i-ph-caret-down",
    "i-ph-caret-left",
    "i-ph-caret-right",
    "i-lucide-arrow-up-right",
    "sr-only",
  ],
  theme: {
    colors: {
      lr: Object.fromEntries(
        Object.keys(COLOR_TOKENS).map((token) => [token, `var(--lr-${token})`]),
      ),
    },
    font: FONT_FAMILIES,
  },
  shortcuts: TYPE_SHORTCUTS,
  preflights: [
    {
      getCSS: () =>
        `:root{color-scheme:light;${tokenVariables("light")}}.dark{color-scheme:dark;${tokenVariables("dark")}}`,
    },
  ],
});
