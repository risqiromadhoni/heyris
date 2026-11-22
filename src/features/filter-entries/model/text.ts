/** Lowercase and without accents, so a search for "aksesibilitas" finds "Aksesibilitas" and "Aksésibilitas" alike. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
