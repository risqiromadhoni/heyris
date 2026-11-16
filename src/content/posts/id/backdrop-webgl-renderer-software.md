---
title: "Backdrop WebGL yang digambar CPU menurunkan skor Lighthouse"
summary: "Backdrop WebGL ringan di GPU, tetapi berat di CPU. Throttling bawaan Lighthouse memberi skor 98, throttling devtools memberi 63."
date: 2026-11-16
topic: web
---

Backdrop WebGL di situs ini cepat di komputer dengan GPU. Di komputer tanpa GPU, Lighthouse mencatat sekitar 42 detik kerja untuk berkas backdrop. Throttling bawaan Lighthouse memberi skor 98 di situs online, sedangkan throttling devtools di salinan lokal memberi 63. Kedua uji tidak sepenuhnya sebanding, dan alasannya ada di bawah. Tulisan ini mencatat cara saya menemukan masalahnya dan perbaikan yang saya buat.

## Backdrop itu digambar lewat WebGL

Latar belakang halaman adalah shader WebGL di `src/shared/ui/ShaderCanvas/`. Shader itu digambar ulang di setiap frame. Gambar berhenti kalau pengguna meminta gerak berkurang, atau tab disembunyikan.

Di GPU, pekerjaan itu kecil. Tanpa GPU, browser menggambar shader lewat CPU. Pekerjaan itu terjadi di main thread, tempat halaman juga berjalan. Halaman tampak cepat, tetapi main thread tetap sibuk.

## Apa yang saya lihat di PageSpeed Insights

Pada 16 November 2026, PageSpeed Insights memberi situs ini skor 64. Total Blocking Time-nya 7.850 ms. CLAUDE.md mencatat skor yang sama. Saya tidak bisa mengulang pengukuran itu, karena kuota API PageSpeed sedang habis.

## Cara saya mengukur

Saya menjalankan Lighthouse 13.6.0 dengan preset desktop. Chrome 157 berjalan dalam mode headless di Mac saya. Setiap angka di tulisan ini berasal dari satu kali jalan, bukan rata-rata. Skor Lighthouse bisa turun 10 sampai 25 poin di mesin yang sedang sibuk, menurut CLAUDE.md.

Lighthouse punya dua cara throttling. Cara bawaannya, simulasi, memperkirakan halaman dari satu kali muat. Cara devtools menerapkan throttling di browser sungguhan. [Dokumentasi throttling Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) menjelaskan perbedaannya.

## Dua cara, dua hasil

Tabel ini memuat tujuh uji. Baris pertama memakai situs yang sudah di-deploy. Baris "sebelum perbaikan" memakai salinan lokal hasil build dari `main`. Baris "hanya cek flag" memakai varian di tengah pengerjaan. Baris lainnya memakai kode setelah perbaikan.

| Uji | Throttling | Skor | Waktu berkas backdrop |
| --- | --- | --- | --- |
| Situs online, tanpa GPU | Simulasi (bawaan) | 98 | 6.859 ms |
| Lokal, sebelum perbaikan, tanpa GPU | Devtools, CPU 1x | 63 | 42.526 ms |
| Lokal, sebelum perbaikan, tanpa GPU | Devtools, CPU 2x | Tidak ada | 44.570 ms |
| Lokal, hanya cek flag, tanpa GPU | Devtools, CPU 1x | 63 | 44.564 ms |
| Lokal, setelah perbaikan, tanpa GPU | Devtools, CPU 1x | 100 | Tidak ada entri |
| Lokal, setelah perbaikan, tanpa GPU | Devtools, CPU 2x | 100 | Tidak ada entri |
| Lokal, setelah perbaikan, dengan GPU | Devtools, CPU 1x | 100 | 400 ms |

Waktu berkas backdrop adalah total waktu browser untuk berkas skrip backdrop, menurut laporan bootup-time Lighthouse. Tidak ada entri berarti berkas itu tidak muncul di laporan.

Di situs online, simulasi memberi skor 98 dan TBT 130 ms. Di salinan lokal, devtools memberi skor 63 dan TBT 1.360 ms. Kedua baris itu tidak sepenuhnya sebanding. Saya tidak menjalankan devtools dengan CPU 1x di situs online.

