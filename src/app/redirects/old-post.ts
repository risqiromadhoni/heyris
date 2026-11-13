import type { APIRoute } from "astro";
import { localizedPath, type Locale } from "@/shared/i18n";

/**
 * Permanent redirect from a post URL of the previous heyris.me to the same slug in a locale.
 * It is an endpoint, not an `astro.config.mjs` redirect: the adapter writes config redirects
 * to `_redirects` with a `.html` target, which costs a second hop.
 */
export function oldPostRedirect(locale: Locale): APIRoute {
  return ({ params, redirect }) => redirect(localizedPath(locale, "post", params.slug ?? ""), 301);
}
