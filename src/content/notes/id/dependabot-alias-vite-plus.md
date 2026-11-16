---
title: "Dependabot menaikkan vite-plus, alias vite tidak ikut"
summary: "Dependabot menaikkan satu baris di pnpm-workspace.yaml, sehingga CI gagal dengan 69 error tipe."
date: 2026-11-16
topic: ci
icon: code
label: "Alias vite dan vite-plus"
tags: ["Dependabot", "pnpm"]
tldr: "Dependabot menaikkan vite-plus, tetapi alias vite di baris sebelahnya tetap 1.5.1. Saya menyamakan keduanya, lalu semua pemeriksaan lulus."
---

Dependabot membuka PR #1 pada 16 November 2026 pukul 10.29 WIB. PR itu menaikkan `vite-plus` dari 1.5.1 ke 1.6.0. Alias `vite` di baris sebelahnya tidak ikut naik.

Akibatnya, CI gagal dengan 69 error tipe. Saya memperbaikinya di commit kedua PR. Setelah itu, semua pemeriksaan lulus, dan PR digabung pukul 12.52 WIB.

## Dua baris untuk satu alat

`pnpm-workspace.yaml` menyimpan katalog pnpm. [Dokumentasi katalog pnpm](https://pnpm.io/catalogs) menjelaskan bahwa versi paket ditulis di file ini sekali, lalu dipakai banyak `package.json`. Di repo ini, dua baris di katalog mengatur Vite+:

```yaml {title=pnpm-workspace.yaml}
catalog:
  vite: npm:@voidzero-dev/vite-plus-core@1.5.1
  vite-plus: 1.6.0
```

Itu isi katalog pada commit asli Dependabot, [31c5bf4](https://github.com/risqiromadhoni/heyris/commit/31c5bf4). PR itu kemudian di-rebase ke `main` yang lebih baru, dan commit tersebut menjadi [08211cc](https://github.com/risqiromadhoni/heyris/commit/08211cc). Isi katalognya sama di keduanya. Baris `vite` adalah alias ke paket `@voidzero-dev/vite-plus-core`. Dependabot hanya mengubah baris `vite-plus`.

Grup `vite-plus` di `.github/dependabot.yml` memang mencakup nama `vite`. Saya belum tahu mengapa alias itu tidak ikut berubah. Saya juga belum menguji apakah Dependabot bisa memperbaruinya.

## Apa yang gagal di CI

Di commit `31c5bf4`, job "Format, lint, types and unused code" gagal dengan 69 error `TS2339`. Setiap error berbunyi `Property 'element' does not exist on type 'ExpectStatic'`. Job "Unit, browser and type tests" juga gagal.

Lockfile di commit itu memuat dua versi `vite-plus-core`, 1.5.1 dan 1.6.0. Paket `@vitest/browser-playwright` terikat ke 1.5.1, sementara `vite-plus` di katalog sudah 1.6.0.

## Perbaikan

Saya menyamakan alias `vite` ke 1.6.0 di commit [b1330178](https://github.com/risqiromadhoni/heyris/commit/b1330178). Pada commit itu, semua pemeriksaan PR lulus.

:::diagram
- Dependabot: menaikkan vite-plus ke 1.6.0
- CI: 69 error tipe
- Perbaikan: alias vite ikut ke 1.6.0
- CI: semua pemeriksaan lulus
:::

## Aturan baru di CLAUDE.md

Saya menambahkan satu kalimat di `CLAUDE.md`. Kalimat itu mencatat bahwa PR vite-plus hanya menaikkan entri `vite-plus`. Maka, alias `vite` harus diubah sendiri, lalu `pnpm install` dijalankan.

Sumber: [PR #1 di GitHub](https://github.com/risqiromadhoni/heyris/pull/1) dan commit gabungan [8bb81fd](https://github.com/risqiromadhoni/heyris/commit/8bb81fd). Versi di atas berlaku saat catatan ini ditulis.
