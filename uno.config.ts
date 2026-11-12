import extractorMdc from "@unocss/extractor-mdc";
import { defineConfig, presetTypography, presetWind4, transformerVariantGroup } from "unocss";
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

const FONT_FAMILIES = {
  serif: '"Source Serif 4", ui-serif, Georgia, serif',
  sans: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

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
        links: proseColor("text"),
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
        "a:not(:hover)": { "text-decoration-color": "var(--lr-underline)" },
        kbd: { "box-shadow": "0 0 0 1px var(--lr-line)" },
      },
    }),
  ],
  extractors: [extractorMdc()],
  transformers: [transformerVariantGroup()],
  content: {
    filesystem: ["src/**/*.{md,mdc,markdown}"],
  },
  theme: {
    colors: {
      lr: Object.fromEntries(
        Object.keys(COLOR_TOKENS).map((token) => [token, `var(--lr-${token})`]),
      ),
    },
    font: FONT_FAMILIES,
  },
  preflights: [
    {
      getCSS: () =>
        `:root{color-scheme:light;${tokenVariables("light")}}.dark{color-scheme:dark;${tokenVariables("dark")}}`,
    },
  ],
});
