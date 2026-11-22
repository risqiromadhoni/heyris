import type { Font } from "opentype.js";

/** One run of text as CSS sets it: the face, its size, and the letter spacing. */
export interface TextStyle {
  face: Font;
  size: number;
  letterSpacing: number;
}

/** Width in CSS pixels. CSS letter spacing is added after every character, the last one included. */
function textWidth(style: TextStyle, text: string): number {
  const advance = style.face.getAdvanceWidth(text, style.size);

  return advance + style.letterSpacing * Array.from(text).length;
}

/** Height of the face's own ascent and descent, which `line-height: normal` would use. */
export function contentHeight(face: Font, size: number): number {
  return ((face.ascender - face.descender) / face.unitsPerEm) * size;
}

/**
 * The distance from the top of a line box to its baseline. The box is `lineHeight` tall, and the
 * leading is split evenly above and below the glyphs, as CSS does.
 */
export function baselineOffset(face: Font, size: number, lineHeight: number): number {
  const ascent = (face.ascender / face.unitsPerEm) * size;

  return (lineHeight - contentHeight(face, size)) / 2 + ascent;
}

/** The longest prefix of `text` that fits in `maxWidth`, always at least one character long. */
function fittingPrefix(style: TextStyle, text: string, maxWidth: number): string {
  const characters = Array.from(text);
  let count = 1;

  while (
    count < characters.length &&
    textWidth(style, characters.slice(0, count + 1).join("")) <= maxWidth
  ) {
    count += 1;
  }

  return characters.slice(0, count).join("");
}

/** `text` shortened so that it and a trailing ellipsis fit in `maxWidth`. */
function ellipsize(style: TextStyle, text: string, maxWidth: number): string {
  let characters = Array.from(text.trimEnd());

  while (characters.length > 0 && textWidth(style, `${characters.join("")}…`) > maxWidth) {
    characters = characters.slice(0, -1);
  }

  return `${characters.join("").trimEnd()}…`;
}

/**
 * Breaks text into lines no wider than `maxWidth`, at spaces. A word wider than a line is broken
 * between characters. Past `maxLines`, the text is cut and the last line ends in an ellipsis, the
 * same result as CSS line clamping.
 */
export function wrapText(
  style: TextStyle,
  text: string,
  maxWidth: number,
  maxLines: number,
): Array<string> {
  const lines: Array<string> = [];
  let line = "";

  for (const word of text.split(/\s+/).filter((part) => part !== "")) {
    const candidate = line === "" ? word : `${line} ${word}`;

    if (textWidth(style, candidate) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line !== "") lines.push(line);

    let rest = word;

    while (textWidth(style, rest) > maxWidth) {
      const piece = fittingPrefix(style, rest, maxWidth);

      lines.push(piece);
      rest = rest.slice(piece.length);
    }

    line = rest;
  }

  if (line !== "") lines.push(line);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const overflow = lines.slice(maxLines - 1).join(" ");

  kept[maxLines - 1] = ellipsize(style, overflow, maxWidth);

  return kept;
}
