import { dictionaryFor, type Locale } from "../../shared/i18n";

/** The strings the Markdown plugins emit, for one locale. */
export interface MarkdownStrings {
  copyCode: string;
  copied: string;
  headingAnchor: string;
  newTab: string;
  footnotes: string;
  footnoteBack: (n: number) => string;
  carousel: { label: string; previous: string; next: string };
}

/** Localized text for code copy buttons, heading anchors, external links, footnotes and carousels. */
export function markdownStrings(locale: Locale): MarkdownStrings {
  const dictionary = dictionaryFor(locale);

  return {
    copyCode: dictionary.code.copy,
    copied: dictionary.copy.copied,
    headingAnchor: dictionary.heading.anchor,
    newTab: dictionary.link.newTab,
    footnotes: dictionary.footnotes,
    footnoteBack: dictionary.footnote.back,
    carousel: dictionary.carousel,
  };
}
