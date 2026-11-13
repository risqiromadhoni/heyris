---
title: "Library TypeScript di monorepo dengan pnpm dan Turborepo"
summary: "Cara menyiapkan monorepo dengan pnpm dan Turborepo, lalu membuat library TypeScript yang dipakai paket lain."
date: 2024-12-01
topic: monorepo
---

Monorepo menyimpan beberapa paket dalam satu repositori. Library dan aplikasi di dalamnya bisa saling memakai tanpa harus diterbitkan lebih dulu ke npm. Untuk latar belakangnya, baca [Monorepo: apa itu dan cara menyiapkannya dengan pnpm](/tulisan/what-is-monorepo).

Monorepo mempermudah berbagi kode dan mengelola dependensi di satu tempat. Panduan ini memakai pnpm sebagai package manager dan Turborepo untuk menjalankan task di tiap paket. pnpm mendukung workspace secara native dan menyimpan setiap berkas paket sekali di satu store, lalu menautkannya ke tiap proyek.

Langkah-langkah di panduan ini sudah diuji di macOS arm64 dengan Node.js 26.13.0, pnpm 12.18.0, TypeScript 7.0.2, tsdown 0.23.7 dan Turborepo 2.11.11.

## Menyiapkan root monorepo

Folder root berisi konfigurasi bersama dan semua paket. Buat folder root dan berkas `package.json` dengan perintah ini:

```bash
mkdir ts-monorepo && cd ts-monorepo
pnpm init
```

Tambahkan dua field ini ke `package.json`. Field lain dari `pnpm init` tetap ada.

```json {title=package.json}
{
  "private": true,
  "scripts": {
    "build": "turbo run build"
  }
}
```

Field `private` membuat npm menolak menerbitkan root. Turborepo 2 membaca package manager dari `package.json` root. Pada pnpm 12, perintah `pnpm init` sudah menuliskannya.

Buat `pnpm-workspace.yaml` di folder root. pnpm membaca daftar paket dari berkas ini:

```yaml {title=pnpm-workspace.yaml}
packages:
  - "packages/*"
```

pnpm juga membaca field `workspaces` di `package.json`. Sejak pnpm 12.7, pnpm membuat `pnpm-workspace.yaml` dari field itu dan mencetak peringatan. Dengan menulis berkas ini langsung, peringatan itu tidak muncul.

Pasang Turborepo:

```bash
pnpm add -D turbo
```

## Mengatur task dengan Turborepo

Buat `turbo.json` di folder root. Setiap kunci dijelaskan di [referensi turbo.json](https://turborepo.dev/docs/reference/configuration).

```json {title=turbo.json}
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

Turborepo 2 memakai kunci `tasks` dan menolak kunci `pipeline`. `"dependsOn": ["^build"]` membuat build setiap dependensi selesai lebih dulu. `outputs` berisi berkas yang disimpan ke cache. Jika daftar ini kosong, Turborepo tidak menyimpan berkas apa pun.

Untuk cara Turborepo menjalankan task dan menyimpan hasilnya, baca [Turborepo di monorepo: peran dan cara pakainya](/tulisan/turborepo-in-our-monorepo).

## Membuat library TypeScript

Buat paket library di folder `packages/`. Nama folder menjadi nama paket:

```bash
mkdir -p packages/my-library && cd packages/my-library
pnpm init
pnpm add -D typescript tsdown @types/node
```

Panduan ini memakai [tsdown](https://tsdown.dev/) untuk membundel library. [Halaman tsup di npm](https://www.npmjs.com/package/tsup) menyatakan proyek itu tidak lagi dirawat secara aktif, dan menyarankan tsdown sebagai gantinya.

Buat `tsconfig.json`:

```json {title=packages/my-library/tsconfig.json}
{
  "compilerOptions": {
    "outDir": "dist",
    "module": "ESNext",
    "target": "ES6",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

Konfigurasi ini tidak perlu diubah untuk tsdown. Di TypeScript 7, `module` ESNext memakai `moduleResolution` bundler secara default.

Buat `src/index.ts`:

```ts {title=packages/my-library/src/index.ts}
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## Membangun library

`pnpm init` menulis `"main": "index.js"` di `package.json`. Berkas itu tidak ada di library ini. Build menulis hasilnya ke `dist/`, jadi `package.json` harus menunjuk ke sana. Ubah `package.json` library menjadi seperti berikut. Biarkan `devDependencies` yang sudah ditambahkan pnpm.

```json {title=packages/my-library/package.json}
{
  "name": "my-library",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "types": "./dist/index.d.cts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "scripts": {
    "build": "tsdown src/index.ts --format esm,cjs --dts"
  }
}
```

Field `exports` menentukan berkas yang dibaca untuk `import` (ESM) dan `require` (CJS). Field `main` dan `types` tetap ada untuk alat yang belum membaca `exports`.

Kembali ke root, lalu jalankan build:

```bash
cd ../..
pnpm build
```

Turbo menjalankan build library, lalu tsdown menulis empat berkas ke `dist/`:

```text
dist/
├── index.cjs
├── index.d.cts
├── index.d.mts
└── index.mjs
```

Flag `--format esm,cjs` membuat format ESM dan CJS. Flag `--dts` membuat berkas deklarasi tipe.

## Memakai library dari paket lain

Buat paket `app`, lalu tautkan `my-library` dari workspace:

```bash
mkdir -p packages/app && cd packages/app
pnpm init
cd ../..
pnpm --filter app add my-library --workspace
```

Flag `--workspace` memastikan pnpm mengambil `my-library` dari workspace. pnpm lalu menyimpannya sebagai `workspace:*`. Jangan lewati flag ini. Perintah `pnpm add my-library --filter app` tanpa flag menginstal paket npm yang kebetulan bernama sama, bukan paket di workspace.

Buat `packages/app/src/index.ts`:

```ts {title=packages/app/src/index.ts}
import { greet } from "my-library";

console.log(greet("World"));
```

Jalankan dari root:

```bash
pnpm build
node packages/app/src/index.ts
```

Program mencetak `Hello, World!`. Node.js 22.18 atau versi lebih baru bisa menjalankan berkas `.ts` langsung. Node hanya menghapus anotasi tipe dan tidak memeriksa tipe.

Sebelum Anda menerbitkan library ke npm, jalankan `pnpm dlx publint` di folder paket. [publint](https://publint.dev/) memeriksa isi `package.json`. Pada contoh ini, publint tidak menemukan error. publint hanya menyarankan menambahkan `engines.node`.

Terbit pertama kali pada 1 Desember 2024. Diperbarui pada 14 November 2026.
