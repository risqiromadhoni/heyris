import { SITE } from "@/shared/config";

/** Value of the `ref` query parameter added to company links, so their analytics can see the source. */
const REF = "heyris.me";

/** Companies the bio links to, by the name the copy uses for each. */
const COMPANIES = new Map([
  ["Dialog", "https://www.getdialog.io"],
  ["Yummy Corp", "https://www.yummycorp.com"],
  ["Virtual Spirit", "https://virtualspirit.me"],
  ["Jatiteknologi", "https://jatiteknologi.com"],
]);

/** One run of a bio paragraph: plain text, the contact address, or a company name with its link. */
export type BioSegment =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "mail"; readonly text: string; readonly href: string }
  | { readonly kind: "company"; readonly text: string; readonly href: string };

const escape = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TOKEN = new RegExp(`\\b(${[SITE.email, ...COMPANIES.keys()].map(escape).join("|")})\\b`, "u");

function withRef(href: string): string {
  const url = new URL(href);
  url.searchParams.set("ref", REF);

  return url.href;
}

function segmentFor(part: string): BioSegment {
  if (part === SITE.email) return { kind: "mail", text: part, href: `mailto:${part}` };

  const company = COMPANIES.get(part);

  if (company !== undefined) return { kind: "company", text: part, href: withRef(company) };

  return { kind: "text", text: part };
}

/**
 * Splits a bio paragraph so the contact address becomes a mail link and each company name a link
 * to the company's site with `?ref=heyris.me`. Names match whole words only, so "Yummyshop" stays text.
 */
export function bioSegments(paragraph: string): Array<BioSegment> {
  // `split` with a capture group keeps each match as its own part.
  return paragraph
    .split(TOKEN)
    .filter((part) => part !== "")
    .map(segmentFor);
}
