---
title: "Git lanjutan untuk alur kerja yang lebih efisien"
summary: "Perintah Git lanjutan untuk rebase, reset, dan bisect, termasuk cara memasang Husky 9 dan Commitlint."
date: 2024-10-01
updated: 2026-11-14
topic: git
---

Setelah paham dasar Git, Anda akan sering butuh perintah yang lebih lanjut. Artikel ini merangkum perintah yang sering dipakai untuk merapikan riwayat dan memulihkan kesalahan. Artikel ini juga membahas hook Git dan cara menjaga repositori besar tetap cepat.

## Rebase dan merge

Merge menggabungkan dua branch. Jika kedua branch sama-sama punya commit yang belum ada di branch lain, Git membuat satu merge commit. Jika hanya branch lain yang punya commit baru, Git cukup memajukan penunjuk branch (fast-forward). Jika branch lain tidak punya commit baru, merge tidak mengubah apa pun.

Rebase memindahkan commit Anda ke dasar yang baru. Git menulis ulang commit itu, sehingga setiap commit mendapat hash baru.

Pindah ke branch fitur, lalu rebase ke main:

```sh
git switch feature-branch
git rebase main
```

Jika terjadi konflik, selesaikan file yang bermasalah, tandai dengan `git add`, lalu lanjutkan:

```sh
git add <nama-file>
git rebase --continue
```

Batalkan rebase dengan `git rebase --abort`. Branch kembali ke kondisi sebelum rebase dimulai.

Jangan rebase commit yang sudah dipakai orang lain. Rekan yang sudah memakai commit lama harus menggabungkan ulang pekerjaannya.

Setelah rebase, push branch fitur dengan `--force-with-lease`:

```sh
git push --force-with-lease origin feature-branch
```

Perintah ini menolak push jika branch di remote berubah sejak terakhir Anda ambil dengan fetch.

## Rebase interaktif

Rebase interaktif merapikan beberapa commit terakhir sebelum Anda membagikannya.

```sh
git rebase -i HEAD~5
```

Git membuka editor dengan daftar commit. Ganti `pick` di depan commit yang ingin Anda ubah:

- `reword` (atau `r`): ubah pesan commit tanpa mengubah isinya.
- `edit` (atau `e`): berhenti di commit itu. Ubah file, jalankan `git commit --amend`, lalu `git rebase --continue`.
- `squash` (atau `s`): gabungkan ke commit sebelumnya dalam daftar. Git menyusun pesan gabungan, lalu membuka editor.
- `fixup` (atau `f`): sama seperti `squash`, tetapi pesan commit ini dibuang.
- `drop` (atau `d`): hapus commit.

Mengubah urutan baris di daftar juga mengubah urutan commit di riwayat Anda.

## Cherry-pick

Cherry-pick menyalin satu commit ke branch lain. Pakai cara ini saat Anda hanya butuh satu perubahan, bukan seluruh branch.

```sh
git switch main
git cherry-pick <hash-commit>
```

Git menolak cherry-pick bila perubahan lokal akan tertimpa oleh commit itu. Perubahan yang sudah masuk staging area juga membuat Git menolak, walaupun file-nya tidak disentuh commit itu. Commit atau simpan perubahan Anda ke stash dulu.

## Stash

Stash menyimpan perubahan yang belum di-commit. Cara ini membantu saat Anda harus pindah branch sebentar.

```sh
git stash
git stash list
git stash apply
git stash pop
```

- `git stash` menyimpan perubahan dan mengembalikan working tree ke kondisi commit terakhir.
- `git stash list` menampilkan semua entri stash.
- `git stash apply` menerapkan stash terbaru dan tetap menyimpannya di daftar.
- `git stash pop` menerapkan stash terbaru lalu menghapusnya dari daftar. Jika terjadi konflik, entri stash tetap ada.

Stash tidak menyertakan file baru yang belum dilacak. Tambahkan `-u` untuk menyertakannya:

```sh
git stash push -u
```

## Membatalkan perubahan

### Reset

`git reset --soft HEAD~1` membatalkan commit terakhir. Perubahan dari commit itu tetap di staging area, jadi Anda bisa langsung commit ulang.

```sh
git reset --soft HEAD~1
```

`git reset --hard HEAD~1` membatalkan commit terakhir dan menimpa semua file di working tree serta staging area dengan versi dari commit sebelumnya. Perubahan yang belum di-commit tidak tercatat di reflog, jadi reset ini membuangnya. Git juga bisa menimpa file yang belum dilacak.

```sh
git reset --hard HEAD~1
```

Commit atau simpan ke stash dulu pekerjaan yang belum di-commit sebelum menjalankan perintah ini.

### Reflog

Git mencatat setiap perpindahan HEAD dan branch di reflog. Commit yang terbuang oleh reset masih bisa diambil dari sana:

```sh
git reflog
git branch cadangan <hash-dari-reflog>
```

Git menghapus entri reflog yang sudah lebih dari 30 hari dan commit-nya tidak lagi bisa dijangkau dari ujung branch-nya. Entri lain dihapus setelah 90 hari. Penghapusan terjadi saat `git gc` berjalan.

### Revert

`git revert` membuat commit baru yang membatalkan commit lama. Riwayat lama tetap utuh, jadi cara ini cocok untuk commit yang sudah dibagikan.

```sh
git revert <hash-commit>
```

## Tag

Tag menandai titik tertentu, misalnya rilis versi. Gunakan tag beranotasi (`-a`) untuk rilis. Tag jenis ini menyimpan nama pembuat, tanggal, dan pesan.

```sh
git tag -a v1.0 -m "Rilis versi 1.0"
git push origin v1.0
```

Lihat semua tag dengan `git tag`. Hapus tag lokal dan tag di remote dengan dua perintah:

