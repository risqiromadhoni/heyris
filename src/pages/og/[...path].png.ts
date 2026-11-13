import type { APIRoute } from "astro";
import { ogCards } from "@/shared/api/content";
import { ogImagePath } from "@/shared/i18n";
import { renderOgCard } from "@/shared/lib/og-image";

export const prerender = true;

/** The rest parameter of a card's image: `/og/tulisan/slug.png` gives `tulisan/slug`. */
const paramOf = (imagePath: string) => imagePath.slice("/og/".length, -".png".length);

export async function getStaticPaths() {
  const cards = await ogCards();

  return cards.map((card) => ({ params: { path: paramOf(ogImagePath(card.path)) } }));
}

export const GET: APIRoute = async ({ params }) => {
  const imagePath = `/og/${params.path ?? ""}.png`;
  const card = (await ogCards()).find((candidate) => ogImagePath(candidate.path) === imagePath);

  if (card === undefined) return new Response("Not found", { status: 404 });

  return new Response(await renderOgCard(card.content), {
    headers: { "Content-Type": "image/png" },
  });
};
