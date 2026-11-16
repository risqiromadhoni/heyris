import type { Topic } from "@/shared/api/content/topics";

const topics: Record<Topic, string> = {
  git: "Git",
  monorepo: "Monorepo",
  networking: "Jaringan",
  rust: "Rust",
  astro: "Astro",
  react: "React",
  ruby: "Ruby",
  api: "API",
  cloudflare: "Cloudflare",
  ci: "CI",
  web: "Web",
};

/**
 * Indonesian interface strings, the design's own text. `en.ts` must have exactly these keys.
 * Placeholders in the spec's copy table are arguments of small functions.
 */
export const id = {
  meta: {
    siteTitle: "Risqi Romadhoni",
    title: (page: string) => `${page} · Risqi Romadhoni`,
    homeDescription:
      "Situs pribadi @risqiromadhoni, software engineer sejak 2016. Berisi tulisan teknis tentang Git, TypeScript, dan cara kerja internet, serta catatan singkat.",
  },
  nav: {
    label: "Navigasi utama",
    home: "Beranda",
    writing: "Tulisan",
    notes: "Catatan",
  },
  lang: {
    current: "(bahasa aktif)",
  },
  home: {
    contactLabel: "Kontak Risqi",
    contactEmail: "Email",
    contactSubject: "Halo Risqi",
    contactBody: "Halo Risqi,\n\nSaya menemukan website kamu dan ingin menyapa. 👋",
    bio: "Bio",
    bioShort: "Singkat",
    bioLong: "Panjang",
    notes: "Catatan",
    writing: "Tulisan",
    seeAll: "Lihat semua",
  },
  theme: {
    toDark: "Beralih ke mode gelap",
    toLight: "Beralih ke mode terang",
  },
  writing: {
    title: "Tulisan",
    intro:
      "Tulisan teknis tentang Git, monorepo, cara kerja internet, Cloudflare, dan Rust. Saya menulis dalam bahasa Indonesia, lalu menerjemahkannya ke bahasa Inggris.",
    count: (n: number) => `${n} tulisan`,
    newest: "Terbaru",
  },
  notes: {
    title: "Catatan",
    intro:
      "Catatan singkat tentang hal yang saya pelajari dan alat yang saya pakai. Catatan lebih pendek dari tulisan, biasanya berisi satu ide dan satu contoh kode.",
    count: (n: number) => `${n} catatan`,
    pinned: "Disematkan",
  },
  filter: {
    all: "Semua",
    topics: "Topik",
    search: "Cari tulisan",
    results: {
      writing: (n: number) => `${n} tulisan ditemukan`,
      notes: (n: number) => `${n} catatan ditemukan`,
    },
  },
  topics,
  readingTime: (n: number) => `${n} mnt baca`,
  footer: {
    markdown: (link: string) => `Semua tulisan juga tersedia sebagai ${link} untuk AI.`,
    rss: "RSS",
  },
  article: {
    backWriting: "Tulisan",
    backNotes: "Catatan",
  },
  toc: {
    label: "Daftar isi",
    close: "Tutup daftar isi",
  },
  history: {
    label: "Riwayat pembaruan",
    published: "Terbit",
    updated: "Diperbarui",
  },
  copy: {
    page: "Salin Halaman",
    copied: "Tersalin",
    failed: "Gagal menyalin",
    menu: "Opsi lain",
    viewMarkdown: "Lihat sebagai Markdown",
    openIn: (service: string) => `Buka di ${service}`,
    prompt: (url: string) => `Baca ${url} supaya saya bisa bertanya tentang isinya.`,
  },
  code: {
    copy: "Salin",
  },
  note: {
    tldr: "Singkatnya",
    related: "Catatan lainnya",
    previous: "Sebelumnya",
    next: "Berikutnya",
  },
  feedback: {
    prompt: "Ada yang keliru?",
    link: "Kabari saya",
    subject: (title: string) => `Koreksi: ${title}`,
  },
  heading: {
    anchor: "Tautan ke bagian ini",
  },
  link: {
    newTab: "(buka di tab baru)",
  },
  og: {
    imageAlt: (title: string) => `Kartu berjudul “${title}” dari heyris`,
  },
  footnotes: "Catatan kaki",
  footnote: {
    back: (n: number) => `Kembali ke referensi ${n}`,
  },
  carousel: {
    label: "Galeri",
    previous: "Sebelumnya",
    next: "Berikutnya",
  },
  table: {
    label: "Tabel, bisa digulir",
  },
  skipLink: "Langsung ke konten",
  notFound: {
    title: "Halaman tidak ditemukan",
    body: "Halaman yang Anda cari tidak ada atau sudah dipindahkan.",
  },
  offline: {
    title: "Anda sedang offline",
    body: "Halaman ini belum bisa dimuat karena perangkat Anda tidak terhubung ke internet. Periksa koneksi, lalu coba lagi.",
    retry: "Coba lagi",
  },
};

export type Dictionary = typeof id;