```sh
git tag -d v1.0
git push --delete origin v1.0
```

## Bisect untuk mencari commit yang merusak

`git bisect` mencari commit yang pertama kali memunculkan bug dengan pencarian biner. Anda menandai satu commit yang rusak dan satu commit yang masih benar.

```sh
git bisect start
git bisect bad
git bisect good <hash-commit-yang-masih-benar>
```

Git memilih commit di tengah. Uji kode di sana, lalu tandai hasilnya dengan `git bisect good` atau `git bisect bad`. Ulangi sampai Git menunjuk satu commit.

Untuk pengujian otomatis, jalankan skrip dengan `git bisect run`. Skrip harus keluar dengan kode 0 untuk commit yang benar. Kode 1 sampai 127, kecuali 125, berarti commit rusak. Kode 125 melewati commit itu. Kode di atas 127 membatalkan proses bisect.

```sh
git bisect run npm test
```

Dengan pnpm, pakai `git bisect run pnpm test`.

Setelah selesai, jalankan `git bisect reset` untuk kembali ke kondisi awal.

## Hook dengan Husky dan Commitlint

Hook adalah skrip yang dijalankan Git pada peristiwa tertentu, misalnya sebelum commit. Hook di `.git/hooks` hanya ada di mesin Anda, jadi rekan tim tidak otomatis mendapatkannya.

Contoh hook sederhana untuk memeriksa lint sebelum commit:

```sh {title=.git/hooks/pre-commit}
#!/bin/sh
npm run lint || { echo "Lint gagal, commit dibatalkan."; exit 1; }
```

Beri izin eksekusi dengan `chmod +x .git/hooks/pre-commit`. Git mengabaikan hook yang tidak bisa dieksekusi.

Dengan pnpm, ganti `npm run lint` pada baris kedua dengan `pnpm run lint`.

Husky menyimpan hook di folder `.husky` di dalam repositori, sehingga bisa dibagikan lewat commit. Untuk proyek Node.js, pasang Husky lalu jalankan inisialisasi:

```sh
npm install --save-dev husky
npx husky init
```

Dengan pnpm, pakai `pnpm add --save-dev husky`, lalu `pnpm exec husky init`.

`husky init` membuat `.husky/pre-commit` berisi `npm test`, atau `pnpm test` bila Anda memakai pnpm. Init juga menambahkan skrip `prepare` berisi `husky` ke `package.json`. Skrip itu memasang ulang Husky setiap kali `npm install` atau `pnpm install` berjalan.

Husky 9 menjalankan isi file hook sebagai perintah shell biasa. Tulis perintahnya langsung, tanpa shebang dan tanpa `chmod +x`. Contoh ini menggantikan isi `npm test` dengan `npm run lint`:

```sh
echo "npm run lint" > .husky/pre-commit
```

Dengan pnpm, pakai `echo "pnpm run lint" > .husky/pre-commit`.

Commitlint memeriksa pesan commit agar sesuai dengan format Conventional Commits. Pasang paketnya:

```sh
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Dengan pnpm, pakai `pnpm add --save-dev @commitlint/cli @commitlint/config-conventional`.

Commitlint 21 membutuhkan Node.js 22.12 atau lebih baru. Buat file konfigurasi:

```js {title=commitlint.config.js}
export default {
  extends: ['@commitlint/config-conventional'],
};
```

Lalu tambahkan hook `commit-msg` yang memeriksa pesan commit:

```sh
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

Git memberikan path file pesan commit sebagai argumen pertama. Perintah di atas meneruskannya ke Commitlint lewat `$1`. Commit dengan pesan yang tidak sesuai format akan ditolak.

Dengan pnpm, pakai `echo 'pnpm exec commitlint --edit $1' > .husky/commit-msg`.

## Repositori besar

Repositori dengan riwayat dan isi yang besar sering terasa lambat saat clone dan checkout.

Clone parsial hanya mengunduh isi file saat dibutuhkan. Perintah ini butuh server yang mendukung filter Git:

```sh
git clone --filter=blob:none <url-repositori>
```

Sparse-checkout hanya menampilkan folder yang Anda pilih di working tree:

```sh
git sparse-checkout set <nama-folder>
```

Perintah `git maintenance start` menjalankan tugas perawatan di latar belakang:

```sh
git maintenance start
```

Secara bawaan, `prefetch` dan `commit-graph` berjalan tiap jam. `loose-objects` dan `incremental-repack` berjalan tiap hari, dan `pack-refs` berjalan tiap minggu.

Git LFS menyimpan isi file biner besar, seperti file PSD, terpisah dari objek Git biasa. Pasang sekali per akun pengguna, lalu tandai pola file yang ingin disimpan dengan LFS:

```sh
git lfs install
git lfs track "*.psd"
```

Commit file `.gitattributes` yang dibuat `git lfs track`. File yang sudah ada di riwayat tidak berubah. Untuk mengubahnya, gunakan `git lfs migrate`. Perintah itu menulis ulang riwayat, jadi jalankan dengan hati-hati.

## Membersihkan repositori dengan git gc

`git gc` membersihkan objek yang tidak lagi dipakai dan merapikan penyimpanan repositori.

```sh
git gc
```

Jika perawatan latar belakang sudah berjalan lewat `git maintenance start`, jangan jalankan `git gc` bersamaan dengannya. Pakai `git maintenance run --task=gc` sebagai gantinya. `git gc` tidak mengambil kunci database objek dengan cara yang sama seperti `git maintenance run`.

Hindari `--prune=now` kecuali Anda yakin tidak ada proses Git lain yang sedang menulis ke repositori. Opsi ini menghapus objek tanpa masa tunggu dua minggu dan menambah risiko kerusakan.