Di CPU 2x, Lighthouse tidak memberi skor. Lighthouse menulis bahwa halaman terlalu lama dimuat. Halaman tidak pernah cukup sepi untuk diukur.

## Di mana waktunya habis

Pada salinan lokal sebelum perbaikan, berkas backdrop tercatat 42.526 ms. Dari angka itu, 174 ms adalah waktu JavaScript. Sisanya bukan JavaScript. Saya belum membedah sisa itu lebih dalam. Pola ini cocok dengan shader yang digambar lewat CPU.

## Mengapa flag saja tidak cukup

Opsi `failIfMajorPerformanceCaveat` meminta browser menolak konteks WebGL kalau tidak ada GPU atau performanya rendah. [Dokumentasi MDN untuk getContext](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) menjelaskan opsi ini. Perbaikan pertama saya hanya memakai opsi itu.

Varian dengan flag saja tetap menjalankan backdrop. Skornya 63, dan berkas backdrop tercatat 44.564 ms. Saya membuka Chrome dengan `--use-angle=swiftshader` dan `--enable-unsafe-swiftshader`. CLAUDE.md mencatat hal yang sama: Chrome menghormati flag itu hanya saat software GL menjadi cadangannya, bukan saat dipilih secara eksplisit.

## Perbaikan dengan dua cek

Fungsi `openHardwareContext` kini melakukan dua cek. Cek pertama memakai opsi flag. Cek kedua membaca nama renderer.

:::diagram
- Cek 1: browser menolak konteks tanpa GPU
- Cek 2: nama renderer menunjuk ke software GL
- Hasil: konteks WebGL dipakai, atau backdrop dilewati
:::

:::figure
::::window{address="src/shared/ui/ShaderCanvas/gl-program.ts"}
```ts {title=src/shared/ui/ShaderCanvas/gl-program.ts}
export function openHardwareContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const gl = canvas.getContext("webgl", { antialias: false, failIfMajorPerformanceCaveat: true });

  if (!gl || !isSoftwareRenderer(rendererName(gl))) return gl;

  gl.getExtension("WEBGL_lose_context")?.loseContext();

  return null;
}
```
::::
:::

Kalau cek kedua menemukan software GL, fungsi melepas konteks lewat `WEBGL_lose_context` dan mengembalikan `null`. Halaman lalu tampil tanpa backdrop.

Nama renderer tidak selalu langsung terbaca. Chrome memberi nama umum `WebKit WebGL`. Nama asli ada di ekstensi [WEBGL_debug_renderer_info](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info). Kode membaca ekstensi itu saat nama umumnya `WebKit WebGL`. Regex `SOFTWARE_RENDERER` mencari SwiftShader, llvmpipe, softpipe, software, dan basic render.

Tes unit di `gl-program.test.ts` memeriksa lima nama software dan lima nama perangkat keras. Tes itu hanya menguji pencocokan nama. Ia tidak menjalankan browser. Ketika saya menjalankannya, sepuluh tes lolos.

Perbaikannya masuk lewat [PR #6](https://github.com/risqiromadhoni/heyris/pull/6), dan tesnya lewat [PR #10](https://github.com/risqiromadhoni/heyris/pull/10):

:::commits
- c03b772 perf(shader): skip the WebGL backdrop on software renderers (#6)
- 6f5dbf6 test(shader): cover the software renderer check (#10)
:::

## Hasilnya dan batasannya

Dengan dua cek, skor 100 di CPU 1x dan 2x, tanpa GPU. Total kerja main thread 202 ms di 1x dan 226 ms di 2x. Berkas backdrop tidak muncul di laporan. Di komputer dengan GPU, backdrop tetap tampil, dan waktunya 400 ms.

Ada harga yang harus diterima. Pengunjung tanpa GPU tidak melihat backdrop. Halaman tetap berfungsi tanpanya, seperti yang dicatat CLAUDE.md. Pesan commit perbaikan juga mencatat bahwa Unlighthouse di runner GitHub pernah kehabisan waktu menunggu main thread diam.

Angka di tulisan ini berasal dari satu mesin dan satu kali jalan. Pengukuran ulang di mesin lain bisa memberi angka yang berbeda.
