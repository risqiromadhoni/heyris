---
title: "Astro dan Void di Cloudflare Workers: cara situs ini dibangun"
summary: "Teknologi di balik situs ini, dari Astro 7 dan Void sampai tes dan CI."
date: 2026-11-14
updated: 2026-11-16
topic: astro
---

Situs ini memakai Astro 7 dan dikonfigurasi untuk Cloudflare Workers lewat Void. Void adalah alat untuk membangun dan men-deploy aplikasi full-stack dengan Vite. Tulisan ini mencatat susunan itu bagian demi bagian. Setiap bagian menyebut berkas yang mengaturnya.

## Mode server dan halaman statis

Saya memakai `output: "server"` karena deploy Void membutuhkan entry Worker dari Astro. Dalam mode ini, Astro [merender setiap halaman saat diminta](https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering), kecuali halaman itu memakai `prerender = true`.

Semua berkas di `src/pages` memakai `prerender = true`, kecuali endpoint redirect untuk URL lama. Saat build, Astro menulis hasil semua berkas itu sebagai berkas statis.

Endpoint redirect untuk URL lama tidak memakai prerender. Astro menjalankannya setiap kali alamat itu diminta.

## Konfigurasi Astro

Pengaturan utama ada di `astro.config.mjs`. Bagian font dan integrasi tidak saya tampilkan:

```js {title=astro.config.mjs}
export default defineConfig({
  site,
  output: "server",
  trailingSlash: "never",
  build: { format: "file" },
  redirects: oldSiteRedirects,
  adapter: cloudflare({ configPath: "./.void-wrangler.jsonc" }),
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: { prefixDefaultLocale: false },
  },
  // ...
  markdown: {
    processor: satteri(satteriOptions),
    syntaxHighlight: false,
  },
  vite: { plugins: [voidPlugin()] },
});
```

`defaultLocale` diisi `id`, jadi URL bahasa Indonesia tidak memakai awalan. Bahasa Inggris memakai awalan `/en`. Nilai `site` diambil dari `VITE_APP_SITE` saat build. Nilai bawaannya ada di `env.ts`.

## Void dan Cloudflare Workers

Plugin Void masuk ke Vite lewat `voidPlugin()`. `void.config.ts` mengatur Cloudflare, termasuk nama Worker, tanggal kompatibilitas, dan flag `nodejs_als`. Flag itu mengaktifkan AsyncLocalStorage. Dokumentasi Void memintanya untuk helper `void/*`. Kode di `src/` tidak memakai `void/db`, `void/kv`, atau `void/storage`.

Dokumentasi Void juga meminta Astro 7, karena Void membutuhkan Vite 8. Perintah deploy `pnpm void:deploy` menjalankan `void deploy --platform cloudflare`. Void membuat `.void-wrangler.jsonc`, dan berkas itu tidak masuk git.

## Gaya dengan UnoCSS

UnoCSS memakai `presetWind4` dengan reset bawaannya, jadi tidak perlu paket reset tambahan. `uno.config.ts` mengubah token warna dari `DESIGN.md` menjadi variabel `--lr-*`. Kelas seperti `text-lr-nav` memakai variabel itu. Kelas `dark` di elemen `html` mengaktifkan mode gelap.

UnoCSS juga memindai Markdown di `src/`. Kelas yang dipakai di dalam tulisan ikut dibuat.

## Tulisan sebagai Markdown

Setiap tulisan berupa berkas Markdown di `src/content/posts/id/`. Versi Inggrisnya, kalau ada, memakai slug yang sama di `src/content/posts/en/`. Skemanya ada di `src/content.config.ts`. Empat field ini wajib diisi: `title`, `summary`, `date`, dan `topic`. Nilai `topic` harus ada di `src/shared/api/content/topics.ts`.

Astro memproses Markdown lewat `@astrojs/markdown-satteri`, dengan fitur direktif. Direktif `:::nama` membuka blok seperti diagram dan checklist. Nama yang tidak ada dalam daftar di `src/app/markdown/directives.ts` melempar error saat Markdown diproses.

## Dua bahasa dan salinan Markdown

Bahasa Indonesia adalah bahasa bawaan. Versi Inggris ada di `/en/writing/`. Fungsi pembuat URL untuk tiap bahasa ada di `src/shared/i18n/routes.ts`.

Setiap tulisan juga punya salinan Markdown mentah, misalnya `/tulisan/situs-ini-astro-void-cloudflare-workers.md`. Berkas `/llms.txt` mendaftar semua salinan itu dalam format llmstxt.org.

## URL lama heyris.me

Konfigurasi situs ini mengalihkan alamat lama heyris.me ke alamat baru dengan status 301. Endpoint di `src/pages` mengalihkan alamat tulisan `/posts/<slug>` ke `/en/writing/<slug>`, dan `/id/posts/<slug>` ke `/tulisan/<slug>`. Opsi `redirects` di `astro.config.mjs` mengatur alamat halaman lain, seperti `/about`.

## Tes dan target Lighthouse

Vitest berjalan lewat `vp test`, dengan tiga proyek di `vite.config.ts`:

- `unit`: berkas `*.test.ts`, berjalan di Node.
- `browser`: berkas `*.browser.test.ts`, berjalan di Chromium headless.
- `types`: berkas `*.test-d.ts`, hanya memeriksa tipe lewat tsc.

Tes end-to-end memakai Playwright di folder `e2e/`. Pemindaian aksesibilitas memakai axe dan hanya mencakup tag WCAG 2.0, 2.1, dan 2.2 di tingkat A dan AA (`e2e/fixtures.ts`). Target situs adalah WCAG 2.2 tingkat AA.

Job Unlighthouse membangun situs, menyalakan `astro preview`, lalu memeriksa halaman dengan budget dari `unlighthouse.config.ts`. Budget berisi skor minimum per kategori. Job CI gagal kalau skor di bawah angka itu.

Berikut angkanya:

- Performa: skor minimum 90
- Aksesibilitas: skor minimum 100
- Praktik terbaik: skor minimum 100
- SEO: skor minimum 90

## CI dan riwayat commit

`.github/workflows` berisi enam alur: `check`, `test`, `playwright`, `unlighthouse`, `size`, dan `release`. Alur `check` berjalan di setiap push dan pull request ke `main`. Empat alur berikutnya hanya berjalan kalau berkas yang memengaruhinya berubah. Alur `release` membuat pull request rilis dan men-deploy ke Cloudflare. Alur `unlighthouse` juga bisa dijalankan manual lewat `workflow_dispatch`. Kalau input `site` diisi, job memindai situs yang sudah di-deploy, bukan hasil build lokal.

Riwayat commit dimulai 12 November 2026. Beberapa commit berikut, dari yang terbaru, menandai tahap pembangunannya:

:::commits
- 49fd2cc test: set up Vitest with unit, browser and type projects
- 77ec300 feat(i18n): add the english routes
- 5cb34c9 feat(markdown): render the design's content blocks from directives
- ed245d0 feat(ui): set up unocss with wind4, typography and design tokens
- c4ea45a ci: add check, playwright and unlighthouse workflows
- 35e91de feat(deploy): integrate void with cloudflare adapter
:::
