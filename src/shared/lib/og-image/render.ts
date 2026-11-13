import { initWasm, Resvg } from "@resvg/resvg-wasm";
import rasteriserModule from "@resvg/resvg-wasm/index_bg.wasm?module";
import { cardSvg, type OgCardContent } from "./card";
import { loadCardFonts } from "./fonts";

let rasteriserReady: Promise<void> | undefined;

/**
 * Compiles resvg from the bundled wasm module, once per process. workerd refuses to compile wasm
 * from bytes, so the module import is the route that works. A second `initWasm` call throws.
 */
function startRasteriser(): Promise<void> {
  rasteriserReady ??= initWasm(rasteriserModule);

  return rasteriserReady;
}

/**
 * One Open Graph card as PNG bytes, 1200 × 630. The card is laid out as SVG and resvg draws its
 * text with the card's own fonts. Runs in workerd during prerender.
 */
export async function renderOgCard(content: OgCardContent): Promise<Uint8Array<ArrayBuffer>> {
  const [fonts] = await Promise.all([loadCardFonts(), startRasteriser()]);

  const renderer = new Resvg(cardSvg(content, fonts), {
    font: {
      fontBuffers: [new Uint8Array(fonts.serif.data), new Uint8Array(fonts.sans.data)],
      loadSystemFonts: false,
    },
  });

  try {
    const image = renderer.render();

    try {
      // A copy, so the bytes sit in an ArrayBuffer that a Response body accepts.
      return new Uint8Array(image.asPng());
    } finally {
      image.free();
    }
  } finally {
    renderer.free();
  }
}
