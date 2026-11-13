---
title: "Token sesi Google Places: satu token untuk satu pencarian"
summary: "Token sesi mengelompokkan ketikan dan pilihan tempat menjadi satu sesi tagihan di Places API (New)."
date: 2026-11-14
topic: api
icon: gauge
label: "Token sesi Google Places"
tags: ["Google Places"]
tldr: "Pakai satu token untuk satu pencarian. Kirim token yang sama ke Autocomplete dan Place Details, lalu buat token baru untuk pencarian berikutnya."
pinned: true
---

Google Places API (New) memakai token sesi untuk mengelompokkan ketikan dan pilihan tempat dalam satu pencarian menjadi satu sesi tagihan.

## Kapan sesi mulai dan selesai

Sesi dimulai saat permintaan Autocomplete pertama memakai token. Sesi selesai saat panggilan Place Details (New) atau Address Validation memakai token yang sama. Biaya sesi bergantung pada tingkat field yang diminta panggilan Place Details penutup, misalnya Essentials atau Pro.

Sesi juga berakhir kalau pengguna meninggalkan pencarian tanpa memilih tempat. Sesi yang ditinggalkan membuat setiap permintaan Autocomplete ditagih sendiri, seperti tanpa sesi. Dokumen Places API (New) tidak menyebut angka batas waktunya.

## Aturan token

- Buat token baru untuk setiap sesi. Google menganjurkan UUID versi 4.
- Token harus berupa string base64 yang aman untuk URL dan nama file, dengan paling banyak 36 karakter ASCII.
- Token yang tidak memenuhi aturan itu ditolak dengan INVALID_ARGUMENT.
- Setelah sesi selesai, token itu tidak berlaku lagi.

Kalau token tidak dikirim atau dipakai ulang untuk sesi lain, Google menagih tiap permintaan sendiri-sendiri.

## Cara repo `autocomplete-places` memakai token

Di repo saya, server membuat token dengan `crypto.randomUUID()` saat permintaan Autocomplete pertama. Server menghapus sesi dari cache setelah Place Details berhasil. Klien membuat `sessionId` baru setelah itu.

Cuplikan berikut adalah sketsa singkat dari kedua panggilan itu, bukan salinan dari repo.

```ts
// Header X-Goog-Api-Key dihilangkan supaya contohnya pendek.
const sessionToken = crypto.randomUUID();

// Autocomplete (New): token dikirim di body.
await fetch("https://places.googleapis.com/v1/places:autocomplete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ input, sessionToken }),
});

// Place Details (New): token yang sama menutup sesi.
await fetch(
  `https://places.googleapis.com/v1/places/${placeId}?sessionToken=${sessionToken}&fields=id,formattedAddress`
);
```

## Dua hal yang perlu dicek

Repo itu menyimpan token di `Map` di memori server. Kalau Autocomplete dan Place Details diproses di instans server yang berbeda, Place Details berjalan tanpa token. Google tidak mengenali panggilan itu sebagai penutup sesi, jadi sesinya ditinggalkan dan setiap permintaan Autocomplete ditagih sendiri. Komentar di kode juga menyarankan Redis untuk produksi.

Repo itu juga menghapus sesi yang dibuat lebih dari 3 menit lalu, dan pembersihannya berjalan setiap jam. Dokumen Places API (New) tidak menyebut angka 3 menit itu. Pembersihan memakai waktu pembuatan sesi, bukan waktu terakhir sesi dipakai, jadi sesi yang masih dipakai bisa terhapus di tengah pencarian. Autocomplete berikutnya lalu mendapat token baru. Sesi lama tidak pernah ditutup, jadi permintaan di sesi itu ditagih sendiri.
