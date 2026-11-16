import { satteriHeadingIdsPlugin, type SatteriProcessorOptions } from "@astrojs/markdown-satteri";

import { altTextRule } from "./alt-text";
import { codeBlocks } from "./code";
import { directiveBlocks } from "./directives";
import { footnoteLabels } from "./footnotes";
import { headingAnchors } from "./headings";
import { externalLinks } from "./links";
import { localeOf } from "./source";
import { tableFrames } from "./tables";

/**
 * Options for `satteri({...})` in `astro.config.mjs`. Every plugin is a factory, so it sees the
 * file being compiled (`ctx.fileURL`) and picks the file's locale.
 *
 * The heading-id plugin runs before the anchors because it assigns the ids the anchors link to.
 * Astro appends its own heading-id plugin after these, and that one leaves existing ids alone.
 */
export const satteriOptions = {
  features: { attributes: true, directive: true },
  mdastPlugins: [
    (ctx) => directiveBlocks(ctx.fileURL),
    (ctx) => tableFrames(ctx.fileURL),
    (ctx) => altTextRule(ctx.fileURL),
  ],
  hastPlugins: [
    satteriHeadingIdsPlugin(),
    (ctx) => footnoteLabels(localeOf(ctx.fileURL)),
    (ctx) => codeBlocks(localeOf(ctx.fileURL)),
    (ctx) => headingAnchors(localeOf(ctx.fileURL)),
    (ctx) => externalLinks(localeOf(ctx.fileURL)),
  ],
} satisfies SatteriProcessorOptions;
