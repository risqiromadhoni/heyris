---
title: "Situs pribadi di Cloudflare Workers dengan vinext"
summary: "Memindahkan situs pribadi ke Workers: apa yang jalan, apa yang tidak, dan kenapa saya tetap memakainya."
date: 2026-10
topic: cloudflare
---

Situs yang sedang Anda baca ini berjalan di Cloudflare Workers. Saya membangunnya ulang dengan vinext untuk menggantikan situs lama.

Saya ingin tahu seberapa jauh vinext bisa dibawa tanpa layanan pihak ketiga[^1]. Hasilnya cukup jauh. Semua kebutuhan infrastruktur saya penuhi dengan binding Cloudflare.

Konfigurasi Worker, binding, dan tanggal kompatibilitas ada di `cloudflare.config.ts`. Tidak ada berkas wrangler, jadi berkas itu adalah sumber kebenarannya. Kodenya TypeScript dengan [Effect](https://effect.website).

Beberapa hal yang menurut saya berjalan baik:

1. Server Component sebagai bawaan, JavaScript klien hanya untuk tema dan tombol salin
2. Dua bahasa, Indonesia dan Inggris, lewat segmen rute lang
3. Setiap tulisan juga tersedia sebagai Markdown mentah
4. Tanpa pelacak, dengan header keamanan dan CSP

Ini tampilan salah satu halamannya. Alih-alih angka performa, halaman utama menampilkan Markdown-nya sendiri, dan tombol Salin Halaman menyalinnya.

:::figure{.wide}
::::window{address="heyris.me/tulisan/situs-pribadi-cloudflare-workers-vinext.md"}
```md {.line-numbers}
---
title: Situs pribadi di Cloudflare Workers dengan vinext
date: 2026-10
lang: id-ID
---

Situs yang sedang Anda baca ini berjalan di Cloudflare Workers.

## Mencari batas vinext di Workers

Di tulisan sebelumnya saya membahas alasan memilih Workers.
```
::::

:::

Bahasa bisa diganti kapan saja, dan tema gelap atau terang mengikuti pilihan Anda. Tidak ada cookie yang dipasang.

## Mencari batas vinext di Workers

Di [tulisan sebelumnya](/tulisan) saya membahas alasan memilih Workers. Kali ini saya mencari titik di mana vinext mulai tersendat. Tiga yang rawan:

1. Runtime Workers berbeda dari Node.js, jadi pustaka yang bergantung pada API Node saya periksa satu per satu
2. vinext meniru App Router, tetapi tidak semua API Next.js tersedia
3. Plugin Vite Cloudflare hanya menerima tanggal kompatibilitas tertentu

Setelah batas-batas itu jelas, sisanya berjalan mulus. Rute, server action, dan metadata bekerja seperti yang saya harapkan.

## Perencanaan, pembangunan, refaktor

Rencana awal saya tulis sebagai berkas Markdown di repositori. Saya memecahnya menjadi tahap kecil dan mengerjakannya satu per satu.

:::figure-pair
::::window{address="arsitektur.md"}
:::::diagram
- Peramban: heyris.me/id
- Worker aplikasi: vinext, Server Components, CSP
- Worker penyimpan respons: binding Cloudflare, dirilis terpisah
:::::

::::

::::window{address="struktur-proyek.txt"}
```text
app/
  [lang]/
    page.tsx
    blog/[slug]/page.tsx
  sitemap.ts
  robots.ts
proxy.ts
cloudflare.config.ts
```
::::

:::

Beberapa commit pertama mengatur fondasi: aturan lint, tooling Effect v4, dan pedoman proyek. Ini daftar commit awalnya.

:::commits
- 62328b5 feat: add React Best Practices skill for performance optimization
- 519307b feat: update dependencies to include oxc-transform-react v0.152.0
- 87582ad feat: create design configuration file with initial layout settings
- aca15c0 chore: add anti-slop oxlint rules and Effect v4 tooling
- bdd303f docs: enhance CLAUDE.md with standards for accessibility, security, privacy, SEO, and internationalization
- fb8bd74 feat: add initial design configuration file for layout and dimensions
- 89a4e99 docs: update CLAUDE.md with site details and infrastructure requirements
- 74cf3ac chore: initial commit
:::

Karena lint dan pemeriksaan tipe selalu dijalankan, refaktor menjadi murah. `vp check` cukup untuk memastikan tidak ada yang rusak.

## Tolok ukur dan perbandingan

Saya memeriksa situs ini dengan daftar yang sama untuk kedua bahasa, lalu membandingkannya dengan situs lama[^2].

:::figure{.wide}
::::carousel
:::::window{address="heyris.me/catatan/checklist-rilis-workers#aksesibilitas"}
::::::checklist
- Kontras teks: minimal 4,5 : 1
- Fokus keyboard: selalu terlihat
- Target sentuh: minimal 24 px
- Lewati ke konten: tersedia
- Gerak berkurang: dihormati
::::::

:::::

:::::window{address="heyris.me/catatan/checklist-rilis-workers"}
::::::checklist
- Aksesibilitas: WCAG 2.2 AA
- Privasi: tanpa cookie pelacak
- SEO: canonical, hreflang, sitemap
- Keamanan: CSP dan header keamanan lain
- Konten: Markdown untuk tiap tulisan
::::::

:::::

:::::window{address="heyris.me/catatan/checklist-rilis-workers#privasi"}
::::::checklist
- Cookie pelacak: tidak ada
- Skrip pihak ketiga: tidak ada
- Analitik: Cloudflare, tanpa cookie
- Banner persetujuan: tidak diperlukan
- Kepatuhan: GDPR
::::::

:::::
::::
:::

1. **Aksesibilitas.** Kontras, fokus keyboard, dan target sentuh mengikuti WCAG 2.2 AA, saya periksa di tema terang dan gelap.
2. **Privasi.** Tidak ada cookie pelacak dan skrip pihak ketiga, jadi situs ini tidak membutuhkan banner persetujuan.
3. **Performa.** Server Component dan CSS menjaga JavaScript klien tetap kecil. Hanya tema dan tombol salin yang interaktif.

## Produk lebih penting dari sebelumnya

Menulis kode bukan lagi hambatan utama. Yang tersisa adalah memutuskan apa yang layak dibangun. Saya harus menjawab:

- **Q: Bahasa apa saja yang didukung?**
  - **A:** Indonesia sebagai bawaan dan Inggris sebagai bahasa kedua. Semua teks dan metadata tersedia di keduanya.
- **Q: Perlu pelacak atau analitik?**
  - **A:** Tidak. Situs ini tanpa pelacak dan tanpa cookie, jadi tidak ada banner persetujuan yang perlu ditampilkan.
- **Q: Di mana data dan penyimpanan ditempatkan?**
  - **A:** Di Cloudflare, sebagai binding pada konfigurasi Worker. Saya tidak memakai layanan pihak ketiga.
- **Q: Satu Worker atau dua?**
  - **A:** Dua. Penyimpan respons dirilis terpisah, hanya saat paketnya atau konfigurasinya berubah.

Keputusan seperti inilah yang membuat sebuah situs terasa utuh, dan sampai sekarang saya masih mengambilnya sendiri.

## Kesimpulan

Saya belajar banyak tentang vinext dan Workers. Yang terpenting, membangun situs sendiri tetap menyenangkan. Apakah saya berharap orang memakai kodenya? Tidak juga[^3]. Situs ini cukup untuk saya.

Kalau Anda ingin menempuh jalur yang sama, mulailah dari [dokumentasi vinext](https://vinext.dev/) dan [Cloudflare Workers](https://developers.cloudflare.com/workers/). Setiap tulisan di sini juga bisa disalin sebagai Markdown dan diberikan ke asisten AI Anda.

[^1]: vinext tidak memasang paket next yang asli. Impor next diarahkan ke shim vinext, jadi setiap API Next.js saya cek dulu keberadaannya di dalam vinext.

[^2]: Saya sengaja tidak menampilkan angka skor di sini. Tujuannya mencatat apa yang diperiksa, bukan memamerkan hasil. Kalau ada yang tidak sesuai, beri tahu saya.

[^3]: Situs ini tidak mungkin ada tanpa banyak proyek sumber terbuka, seperti Vite, Effect, dan Tailwind. Saya hanya menyusunnya menjadi satu situs.
