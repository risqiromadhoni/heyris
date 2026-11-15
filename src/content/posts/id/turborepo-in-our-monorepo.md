---
title: "Turborepo di monorepo: peran dan cara pakainya"
summary: "Cara menyiapkan monorepo dengan pnpm, lalu memakai Turborepo untuk menjalankan tugas dan menyimpan hasilnya."
date: 2024-10-06
updated: 2026-11-14
topic: monorepo
---

Monorepo adalah satu repositori yang menyimpan kode dari banyak proyek sekaligus. Turborepo menjalankan tugas di monorepo seperti itu, lalu menyimpan hasilnya di cache.

## Menyiapkan workspace pnpm

Contoh berikut memakai workspace pnpm dengan tiga paket: `project-a`, `project-b`, dan `shared-utils`. Paket `project-a` memakai `shared-utils`.

Buat folder root, lalu jalankan `pnpm init` di dalamnya:

```bash
mkdir my-monorepo && cd my-monorepo
pnpm init
```

Lalu buat file `pnpm-workspace.yaml` di root. Kunci `packages` berisi pola folder paket:

```yaml {title=pnpm-workspace.yaml}
packages:
  - 'packages/*'
```

Setelah itu, buat tiga folder paket, lalu jalankan `pnpm init` di tiap folder:

```bash
mkdir -p packages/project-a packages/project-b packages/shared-utils
cd packages/project-a && pnpm init
cd ../project-b && pnpm init
cd ../shared-utils && pnpm init
cd ../..
```

Karena `pnpm-workspace.yaml` sudah ada, `pnpm init` di tiap paket tidak menulis versi pnpm. Hanya `package.json` root yang mendapat versi pnpm.

Di `packages/project-a/package.json`, tambahkan `shared-utils` sebagai dependensi dengan protokol `workspace:`:

```json {title=package.json}
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

Jalankan `pnpm install` dari root. Perintah itu menautkan `shared-utils` ke `project-a`. Field `name` di `packages/shared-utils/package.json` harus `shared-utils`. Jika tidak, pnpm tidak menemukan paket itu.

## Menjalankan tugas dengan Turborepo

Turborepo menjalankan tugas seperti build dan test di banyak paket, sesuai urutan dependensi antarpaket. Contoh berikut memakai Turborepo 2.11 atau yang lebih baru.

### Memasang Turborepo

Pasang Turborepo di root. File `pnpm-workspace.yaml` harus sudah ada. Tanpa file itu, perintah ini gagal.

```bash
pnpm add turbo --save-dev --workspace-root
```

Turborepo membaca package manager dari `package.json` root. Saat `pnpm init` dijalankan di root, pnpm biasanya sudah menulis `devEngines.packageManager` dan field `packageManager` ke file itu. Periksa keduanya. Jika `devEngines.packageManager` belum ada, misalnya karena proyek dibuat dengan `--no-init-package-manager`, tambahkan secara manual. Bentuknya seperti ini:

```json {title=package.json}
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": "12.18.0"
    }
  }
}
```

Jika menambahkannya secara manual, isi `version` dengan hasil `pnpm -v`. Angka 12.18.0 di contoh hanya menunjukkan bentuknya.

### Mengatur tugas di turbo.json

Tugas diatur di `turbo.json` di folder root. Kuncinya `tasks`; Turborepo 1.x menamainya `pipeline`.

```json {title=turbo.json}
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Kunci `dependsOn` menyebut tugas yang harus selesai sebelum sebuah tugas berjalan. Tanda `^` mengacu ke dependensi paket, jadi `^build` berarti build di paket dependensi dijalankan lebih dulu. Dengan konfigurasi ini, build `shared-utils` berjalan sebelum build `project-a`. Tanpa `^`, tugas itu menunggu tugas lain di paket yang sama. Di contoh ini, `test` baru jalan setelah `build` selesai.

Kunci `outputs` menyebut file hasil yang boleh disimpan di cache. Tanpa `outputs`, Turborepo tidak menyimpan file hasil apa pun. Tugas yang berjalan terus, seperti `dev`, diberi `persistent: true` dan `cache: false`.

Untuk memigrasi dari 1.x, jalankan codemod resmi:

```bash
pnpm dlx @turbo/codemod migrate
```

### Perintah turbo run dan turbo watch

Jalankan tugas dengan `turbo run`:

```bash
pnpm exec turbo run build
```

Untuk satu paket, pakai `--filter` dengan nama paket. Tiga titik setelah nama memilih paket itu beserta dependensinya:

```bash
pnpm exec turbo run build --filter=project-a...
```

Supaya Turborepo mengatur urutan tugas, atur skrip `build` di `package.json` root menjadi `turbo run build`.

`turbo watch` menjalankan ulang tugas saat ada file yang berubah. Urutan dependensi tetap berlaku:

```bash
pnpm exec turbo watch test
```

`turbo watch` tidak memulai ulang tugas `persistent`, seperti `dev`, saat file berubah. Tugas itu tetap berjalan seperti saat memakai `turbo run`, sehingga `turbo watch dev test` menjalankan keduanya bersamaan.

Jika alat di tugas itu tidak memuat ulang modul dari dependensinya, beri `interruptible: true` di `turbo.json`. Dengan begitu, `turbo watch` memulai ulang tugas itu saat file berubah.

### Cache lokal dan remote

Hasil tugas disimpan di `.turbo/cache`. Jika input tugas sama, Turborepo mengambil hasil dari cache dan tidak menjalankan ulang tugasnya.

Turborepo juga menyimpan log dan data lain di folder `.turbo`, jadi tambahkan folder itu ke `.gitignore` root:

```text {title=.gitignore}
.turbo
```

Remote Caching membagikan cache itu ke mesin lain, misalnya laptop dan server CI. Fitur ini gratis. Layanan terkelola dari Vercel bisa dipakai meski aplikasi tidak di-host di Vercel. Server sendiri juga bisa dipakai. Untuk menghubungkan repositori ke Vercel:

```bash
pnpm exec turbo login
pnpm exec turbo link
```

Untuk server sendiri, jalankan `pnpm exec turbo login --manual`, lalu isi URL API, nama tim, dan token.

### Monorepo parsial dengan prune

Untuk membuat monorepo parsial, misalnya untuk build Docker, pakai `turbo prune`:

```bash
pnpm exec turbo prune project-a --docker
```

Perintah ini membuat folder `out` yang berisi `project-a`, paket yang dibutuhkannya, dan lockfile yang sudah dipangkas. Flag `--docker` menyusun hasilnya supaya cocok dengan cara Docker menyimpan layer di cache.

### Menjalankan tugas untuk paket yang berubah

Flag `--affected` menjalankan tugas di paket yang berubah dibandingkan dengan `main`, beserta paket yang bergantung padanya:

```bash
pnpm exec turbo run build test --affected
```

Agar `--affected` punya riwayat Git yang cukup di GitHub Actions, atur `filter: blob:none` dan `fetch-depth: 0` pada `actions/checkout`.
