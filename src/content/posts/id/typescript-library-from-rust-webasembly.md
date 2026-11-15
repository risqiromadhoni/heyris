---
title: "Rust dan WebAssembly untuk engineer TypeScript: apa manfaatnya?"
summary: "Rust lewat WebAssembly bisa membantu bagian aplikasi yang padat komputasi, tetapi tidak semua proyek perlu memakainya."
date: 2024-12-02
updated: 2026-11-14
topic: rust
---

Sebagai engineer TypeScript, Anda mungkin bertanya mengapa Rust dan WebAssembly (Wasm) makin sering dibicarakan dalam pengembangan web.

[Buku The Rust Programming Language](https://doc.rust-lang.org/book/ch00-00-introduction.html) menyebut Rust membantu Anda menulis perangkat lunak yang lebih cepat dan lebih andal. WebAssembly memungkinkan kode berkinerja tinggi berjalan di browser.

Saya memperbarui tulisan ini pada November 2026.

## 1. Performa

Anggapan bahwa JavaScript lambat karena diinterpretasikan sudah tidak tepat. Mesin V8, yang dipakai Chrome dan Node.js, mulai menjalankan kode dengan interpreter Ignition. Kode yang sering dipakai lalu dikompilasi menjadi kode mesin lewat Sparkplug, Maglev, dan TurboFan atau Turboshaft ([dokumentasi V8](https://github.com/v8/v8/blob/main/docs/overview.md)).

WebAssembly tetap punya keunggulan. Menurut [pengumuman W3C tahun 2019](https://www.w3.org/press-releases/2019/wasm/), sebagian besar peningkatan performanya dibanding JavaScript berasal dari penggunaan tipe data yang konsisten. WebAssembly juga berjalan dengan kecepatan mendekati native ([panduan konsep WebAssembly di MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts)).

Pengumuman yang sama menyatakan WebAssembly bisa dipakai untuk codec video dan audio, grafis dan 3D, multimedia dan game, serta komputasi kriptografi. [Panduan Shopify Functions](https://shopify.dev/docs/apps/build/functions/programming-languages) menyarankan Rust jika fungsi ditujukan untuk aplikasi publik, memproses banyak item pesanan, atau padat komputasi. Panduan yang sama menyatakan JavaScript cocok untuk prototipe, tetapi fungsi JavaScript lebih cepat mencapai batas instruksi Shopify dibanding Rust.

## 2. Keamanan memori tanpa garbage collector

JavaScript mengelola memori secara otomatis lewat garbage collector ([panduan manajemen memori MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)). Rust tidak memakai garbage collector, tetapi tetap menjaga keamanan memori. Kompilernya memeriksa [aturan kepemilikan (ownership)](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) sebelum program bisa berjalan. Memori dikembalikan otomatis saat variabel pemiliknya keluar dari scope.

Rust membuat kebocoran memori sulit terjadi, tetapi tidak mustahil. [Bab siklus referensi](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html) di buku Rust memberi contohnya dengan `Rc<T>` dan `RefCell<T>`.

Dalam kode aman, Rust tidak punya null. Nilai yang mungkin tidak ada memakai tipe `Option<T>`, dan kompilernya memaksa Anda menangani kondisi `None` sebelum memakai nilainya. [Bab tentang enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html) menjelaskan alasannya.

Banyak error konkurensi di Rust tertangkap saat kompilasi, bukan saat program berjalan ([bab konkurensi](https://doc.rust-lang.org/book/ch16-00-concurrency.html)). Aturan peminjaman bisa mencegah data race saat kompilasi ([bab referensi dan peminjaman](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)).

Rust mengurangi banyak bug ini, tetapi tidak menghapus semuanya.

## 3. Interoperabilitas dengan JavaScript

Kode Rust bisa dikompilasi menjadi berkas `.wasm` dan dipakai di proyek TypeScript atau JavaScript. Jembatannya adalah `wasm-bindgen`. Secara bawaan, alat ini juga membuat definisi tipe TypeScript untuk ekspor dari Rust ([referensi CLI `wasm-bindgen`](https://wasm-bindgen.github.io/wasm-bindgen/reference/cli.html)).

Untuk library, atur `crate-type` ke `cdylib` dan tambahkan `wasm-bindgen` di `Cargo.toml`, seperti pada [contoh hello world `wasm-bindgen`](https://wasm-bindgen.github.io/wasm-bindgen/examples/hello-world.html).

```toml {title=Cargo.toml}
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

Tanpa `cdylib`, `cargo build` untuk target Wasm menghasilkan berkas `.rlib`, bukan `.wasm`.

Tambahkan target Wasm ke toolchain Rust, lalu kompilasi kodenya:

```bash
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

Berkas `.wasm` dari `cargo build` belum berisi kode JavaScript penghubung dan definisi tipe TypeScript. [CLI `wasm-bindgen`](https://wasm-bindgen.github.io/wasm-bindgen/reference/cli.html) membuat keduanya dari berkas itu.

Untuk paket npm, pakai [`wasm-pack`](https://wasm-bindgen.github.io/wasm-pack/). Perintah [`wasm-pack build`](https://wasm-bindgen.github.io/wasm-pack/book/commands/build.html) menjalankan kompilasi dan pembuatan berkas penghubung sekaligus. Perintah `wasm-pack build --target bundler` menghasilkan paket npm untuk bundler. Tanpa `--target`, `wasm-pack` memakai `bundler` secara bawaan.

Repositori [`wasm-pack`](https://github.com/wasm-bindgen/wasm-pack) kini ada di organisasi GitHub `wasm-bindgen`. Organisasi [`rustwasm`](https://github.com/rustwasm) yang lama sudah diarsipkan. [Blog Rust](https://blog.rust-lang.org/inside-rust/2025/07/21/sunsetting-the-rustwasm-github-org/) mengumumkan penghentiannya pada 21 Juli 2025. Saat tulisan ini diperbarui, rilis terbarunya v0.15.1 (30 Oktober 2026).

Menurut [panduan deployment `wasm-bindgen`](https://wasm-bindgen.github.io/wasm-bindgen/reference/deployment.html), webpack adalah satu-satunya bundler yang tercatat didukung penuh. Rolldown juga bisa lewat plugin. Tanpa bundler, pakai `--target web`. Mode itu tidak bisa memakai dependensi npm.

Di luar browser, Node.js juga bisa menjalankan modul Wasm ([panduan konsep WebAssembly di MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts)). [Cloudflare Workers mendukung Rust](https://developers.cloudflare.com/workers/languages/rust/) lewat crate `workers-rs`. Rust punya target `wasm32-wasip2` untuk runtime WASI yang mendukung component model. Target `wasm32-wasip1` ada untuk kompatibilitas dengan WASI preview 1 yang lebih lama. Logika yang sama bisa dipakai di browser dan di server.

## 4. Lebih paham memori dan konkurensi

Belajar Rust membuat Anda lebih paham konsep memori dan konkurensi tingkat rendah. Anda tidak perlu melepas memori secara manual, tetapi harus memahami kepemilikan (ownership) dan peminjaman (borrowing) data.

Menurut saya, konsep-konsep itu membuat Anda menulis kode yang lebih teliti, meskipun Anda tidak menulis Rust setiap hari.

## 5. Dukungan dan pemakaian nyata

Sejak November 2017, empat browser utama mendukung WebAssembly, menurut [pengumuman Mozilla](https://blog.mozilla.org/press/2017/11/webassembly-support-now-shipping-in-all-major-browsers/).

Mozilla memakai Rust di Firefox sejak Firefox 48 pada 2016 ([catatan Mozilla Hacks](https://hacks.mozilla.org/2016/07/shipping-rust-in-firefox/)). Fungsi Shopify dikompilasi menjadi modul WebAssembly ([referensi API Shopify Functions](https://shopify.dev/docs/api/functions/latest)).

Saya tidak tahu seberapa cepat WebAssembly akan berkembang. Namun Rust dan WebAssembly sudah dipakai di produk nyata.

## Mulai dari bagian kecil

Rust dan WebAssembly bukan pengganti TypeScript. Keduanya berguna untuk bagian kecil yang padat komputasi. Mulailah dari satu fungsi yang terbukti lambat saat diukur. Pindahkan fungsi itu ke Rust, lalu ukur lagi.
