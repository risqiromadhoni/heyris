import { OG_IMAGE } from "@/shared/config";
import type { CardFont, CardFonts } from "./fonts";
import { baselineOffset, contentHeight, wrapText } from "./layout";

/** The text printed on one card. */
export interface OgCardContent {
  /** The page's own title, set large and clamped to three lines. */
  title: string;
  /** The site name at the top of the card. */
  siteName: string;
  /** The small line at the bottom: the date and section, or the home page's host. */
  meta: string;
}

/** One line of card text: where it sits, and how it is set. */
interface Run {
  font: CardFont;
  size: number;
  letterSpacing: number;
  color: string;
  x: number;
  y: number;
  value: string;
}

/**
 * Light tokens, mirrored from the light column of `COLOR_TOKENS` in `uno.config.ts`. Change both
 * together.
 */
const COLORS = { bg: "#FFFFFF", heading: "#282828", nav: "#676767" };

const PADDING = 72;

/** Card text is 1.5 times the size of the same style on the page (docs/design-implementation.md). */
const SCALE = 1.5;

/** The `type-site`, `type-display` and `type-meta` styles, at card scale. */
const SITE_SIZE = 19.2 * SCALE;
const TITLE_SIZE = 42.4 * SCALE;
const TITLE_TRACKING = -0.85 * SCALE;
const TITLE_LINE_HEIGHT = 1.15;
const TITLE_MAX_LINES = 3;
const META_SIZE = 13 * SCALE;

/** Space between the title's last line and the meta line. */
const TITLE_GAP = 20;

/** The XML escape for one character that cannot appear raw in an element's text. */
function escapeChar(char: string): string {
  switch (char) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&apos;";
    default:
      return char;
  }
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, escapeChar);

/** One `<text>` element. Its baseline is `y`, and its family and weight come from the font. */
function textElement(run: Run): string {
  const attributes = [
    `x="${run.x}"`,
    `y="${run.y}"`,
    `font-family="${run.font.family}"`,
    `font-weight="${run.font.weight}"`,
    `font-size="${run.size}"`,
    `letter-spacing="${run.letterSpacing}"`,
    `fill="${run.color}"`,
  ];

  return `<text ${attributes.join(" ")}>${escapeXml(run.value)}</text>`;
}

/**
 * The card as an SVG document, 1200 × 630. The site name sits at the top, the title's last line
 * stands above the meta line at the bottom, and the title wraps to three lines at most.
 */
export function cardSvg(content: OgCardContent, fonts: CardFonts): string {
  const { width, height } = OG_IMAGE;
  const contentWidth = width - 2 * PADDING;
  const { serif, sans } = fonts;

  const siteBaseline =
    PADDING + baselineOffset(serif.face, SITE_SIZE, contentHeight(serif.face, SITE_SIZE));

  const metaHeight = contentHeight(sans.face, META_SIZE);
  const metaTop = height - PADDING - metaHeight;
  const metaBaseline = metaTop + baselineOffset(sans.face, META_SIZE, metaHeight);

  const lineHeight = TITLE_LINE_HEIGHT * TITLE_SIZE;

  const lines = wrapText(
    { face: serif.face, size: TITLE_SIZE, letterSpacing: TITLE_TRACKING },
    content.title,
    contentWidth,
    TITLE_MAX_LINES,
  );

  const titleTop = metaTop - TITLE_GAP - lines.length * lineHeight;
  const titleOffset = baselineOffset(serif.face, TITLE_SIZE, lineHeight);

  const title = lines.map((line, index): Run => ({
    font: serif,
    size: TITLE_SIZE,
    letterSpacing: TITLE_TRACKING,
    color: COLORS.heading,
    x: PADDING,
    y: titleTop + index * lineHeight + titleOffset,
    value: line,
  }));

  const runs: Array<Run> = [
    {
      font: serif,
      size: SITE_SIZE,
      letterSpacing: 0,
      color: COLORS.heading,
      x: PADDING,
      y: siteBaseline,
      value: content.siteName,
    },
    ...title,
    {
      font: sans,
      size: META_SIZE,
      letterSpacing: 0,
      color: COLORS.nav,
      x: PADDING,
      y: metaBaseline,
      value: content.meta,
    },
  ];

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${COLORS.bg}"/>`,
    ...runs.map(textElement),
    "</svg>",
  ].join("");
}
