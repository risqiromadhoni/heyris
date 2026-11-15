import type { Locale } from "@/shared/i18n";

/**
 * The home bio in two lengths. Each entry is one paragraph. BioToggle turns every `SITE.email` in
 * the text into a mail link, so the address in the copy must match `SITE.email`.
 *
 * The shape follows leerob.com: the short bio says who the author is, where they work now and
 * before, then a goal, a personal line and a contact hook. The long bio is a first-person story in
 * time order. `[isi: ...]` (id) and `[fill in: ...]` (en) mark facts the author still has to write.
 * Replace every one before deploying: `grep -nE "\[(isi|fill in):" src/_pages/home/model/bio.ts`.
 */
interface Bio {
  readonly short: readonly string[];
  readonly long: readonly string[];
}

/** Indonesian bio. */
const ID_BIO: Bio = {
  short: [
    "Saya software engineer dan penulis. Saya bekerja di Dialog sebagai Senior Fullstack Engineer jarak jauh, tempat saya membangun frontend dan backend dengan TypeScript, React, Nest.js, PHP, dan Laravel. Sebelumnya, saya bekerja di Virtual Spirit dan Yummy Corp. Saya bekerja di bidang perangkat lunak sejak 2016 dan menulis di blog ini sejak 2024.",
    "Tujuan saya adalah [isi: satu kalimat tentang tujuan kerja atau hidup]. [isi: satu kalimat tentang keluarga atau hal pribadi]. Di luar kerja, saya berkebun dengan hidroponik dan akuaponik. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi.romadhoni96@gmail.com.",
  ],
  long: [
    "[isi: satu kalimat pembuka tentang siapa atau apa yang membuat saya menjadi engineer].",
    "Saya tumbuh di [isi: kota atau daerah]. [isi: satu atau dua kalimat tentang kenangan masa kecil yang membuat saya tertarik pada teknologi].",
    "Saya belajar pemrograman secara otodidak. [isi: cara saya belajar, misalnya sekolah, kuliah, forum, atau tutorial online]. Pekerjaan pertama saya di bidang perangkat lunak dimulai pada 2016.",
    "Di Yummy Corp, saya bekerja sebagai Full Stack Engineer dan membantu sistem pesanan Yummyshop melayani lebih dari 50.000 pedagang UKM. Setelah itu, sebagai Senior Software Engineer di sana, saya membangun layanan berbasis event dengan Nest.js dan RabbitMQ.",
    "Dari Januari 2024 sampai Februari 2026, saya bekerja di Virtual Spirit. [isi: peran dan hal utama yang saya kerjakan di sana].",
    "Sekarang saya Senior Fullstack Engineer di Dialog, perusahaan di Leiden, Belanda, yang membuat platform perangkat lunak untuk pelibatan pemangku kepentingan. Saya bekerja dari jarak jauh. Di sana saya membangun frontend dan backend dengan TypeScript, React, Nest.js, PHP, dan Laravel.",
    "[isi: satu atau dua kalimat tentang keluarga atau peristiwa pribadi yang ingin saya ceritakan]. Di luar kerja, saya berkebun dengan hidroponik dan akuaponik.",
    "[isi: satu atau dua kalimat tentang hal yang ingin saya capai dalam beberapa tahun ke depan].",
    "[isi: kalimat penutup, misalnya ucapan terima kasih kepada orang yang membantu perjalanan saya].",
    "Situs ini berjalan di Cloudflare Workers, dan saya membangunnya dengan target WCAG 2.2 AA. Situs ini tidak memasang cookie pelacak dan tidak memakai layanan analitik. Antarmuka situs tersedia dalam bahasa Indonesia dan Inggris. Tema gelap atau terang mengikuti sistem Anda, kecuali Anda memilih sendiri.",
    "Tulisan saya antara lain membahas Git, monorepo dengan Turborepo, serta cara kerja internet dan nameserver. Saya juga menulis tentang memindahkan domain ke Cloudflare, dan alasan engineer TypeScript belajar Rust serta WebAssembly. Catatan singkat berisi potongan kode dan hal yang baru saya pelajari. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi.romadhoni96@gmail.com.",
  ],
};

/** English bio, a translation of `ID_BIO` with the same paragraphs and claims. */
const EN_BIO: Bio = {
  short: [
    "I'm a software engineer and writer. I work at Dialog as a remote Senior Fullstack Engineer, where I build frontends and backends with TypeScript, React, Nest.js, PHP, and Laravel. Before that, I worked at Virtual Spirit and Yummy Corp. I've worked in software since 2016 and have written on this blog since 2024.",
    "My goal is [fill in: one sentence about the goal of my work or life]. [fill in: one sentence about family or something personal]. Outside work, I garden with hydroponics and aquaponics. If you have a project or a question, email risqi.romadhoni96@gmail.com.",
  ],
  long: [
    "[fill in: one opening sentence about who or what made me an engineer].",
    "I grew up in [fill in: city or region]. [fill in: one or two sentences about a childhood memory that sparked my interest in technology].",
    "I taught myself to program. [fill in: how I learned, such as school, university, forums, or online tutorials]. My first job in software started in 2016.",
    "At Yummy Corp, I worked as a Full Stack Engineer and helped the Yummyshop order system serve more than 50,000 SME merchants. Later, as a Senior Software Engineer there, I built event-driven services with Nest.js and RabbitMQ.",
    "From January 2024 to February 2026, I worked at Virtual Spirit. [fill in: my role and the main things I worked on there].",
    "I'm now a Senior Fullstack Engineer at Dialog, a company in Leiden, the Netherlands, that makes a software platform for stakeholder engagement. I work remotely. There I build the frontend and the backend with TypeScript, React, Nest.js, PHP, and Laravel.",
    "[fill in: one or two sentences about family or a personal event I want to tell]. Outside work, I garden with hydroponics and aquaponics.",
    "[fill in: one or two sentences about what I want to achieve in the next few years].",
    "[fill in: a closing sentence, such as thanks to the people who helped along the way].",
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
