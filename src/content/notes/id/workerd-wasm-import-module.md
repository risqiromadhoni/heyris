---
title: "Memuat WebAssembly di Workers dengan impor modul"
summary: "Workers tidak mengizinkan WebAssembly dikompilasi dari byte, jadi berkasnya diimpor sebagai modul."
date: 2026-11-14
topic: cloudflare
icon: sparkle
label: "WebAssembly di Workers"
tags: ["Cloudflare Workers", "WebAssembly"]
tldr: "Workers tidak mengizinkan kompilasi WebAssembly dari byte. Dengan toolchain Cloudflare, impor .wasm menghasilkan WebAssembly.Module, dan situs ini memakai akhiran ?module."
---

Situs ini membuat kartu Open Graph dengan `@resvg/resvg-wasm`, pustaka WebAssembly yang mengubah SVG menjadi PNG. Di Workers, pustaka ini tidak bisa dimuat dari byte. Cara yang berhasil: impor berkas `.wasm`-nya sebagai modul.

## Kenapa tidak bisa dikompilasi dari byte

Menurut [dokumentasi Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/web-standards/#javascript-standards), Workers tidak mengizinkan `WebAssembly.compile` dan `WebAssembly.instantiate` yang menerima byte, dengan alasan keamanan. Versi streaming-nya, `WebAssembly.compileStreaming` dan `WebAssembly.instantiateStreaming`, juga tidak diizinkan.

## Impor sebagai modul

Menurut [dokumentasi WebAssembly Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/#bundling), toolchain Cloudflare mengemas berkas `.wasm` dan `.wasm?module` ke dalam Worker supaya tersedia saat runtime. Hasil impornya berupa `WebAssembly.Module`, seperti tertulis di [dokumentasi adapter Cloudflare untuk Astro](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#cloudflare-module-imports). Kode yang membuat kartu di situs ini memakai akhiran `?module`:

```ts {title=src/shared/lib/og-image/render.ts}
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import rasteriserModule from "@resvg/resvg-wasm/index_bg.wasm?module";
```

Dengan modul, `initWasm` memanggil `WebAssembly.instantiate` dengan modul itu, bukan dengan byte. Kalau diberi URL atau Response, ia memakai `instantiateStreaming`, atau `instantiate` dengan byte. Workers tidak mengizinkan kedua jalur itu. Panggilan kedua `initWasm` melempar error, jadi kode menyimpan promise-nya di `rasteriserReady` dan memakainya lagi.

## Kapan kartu dibuat

Rute kartu OG, `src/pages/og/[...path].png.ts`, memakai `prerender = true`. Jadi kartu dibuat saat build, bukan saat ada permintaan. Keluaran build situs ini memperlihatkan hal itu. Ada folder `og` di folder keluaran `client`, sedangkan folder `server` tidak memuat berkas `.wasm` atau kode `resvg`.

Adapter Cloudflare untuk Astro menjalankan prerender di `workerd` secara bawaan. Opsi [`prerenderEnvironment`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#prerenderenvironment) mengaturnya. Alasannya, menurut dokumentasi: supaya sedekat mungkin dengan lingkungan produksi. `astro.config.mjs` di situs ini tidak mengubah opsi itu.
