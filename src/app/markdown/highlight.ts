import { satteriCreateHighlightFn } from "@astrojs/markdown-satteri";

/**
 * GitHub Light Default and GitHub Dark Default in one pass. The older `github-dark` theme's
 * comments fail WCAG AA contrast (3:1) on its own background; these pass. With `defaultColor: false` every token carries only
 * `--shiki-light` and `--shiki-dark`, and `prose.css` picks one by the `dark` class on `<html>`.
 */
const highlighter = satteriCreateHighlightFn("shiki", {
  themes: { light: "github-light-default", dark: "github-dark-default" },
  defaultColor: false,
});

type HighlightFn = NonNullable<Awaited<typeof highlighter>>;

type HastNode = Awaited<ReturnType<HighlightFn>>;

type HastParent = Extract<HastNode, { type: "element" }>;

type HastChild = HastParent["children"][number];

/** The parts of a Shiki block the code plugin keeps: the tokenised `<code>` and the theme variables. */
export interface Highlighted {
  code: HastChild;
  style: string;
}

/** The fence's language, from the `language-*` class Sätteri gives `<code>`. */
export function fenceLanguage(names: readonly (string | number)[]): string {
  const name = names.map(String).find((entry) => entry.startsWith("language-"));

  return name === undefined ? "plaintext" : name.slice("language-".length);
}

// Only the `--shiki-*` declarations of Shiki's `<pre>` style: its `overflow-x` would override the
// figure's clipping, which `prose.css` owns.
function themeVariables(style: HastParent["properties"][string]): string {
  return String(style ?? "")
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.startsWith("--shiki-"))
    .join(";");
}

/** Highlight one block. Returns `undefined` when Shiki gives back no `<code>` to take over. */
export async function highlight(source: string, lang: string): Promise<Highlighted | undefined> {
  const run = await highlighter;
  const pre = run === undefined ? undefined : await run(source, lang);

  if (pre?.type !== "element") return undefined;

  const code = pre.children.find((child) => child.type === "element" && child.tagName === "code");

  return code === undefined ? undefined : { code, style: themeVariables(pre.properties.style) };
}
