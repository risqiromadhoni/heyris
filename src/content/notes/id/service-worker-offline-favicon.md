---
title: "Service worker offline dan favicon yang ikut tema"
summary: "Service worker situs ini hanya menyimpan halaman offline, dan favicon SVG-nya berganti warna mengikuti tema."
date: 2026-11-16
topic: web
icon: lightbulb
label: "Service worker offline"
tags: ["Service worker", "PWA", "Favicon"]
tldr: "Service worker situs ini hanya menyimpan halaman offline dan berkas yang dipakainya. Setiap build mendapat versi baru, dan favicon SVG mengikuti tema pengguna."
---

Service worker di situs ini sengaja kecil. Ia hanya menyimpan halaman offline dan berkas `/_astro/` yang dipakai halaman itu. Permintaan lain tetap langsung ke jaringan, jadi pengunjung tidak tertahan di salinan lama.

## Permintaan yang dicegat

Worker hanya menangani dua jenis permintaan. [Service Worker API di MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) menjelaskan cara worker mencegat permintaan jaringan.

| Permintaan | Yang dilakukan worker |
| --- | --- |
| Navigasi halaman | Coba jaringan dulu. Jika gagal, kirim halaman offline sesuai bahasanya. |
| `/_astro/*` | Pakai cache dulu. Nama berkasnya memuat hash, jadi salinan cache tidak basi. |
| Lainnya | Tidak dicegat. Permintaan langsung ke jaringan. |

Worker juga menyalakan [navigation preload di MDN](https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager). Fitur ini memulai permintaan halaman bersamaan dengan proses awal worker. Berkas font yang dirujuk stylesheet halaman offline juga ikut disimpan.

## Setiap build punya versi baru

Setiap build mendapat nilai `VERSION` sendiri. Nilai ini menjadi bagian nama cache, jadi cache setiap build berbeda. Saat build, `src/pages/sw.js.ts` mengganti baris `const VERSION = "dev";` dengan nilai itu:

```ts {title=src/pages/sw.js.ts}
  // Prerendering runs once per build, so the version changes with every build.
  const version = Date.now().toString(36);

  return new Response(source.replace(PLACEHOLDER, `const VERSION = "${version}";`), {
```

Saat `sw.js` berubah, browser memperbarui cache dengan urutan ini:

:::diagram
- Build: VERSION diganti dengan nilai baru
- Browser: sw.js berubah, worker baru dipasang dan mengisi cache baru
- Aktivasi: cache versi lama dihapus, worker baru langsung aktif
:::

Di situs yang sudah di-deploy, perintah ini menampilkan nilai itu:

```sh
curl -s https://<alamat-situs>/sw.js | grep "const VERSION"
```

Saat saya cek pada 16 November 2026, hasilnya `const VERSION = "mwivxeh9";`. Nilai itu berganti di setiap build.

## Favicon yang ikut tema

Berkas `public/favicon.svg` memuat aturan `prefers-color-scheme`. Garisnya berwarna `#282828` untuk tema terang dan `#F4F1EB` untuk tema gelap. [Media query `prefers-color-scheme` di MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) mendeteksi apakah pengguna memilih tema terang atau gelap.

Berkas PNG dan ICO tidak bisa memuat aturan itu, jadi warnanya tetap. Karena itu, `favicon.ico` dan ikon PNG lain memakai tanda gelap `#282828` di atas latar putih.

## Sumber dan tes

Fitur ini masuk lewat [commit c1b66b2](https://github.com/risqiromadhoni/heyris/commit/c1b66b2) pada 16 November 2026 pukul 11.47 WIB. Worker hanya didaftarkan di build produksi, lihat `src/app/layouts/BaseLayout.astro`. Tes Playwright untuk dua halaman offline ada di `e2e/offline-page/`.
