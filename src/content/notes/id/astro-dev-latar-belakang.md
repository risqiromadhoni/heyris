---
title: "Astro dev berjalan di latar belakang saat ada agen AI"
summary: "Astro 7 memindahkan dev server ke latar belakang saat agen AI terdeteksi."
date: 2026-11-14
topic: astro
icon: code
tags: ["Astro"]
tldr: "Astro 7 menjalankan `astro dev` di latar belakang saat agen AI terdeteksi. Kelola server itu dengan `status`, `logs`, dan `stop`, atau matikan mode ini dengan `ASTRO_DEV_BACKGROUND=0`."
---

Saat Astro mendeteksi agen AI, `astro dev` berjalan sebagai proses latar belakang. Sejak v7.2.0, `astro preview` ikut berjalan di latar belakang. Server tidak menahan terminal agen, jadi agen tetap bisa bekerja.

Mode ini berlaku di macOS dan Linux. Di Windows, server tetap berjalan di latar depan.

Astro mencatat server di file `.astro/dev.json`. File itu berisi URL, port, dan PID server.

Dalam mode ini, perintah `astro dev` langsung selesai, sementara server tetap berjalan. Alat yang menunggu perintah itu, seperti `webServer` Playwright, bisa salah membaca kondisinya.

## Mengelola server latar belakang

Perintah berikut mengelola server latar belakang:

- `pnpm astro dev status` menampilkan URL, PID, dan lama server berjalan.
- `pnpm astro dev logs` menampilkan log. Perintah ini hanya bekerja untuk server yang dimulai di latar belakang. Tambahkan `--follow` untuk melihat log baru.
- `pnpm astro dev stop` mengirim SIGTERM dan menunggu hingga 5 detik. Jika server masih berjalan, Astro mengirim SIGKILL.

Server dev juga menyediakan endpoint `/_astro/status`, yang mengembalikan `{"ok": true}`. Agen dan alat lain bisa memakainya untuk memeriksa apakah server siap menerima permintaan.

## Flag `--ignore-lock`

Flag `--ignore-lock` melewati pengecekan dan penulisan lock file. Server baru bisa berjalan di samping server yang sudah ada. Server baru itu tidak dilacak `stop`, `status`, atau `logs`.

Di Astro 7.4.11, flag ini juga mematikan mode latar belakang otomatis. Server tetap berjalan di latar depan.

Jika digabung dengan `--background` atau `--force`, Astro menolak dan menampilkan error.

## Di repo situs ini

Playwright di repo ini menjalankan `astro dev --ignore-lock` lewat `webServer`. Flag itu menjaga server tetap di latar depan sampai Playwright menghentikannya dengan SIGTERM.

Untuk menjalankan `astro dev` sendiri di latar depan, tambahkan `ASTRO_DEV_BACKGROUND=0` sebelum perintah. Playwright tidak memerlukan variabel ini.

```sh
env ASTRO_DEV_BACKGROUND=0 pnpm astro dev
```

Astro tetap mencatat server itu sebagai latar belakang di `.astro/dev.json`, jadi `status` menyebutnya `background`. `logs` gagal dengan `No log file found.`, atau menampilkan log server lama jika `.astro/dev.log` dari server latar belakang sebelumnya ada.
