import type { Locale } from "@/shared/i18n";

/** The home bio in two lengths. Each entry is one paragraph. */
interface Bio {
  readonly short: readonly string[];
  readonly long: readonly string[];
}

/** Indonesian bio. The short text is the design's; the long text is the draft from the spec's open items. */
const ID_BIO: Bio = {
  short: [
    "Saya software engineer dan penulis. Saya membangun situs web yang ringan, tanpa pelacak, dan sesuai WCAG 2.2 AA. Kodenya TypeScript dengan Effect, jalan di Cloudflare Workers. Situs yang sedang Anda baca ini contohnya.",
    "Saya menulis catatan teknis dalam bahasa Indonesia, dan setiap tulisan punya versi Markdown untuk dibaca manusia maupun AI. Kalau Anda punya proyek, pertanyaan, atau sekadar ingin menyapa, kirim surel ke halo@heyris.me.",
  ],
  long: [
    "Saya software engineer dan penulis. Saya membangun situs web yang ringan, tanpa pelacak, dan sesuai WCAG 2.2 AA: kontras teks yang cukup, fokus keyboard yang selalu terlihat, target sentuh yang cukup besar, dan gerak yang berkurang bila diminta. Kodenya TypeScript dengan Effect, jalan di Cloudflare Workers. Situs yang sedang Anda baca ini contohnya.",
    "Situs ini tidak memasang cookie pelacak dan tidak memuat skrip pihak ketiga, jadi tidak perlu banner persetujuan. Halamannya tersedia dalam bahasa Indonesia dan Inggris, dan tema gelap atau terang mengikuti pilihan Anda.",
    "Saya menulis catatan teknis dalam bahasa Indonesia tentang Effect, Cloudflare Workers, aksesibilitas, privasi, dan performa web, dan setiap tulisan punya versi Markdown untuk dibaca manusia maupun AI. Kalau Anda punya proyek, pertanyaan, atau sekadar ingin menyapa, kirim surel ke halo@heyris.me.",
  ],
};

/** English bio, a translation of `ID_BIO` with the same paragraphs and claims. */
const EN_BIO: Bio = {
  short: [
    "I am a software engineer and writer. I build websites that are lightweight, free of trackers and meet WCAG 2.2 AA. My code is TypeScript with Effect, running on Cloudflare Workers. The site you are reading is an example.",
    "I write technical articles in Indonesian, and every post has a Markdown version for people and AI to read. If you have a project, a question, or just want to say hello, send an email to halo@heyris.me.",
  ],
  long: [
    "I am a software engineer and writer. I build websites that are lightweight, free of trackers and meet WCAG 2.2 AA: enough text contrast, a keyboard focus that is always visible, touch targets large enough, and motion that is reduced when requested. My code is TypeScript with Effect, running on Cloudflare Workers. The site you are reading is an example.",
    "This site sets no tracking cookies and loads no third-party scripts, so it needs no consent banner. Its pages are available in Indonesian and English, and the dark or light theme follows your choice.",
    "I write technical articles in Indonesian about Effect, Cloudflare Workers, accessibility, privacy and web performance, and every post has a Markdown version for people and AI to read. If you have a project, a question, or just want to say hello, send an email to halo@heyris.me.",
  ],
};

/** Bio copy per locale. */
const BIO: Partial<Record<Locale, Bio>> = { id: ID_BIO, en: EN_BIO };

/** The bio for a locale. Until a locale has its own copy, it shows the Indonesian text. */
export function bioFor(locale: Locale): Bio {
  return BIO[locale] ?? ID_BIO;
}
