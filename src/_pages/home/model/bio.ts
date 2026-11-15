import type { Locale } from "@/shared/i18n";

/**
 * The home bio in two lengths. Each entry is one paragraph. BioToggle turns every `SITE.email` in
 * the text into a mail link, so the address in the copy must match `SITE.email`.
 */
interface Bio {
  readonly short: readonly string[];
  readonly long: readonly string[];
}

/** Indonesian bio. */
const ID_BIO: Bio = {
  short: [
    "Saya bekerja di bidang perangkat lunak sejak 2016 dan sekarang menjadi Senior Fullstack Engineer jarak jauh di Dialog. Saya membangun frontend dan backend dengan TypeScript, React, Next.js, Nest.js, PHP, dan Laravel. Situs yang sedang Anda baca ini berjalan di Cloudflare Workers.",
    "Saya menulis di sini dalam bahasa Indonesia, dan setiap tulisan juga bisa dibaca dalam format Markdown. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi.romadhoni96@gmail.com.",
  ],
  long: [
    "Saya belajar pemrograman secara otodidak dan bekerja di bidang perangkat lunak sejak 2016. Sekarang saya Senior Fullstack Engineer di Dialog, perusahaan di Leiden, Belanda, yang membuat platform perangkat lunak untuk pelibatan pemangku kepentingan. Saya bekerja dari jarak jauh. Di sana saya membangun frontend dan backend dengan TypeScript, React, Nest.js, PHP, dan Laravel. Sebelumnya, sebagai Full Stack Engineer di Yummy Corp, saya membantu sistem pesanan Yummyshop melayani lebih dari 50.000 pedagang UKM. Setelah itu, sebagai Senior Software Engineer di sana, saya membangun layanan berbasis event dengan Nest.js dan RabbitMQ. Di luar kerja, saya berkebun dengan hidroponik dan akuaponik.",
    "Situs ini berjalan di Cloudflare Workers, dan saya membangunnya dengan target WCAG 2.2 AA. Situs ini tidak memasang cookie pelacak dan tidak memakai layanan analitik. Antarmuka situs tersedia dalam bahasa Indonesia dan Inggris. Tema gelap atau terang mengikuti sistem Anda, kecuali Anda memilih sendiri.",
    "Tulisan saya antara lain membahas Git, monorepo dengan Turborepo, serta cara kerja internet dan nameserver. Saya juga menulis tentang memindahkan domain ke Cloudflare, dan alasan engineer TypeScript belajar Rust serta WebAssembly. Catatan singkat berisi potongan kode dan hal yang baru saya pelajari. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi.romadhoni96@gmail.com.",
  ],
};

/** English bio, a translation of `ID_BIO` with the same paragraphs and claims. */
const EN_BIO: Bio = {
  short: [
    "I've worked in software since 2016 and I'm now a remote Senior Fullstack Engineer at Dialog. I build frontends and backends with TypeScript, React, Next.js, Nest.js, PHP, and Laravel. The site you're reading runs on Cloudflare Workers.",
    "I write here in Indonesian, and every post can also be read as Markdown. If you have a project or a question, email risqi.romadhoni96@gmail.com.",
  ],
  long: [
    "I taught myself to program and have worked in software since 2016. I'm now a Senior Fullstack Engineer at Dialog, a company in Leiden, the Netherlands, that makes a software platform for stakeholder engagement. I work remotely. There I build the frontend and the backend with TypeScript, React, Nest.js, PHP, and Laravel. Earlier, as a Full Stack Engineer at Yummy Corp, I helped the Yummyshop order system serve more than 50,000 SME merchants. Later, as a Senior Software Engineer there, I built event-driven services with Nest.js and RabbitMQ. Outside work, I garden with hydroponics and aquaponics.",
    "This site runs on Cloudflare Workers, and I built it with WCAG 2.2 AA as the target. It sets no tracking cookies and uses no analytics service. The interface is available in Indonesian and English. The dark or light theme follows your system setting, unless you pick one yourself.",
    "My writing covers topics such as Git, monorepos with Turborepo, and how the internet and nameservers work. I also write about moving a domain to Cloudflare, and why TypeScript engineers learn Rust and WebAssembly. Short notes hold code snippets and things I have recently learned. If you have a project or a question, email risqi.romadhoni96@gmail.com.",
  ],
};

/** Bio copy per locale. */
const BIO: Partial<Record<Locale, Bio>> = { id: ID_BIO, en: EN_BIO };

/** The bio for a locale. Until a locale has its own copy, it shows the Indonesian text. */
export function bioFor(locale: Locale): Bio {
  return BIO[locale] ?? ID_BIO;
}
