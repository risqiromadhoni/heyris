/** Lowercase and without accents, so a search for "aksesibilitas" finds "Aksesibilitas" and "Akséssibilitas" alike. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
