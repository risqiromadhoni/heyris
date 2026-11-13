---
title: "Monorepo: apa itu dan cara menyiapkannya dengan pnpm"
summary: "Apa itu monorepo, cara menyiapkannya dengan workspace pnpm, dan fitur GitHub yang membantu mengelolanya."
date: 2024-10-05
topic: monorepo
---

Monorepo adalah cara menyimpan kode dari banyak proyek dalam satu repositori. Cara lain, yang disebut multi-repo, memberi setiap proyek repositorinya sendiri. [Dokumentasi workspace pnpm](https://pnpm.io/workspaces) juga menyebut monorepo sebagai "monolithic repositories".

## Manfaat monorepo

Sebagian manfaat ini dicatat dalam [artikel Google tahun 2016 tentang satu repositori untuk seluruh kode](https://cacm.acm.org/research/why-google-stores-billions-of-lines-of-code-in-a-single-repository/).

1. Berbagi kode: proyek bisa langsung memakai kode proyek lain. Kode tidak perlu disalin ke repositori lain.
2. Refaktor skala besar: perubahan yang menyentuh banyak proyek lebih mudah dikerjakan.
3. Dependensi lebih sederhana. Artikel Google menyebut manfaat ini untuk kode internalnya. Di pnpm, `catalog` di `pnpm-workspace.yaml` menyimpan rentang versi dependensi sebagai konstanta yang bisa dipakai ulang. Paket memakainya dengan `catalog:`, dan ini memudahkan menjaga satu versi untuk setiap dependensi di workspace.
4. Kolaborasi: tim bisa melihat kode tim lain dan menemukan API yang bisa dipakai ulang.
5. Commit atomik: satu commit bisa memuat perubahan di beberapa proyek sekaligus.

## Tantangan monorepo

1. Ukuran repositori: repositori bisa membesar seiring waktu. GitHub menyarankan ukuran folder `.git` tidak lebih dari 10 GB, karena repositori besar memperlambat fetch dan memperpanjang waktu clone.
2. Kompleksitas build: alat build harus menangani banyak proyek sekaligus. Google menyebut investasi alat sebagai salah satu dari tiga jenis biaya monorepo.
3. Satu perubahan bisa merusak paket lain: paket yang memakai `workspace:` langsung ikut memakai kode terbaru dari paket itu.
4. Kontrol akses: izin GitHub berlaku per repositori. CODEOWNERS menentukan siapa yang diminta meninjau perubahan di folder tertentu. Jika sebagian kode harus dibatasi, pertimbangkan repositori terpisah.
5. Performa Git: operasi Git bisa melambat pada skala besar. Git punya sparse checkout untuk memuat folder tertentu saja, dan partial clone untuk repositori yang sangat besar.

## Menyiapkan monorepo dengan pnpm

pnpm punya fitur workspace bawaan untuk monorepo. Langkah berikut ditulis untuk pnpm 12. Hasilnya ada tiga paket: `project-a`, `project-b`, dan `shared-utils`.

### Buat folder root

```sh
mkdir my-monorepo
cd my-monorepo
pnpm init
```

`pnpm init` membuat `package.json`. Perintah ini juga mengisi kolom `packageManager` dengan versi pnpm.

### Buat pnpm-workspace.yaml

Buat berkas `pnpm-workspace.yaml` di folder root. Kunci `packages` berisi pola folder paket.

```yaml {title=pnpm-workspace.yaml}
packages:
  - 'packages/*'
```

Pola ini mencocokkan setiap folder satu tingkat di bawah `packages/`.

### Buat folder dan paket

```sh
mkdir -p packages/project-a packages/project-b packages/shared-utils
cd packages/project-a
pnpm init
cd ../project-b
pnpm init
cd ../shared-utils
pnpm init
```

Nama paket mengikuti nama folder. Folder `shared-utils` menghasilkan paket bernama `shared-utils`.

### Hubungkan paket lokal

Tulis dependensi ke paket lokal dengan protokol `workspace:`. Secara bawaan, pnpm mengambil paket dari registry jika protokol ini tidak dipakai.

Tambahkan ini ke `packages/project-a/package.json`:

```json
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

Lalu jalankan `pnpm install` dari folder root. Perintah itu menautkan `shared-utils` ke `project-a` dan membuat `pnpm-lock.yaml` di root.

`workspace:*` hanya menerima paket lokal. Saat paket diterbitkan, pnpm mengganti nilai itu dengan nomor versi.

### Tambahkan skrip di root

Ganti isi `scripts` di `package.json` root dengan ini:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test"
  }
}
```

Perintah `pnpm -r` menjalankan skrip di setiap paket dan melewati folder root. Paket tanpa skrip itu dilewati.

Skrip `build` dan `test` berjalan sesuai urutan dependensi. Jadi `shared-utils` selesai dibangun sebelum `project-a`.

Skrip `dev` memakai `--parallel`. Tanpa flag ini, pnpm menunggu skrip `dev` milik dependensi selesai sebelum memulai paket yang memakainya. Jika skrip dev itu menjalankan server, skrip itu tidak pernah selesai. Akibatnya, paket yang memakainya tidak pernah mulai.

Skrip `test` bawaan dari `pnpm init` selalu gagal dengan pesan `Error: no test specified`. Ganti skrip itu dengan tes sungguhan di paket yang sudah punya tes, atau hapus di paket yang belum punya. Jika skrip bawaan masih ada, `pnpm test` berhenti dengan error. Jika tidak ada paket yang punya skrip `test`, `pnpm test` selesai tanpa error, tetapi tidak menjalankan tes apa pun.

### Alat tambahan

pnpm menangani penautan paket dan menjalankan skrip. Pengaturan [`tasks`](https://pnpm.io/workspace-task-orchestration) menentukan urutan antarskrip saat skrip dijalankan di banyak paket sekaligus.

pnpm 12.4 menambahkan perintah [`pnpm pipeline`](https://pnpm.io/cli/pipeline). Perintah ini hanya menjalankan tugas untuk proyek yang berubah dibanding `origin/main`. Proyek yang bergantung padanya juga ikut dijalankan. Untuk tugas yang mendeklarasikan `outputs`, hasil cache dipakai jika tersedia. Perintah ini butuh daftar `pipelines` di `pnpm-workspace.yaml`. Fitur ini masih eksperimental, jadi konfigurasi dan keluarannya bisa berubah. Perintah `pnpm -r run` biasa tidak pernah memakai cache ini.

[Turborepo](https://turborepo.dev/) dan [Nx](https://nx.dev/) juga menyimpan cache hasil tugas. Nx punya `nx affected` untuk menjalankan hanya tugas yang terdampak perubahan.

## Contoh struktur folder

Struktur ini memakai pnpm. Hanya folder yang cocok dengan pola di `pnpm-workspace.yaml` yang menjadi paket. Jadi `tools/` dan `docs/` bukan paket pnpm.

```text
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── README.md
├── packages/
│   ├── project-a/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.js
│   │   └── tests/
│   │       └── index.test.js
│   ├── project-b/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.js
│   │   └── tests/
│   │       └── index.test.js
│   └── shared-utils/
│       ├── package.json
│       └── src/
│           └── utils.js
├── tools/
│   └── build-scripts/
│       └── build.js
└── docs/
    ├── project-a/
    │   └── README.md
    └── project-b/
        └── README.md
```

- `packages/` berisi semua proyek dan paket.
- `project-a` dan `project-b` adalah contoh proyek terpisah dalam monorepo.
- `shared-utils` adalah paket yang dipakai proyek lain.
- `tools/` berisi skrip build dan utilitas lain yang dipakai di seluruh monorepo.
- `docs/` berisi dokumentasi untuk setiap proyek.

## Mengelola monorepo dengan GitHub

GitHub punya beberapa fitur untuk mengelola monorepo.

### Workflow GitHub Actions

Workflow GitHub Actions bisa dibatasi dengan filter `paths` di bagian `on.push`. Dengan filter ini, workflow hanya berjalan saat berkas di folder tertentu berubah. [Dokumentasi GitHub Actions tentang filter paths](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore) menjelaskan pola yang bisa dipakai.

### Aturan branch protection

Aturan branch protection mengatur apa yang boleh masuk ke branch utama. Anda bisa mewajibkan status check lulus atau review sebelum merge. GitHub juga menyediakan rulesets sebagai cara lain untuk mengatur branch.

### Berkas CODEOWNERS

Berkas `CODEOWNERS` menentukan siapa yang diminta meninjau perubahan di folder tertentu. Letakkan di `.github/CODEOWNERS`. Baris berikut menetapkan tim `@org/tim-a` sebagai pemilik folder `project-a`:

```text
/packages/project-a/ @org/tim-a
```

Tim pemilik harus berstatus visible (pengaturan visibilitas tim di GitHub) dan punya akses tulis ke repositori, walaupun setiap anggotanya sudah punya akses tulis. Saat pull request yang bukan draft mengubah berkas di folder itu, GitHub otomatis meminta pemilik untuk meninjau. Persetujuan pemilik hanya wajib jika aturan branch mengaktifkan opsi "Require review from Code Owners".

### GitHub Projects

GitHub Projects membantu melacak pekerjaan lintas paket dalam satu tabel atau papan.

## Praktik yang baik

1. Pakai Conventional Commits, misalnya `feat(ui): tambahkan tombol salin`. Format ini memudahkan pembuatan changelog dan penentuan versi secara otomatis.
2. Pasang linter dan formatter, misalnya ESLint dan Prettier, supaya gaya kode tetap konsisten.
3. Otomatiskan sebanyak mungkin lewat GitHub Actions, misalnya untuk pengujian, build, dan deploy.
4. Tulis README yang jelas untuk setiap proyek dan untuk root monorepo.
5. Catat perubahan untuk rilis dengan `pnpm change`. Perintah ini membuat berkas Markdown di folder `.changeset/`. Lalu jalankan `pnpm version -r` untuk menaikkan versi dan menulis changelog. Alur ini bawaan pnpm. Lihat [dokumentasi versioning pnpm](https://pnpm.io/versioning) untuk detailnya.

   Berkas itu memakai format Changesets. Jika lebih suka CLI Changesets, pasang `@changesets/cli` di root dengan `pnpm add -Dw @changesets/cli`, lalu jalankan `pnpm changeset init`. Setelah itu, `pnpm changeset` membuat changeset dan `pnpm changeset version` memperbarui versi dan changelog. Panduannya ada di [panduan pnpm tentang Changesets](https://pnpm.io/using-changesets).

## Kapan memakai monorepo

Menurut saya, monorepo paling berguna untuk proyek yang saling bergantung. Untuk proyek yang berdiri sendiri, multi-repo bisa lebih sederhana.

[Studi kasus Google tahun 2018](https://dl.acm.org/doi/10.1145/3183519.3183550) juga mencatat kelebihan multi-repo: kebebasan memilih alat, serta manfaat kontrol akses dan stabilitas.

Terbit pertama kali pada 5 Oktober 2024. Diperbarui pada 14 November 2026.
