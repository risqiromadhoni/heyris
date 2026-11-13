import { parse, type Font } from "opentype.js";

/** Family names the card's fonts are drawn under. They match the site's Astro font families. */
const FONT_FAMILY = { serif: "Source Serif 4", sans: "DM Sans" } as const;

/** A card font: its family and weight, its TrueType bytes, and the parsed face used to measure text. */
export interface CardFont {
  family: string;
  weight: 400 | 600;
  data: ArrayBuffer;
  face: Font;
}

/** The two faces a card uses. */
export interface CardFonts {
  serif: CardFont;
  sans: CardFont;
}

interface FontSpec {
  family: string;
  weight: 400 | 600;
  /** The Google Fonts `family` query, with the axis values that pick one static instance. */
  query: string;
}

/**
 * Source Serif 4 at optical size 20 (the site pins the same axis) and DM Sans at its default
 * optical size, which the site also renders at.
 */
const SPECS: Record<keyof CardFonts, FontSpec> = {
  serif: { family: FONT_FAMILY.serif, weight: 600, query: "Source+Serif+4:opsz,wght@20,600" },
  sans: { family: FONT_FAMILY.sans, weight: 400, query: "DM+Sans:wght@400" },
};

/**
 * Google Fonts answers this legacy Android user agent with TrueType. Modern agents get WOFF2,
 * which resvg does not read here.
 */
const TRUETYPE_AGENT =
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

const TRUETYPE_URL = /src: url\((https:[^)]+)\) format\('truetype'\)/;

async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);

  if (!response.ok) throw new Error(`Font request failed with ${response.status}: ${url}`);

  return response;
}

async function fetchFont(spec: FontSpec): Promise<CardFont> {
  const css = await fetchOk(`https://fonts.googleapis.com/css2?family=${spec.query}&display=swap`, {
    headers: { "User-Agent": TRUETYPE_AGENT },
  });

  const url = TRUETYPE_URL.exec(await css.text())?.[1];

  if (url === undefined) throw new Error(`Google Fonts sent no TrueType file for ${spec.family}.`);

  const data = await (await fetchOk(url)).arrayBuffer();

  return { family: spec.family, weight: spec.weight, data, face: parse(data) };
}

let loaded: Promise<CardFonts> | undefined;

/**
 * The card fonts, fetched and parsed once per process and then reused for every card. A failed
 * fetch clears the cache, so the next render tries again.
 */
export function loadCardFonts(): Promise<CardFonts> {
  if (loaded === undefined) {
    const attempt = Promise.all([fetchFont(SPECS.serif), fetchFont(SPECS.sans)]).then(
      ([serif, sans]) => ({ serif, sans }),
    );

    loaded = attempt;
    void attempt.catch(() => {
      loaded = undefined;
    });
  }

  return loaded;
}
