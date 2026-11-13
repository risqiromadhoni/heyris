import type { APIContext } from "astro";
import { rssFeed } from "@/app/feed/rss";
import { SITE } from "@/shared/config";

export const prerender = true;

/** RSS 2.0 feed of the published Indonesian posts and notes. */
export async function GET(context: APIContext) {
  return rssFeed("id", context.site ?? new URL(SITE.url));
}
