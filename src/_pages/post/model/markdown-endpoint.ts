import type { APIRoute } from "astro";
import { entrySlug, getPost, getPosts } from "@/shared/api/content";
import type { Locale } from "@/shared/i18n";
import { postDocument } from "./document";

/**
 * The static paths and `GET` handler of a post's `.md` route in one locale. A route file re-exports
 * both. A locale with no entries gets no paths, so its route builds to nothing until one is added.
 */
export function postMarkdownEndpoint(locale: Locale) {
  const getStaticPaths = async () => {
    const posts = await getPosts(locale);

    return posts.map((entry) => ({ params: { slug: entrySlug(entry.id) } }));
  };

  const GET: APIRoute = async ({ params }) => {
    const slug = params.slug;
    const entry = slug === undefined ? undefined : await getPost(locale, slug);

    if (entry === undefined) return new Response("Not found", { status: 404 });

    return new Response(postDocument(entry), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  };

  return { getStaticPaths, GET };
}
