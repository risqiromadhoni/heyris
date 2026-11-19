import type { Locale } from "@/shared/i18n";

/**
 * The home bio in two lengths. Each entry is one paragraph. `bioSegments` turns every `SITE.email`
 * into a mail link and each company name into a link, so both must match `bio-links.ts` exactly.
 *
 * The shape follows leerob.com: the short bio says who the author is, where they work now and
 * before, then a goal, a personal line and a contact hook. The long bio is a first-person story in
 * time order. Every fact comes from the author; add none they have not confirmed.
 */
interface Bio {
  readonly short: readonly string[];
  readonly long: readonly string[];
}

/** Indonesian bio. */
const ID_BIO: Bio = {
  short: [
    "Saya software engineer dan penulis. Saya bekerja di Dialog sebagai Senior Fullstack Engineer jarak jauh, tempat saya membangun frontend dan backend dengan TypeScript, React, Nest.js, PHP, dan Laravel. Sebelumnya, saya bekerja di Virtual Spirit dan Yummy Corp. Saya belajar pemrograman secara otodidak, bekerja di bidang perangkat lunak sejak 2016, dan menulis di blog ini sejak 2024.",
    "Tujuan saya adalah menjadi pemimpin yang tetap mampu membangun perangkat lunak, dan memberi pengaruh baik bagi tim dan orang di sekitar saya. Di luar kerja, saya senang menanam dengan hidroponik. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi@heyris.me.",
  ],
  long: [
    "Saya tumbuh di sebuah desa di Kabupaten Kediri, Jawa Timur. Orang tua saya bertani dan beternak sapi, dan setiap hari saya membantu pekerjaan mereka.",
    "Sejak kecil saya dirundung, jadi teman saya adalah video game, dari Nintendo sampai PlayStation. Orang tua saya baru punya uang setiap panen, sekitar tiga bulan sekali, jadi game baru berarti menunggu lama.",
    "Nintendo dan ponsel Sony Ericsson dengan tombol analog membuat saya ingin tahu cara game dibuat.",
    "Saat SMA, saya memenangkan lomba robotik di ITS Surabaya. Guru saya juga selalu meminta bantuan saya untuk memasang Windows dan aplikasi lain.",
    "Saya tidak bisa melanjutkan kuliah di Universitas Jember karena keluarga saya bangkrut. Saya lalu bekerja lepas sebagai sopir truk air mineral di Surabaya, dan belajar pemrograman sendiri.",
    "Pada 2016, saya mendapat pekerjaan kantor pertama di sebuah perusahaan IT di Jakarta Selatan.",
    "Di Yummy Corp, saya bekerja sebagai Full Stack Engineer dan membantu sistem pesanan Yummyshop melayani lebih dari 50.000 pedagang UKM. Setelah itu, sebagai Senior Software Engineer di sana, saya membangun layanan berbasis event dengan Nest.js dan RabbitMQ.",
    "Dari Januari 2024 sampai Februari 2026, saya bekerja di Virtual Spirit sebagai Senior Frontend Engineer. Di sana saya mengembangkan Medplanner, aplikasi medis untuk pemerintah Malaysia.",
    "Sekarang saya Senior Fullstack Engineer di Dialog, perusahaan di Leiden, Belanda, yang membuat platform perangkat lunak untuk pelibatan pemangku kepentingan. Saya bekerja dari jarak jauh. Di sana saya membangun frontend dan backend dengan TypeScript, React, Nest.js, PHP, dan Laravel.",
    "Di luar kerja, saya senang menanam dengan hidroponik. Dalam beberapa tahun ke depan, saya ingin menjadi pemimpin yang tetap mampu membangun perangkat lunak, dan memberi pengaruh baik bagi tim dan orang di sekitar saya.",
    "Situs ini berjalan di Cloudflare Workers, dan saya membangunnya dengan target WCAG 2.2 AA. Situs ini tidak memasang cookie pelacak dan tidak memakai layanan analitik. Antarmuka situs tersedia dalam bahasa Indonesia dan Inggris. Tema gelap atau terang mengikuti sistem Anda, kecuali Anda memilih sendiri.",
    "Tulisan saya antara lain membahas Git, monorepo dengan Turborepo, serta cara kerja internet dan nameserver. Saya juga menulis tentang memindahkan domain ke Cloudflare, dan alasan engineer TypeScript belajar Rust serta WebAssembly. Catatan singkat berisi potongan kode dan hal yang baru saya pelajari. Kalau Anda punya proyek atau pertanyaan, kirim email ke risqi@heyris.me.",
  ],
};

/** English bio, a translation of `ID_BIO` with the same paragraphs and claims. */
const EN_BIO: Bio = {
  short: [
    "I'm a software engineer and writer. I work at Dialog as a remote Senior Fullstack Engineer, where I build frontends and backends with TypeScript, React, Nest.js, PHP, and Laravel. Before that, I worked at Virtual Spirit and Yummy Corp. I taught myself to code, have worked in software since 2016, and have written on this blog since 2024.",
    "My goal is to be a leader who can still build software, and to have a positive effect on my team and the people around me. Outside work, I love growing plants with hydroponics. If you have a project or a question, email risqi@heyris.me.",
  ],
  long: [
    "I grew up in a village in Kediri Regency, East Java. My parents farmed and raised cattle, and every day I helped them with their work.",
    "I was bullied as a kid, so video games were my friends, from Nintendo to PlayStation. My parents only had money after each harvest, about every three months, so a new game meant a long wait.",
    "A Nintendo and a Sony Ericsson phone with an analog stick made me want to know how games are made.",
    "In high school, I won a robotics competition at ITS Surabaya. My teacher also always asked me for help installing Windows and other apps.",
    "I couldn't continue my studies at Universitas Jember because my family went bankrupt. I then worked freelance as a mineral water truck driver in Surabaya, and taught myself to code.",
    "In 2016, I got my first office job, at an IT company in South Jakarta.",
    "At Yummy Corp, I worked as a Full Stack Engineer and helped the Yummyshop order system serve more than 50,000 SME merchants. Later, as a Senior Software Engineer there, I built event-driven services with Nest.js and RabbitMQ.",
    "From January 2024 to February 2026, I worked at Virtual Spirit as a Senior Frontend Engineer. There I developed Medplanner, a medical app for the Malaysian government.",
    "I'm now a Senior Fullstack Engineer at Dialog, a company in Leiden, the Netherlands, that makes a software platform for stakeholder engagement. I work remotely. There I build the frontend and the backend with TypeScript, React, Nest.js, PHP, and Laravel.",
    "Outside work, I love growing plants with hydroponics. In the next few years, I want to become a leader who can still build software, and to have a positive effect on my team and the people around me.",
    "This site runs on Cloudflare Workers, and I built it with WCAG 2.2 AA as the target. It sets no tracking cookies and uses no analytics service. The interface is available in Indonesian and English. The dark or light theme follows your system setting, unless you pick one yourself.",
    "My writing covers topics such as Git, monorepos with Turborepo, and how the internet and nameservers work. I also write about moving a domain to Cloudflare, and why TypeScript engineers learn Rust and WebAssembly. Short notes hold code snippets and things I have recently learned. If you have a project or a question, email risqi@heyris.me.",
  ],
};

/** Bio copy per locale. */
const BIO: Partial<Record<Locale, Bio>> = { id: ID_BIO, en: EN_BIO };

/** The bio for a locale. Until a locale has its own copy, it shows the Indonesian text. */
export function bioFor(locale: Locale): Bio {
  return BIO[locale] ?? ID_BIO;
}
