---
title: "Git untuk pemula: istilah dan perintah dasar"
summary: "Istilah dasar Git dan perintah yang Anda perlukan untuk mulai melacak perubahan kode."
date: 2024-10-01
topic: git
---

Git adalah sistem kontrol versi terdistribusi (DVCS). Git membantu developer melacak perubahan kode selama mengembangkan perangkat lunak.

Komunitas pengembang Linux, terutama Linus Torvalds, membuat Git pada 2005 untuk mengelola pengembangan kernel Linux. Git dibuat karena BitKeeper, alat yang dipakai proyek kernel sejak 2002, tidak lagi gratis. Git banyak dipakai hingga sekarang.

## Mengapa memakai Git

1. Git mencatat perubahan dari waktu ke waktu. Anda bisa kembali ke versi lama jika perlu.
2. Beberapa developer bisa bekerja di proyek yang sama bersamaan. Git menggabungkan perubahan yang tidak saling bertabrakan. Jika dua perubahan menyentuh baris yang sama, Git menandainya sebagai konflik.
3. Branch memisahkan pekerjaan. Anda bisa mengerjakan fitur di branch sendiri, lalu menggabungkannya saat siap.
4. Setiap developer punya salinan lengkap repository beserta riwayatnya. Anda tetap bisa membuat commit tanpa koneksi ke server.
5. Git dirancang agar cepat, termasuk untuk proyek besar.

## Istilah dasar Git

- Repository atau repo: folder proyek yang Git lacak, beserta seluruh riwayat perubahannya.
- Commit: satu titik dalam riwayat Git. Setiap commit menyimpan keadaan file pada saat itu dan punya ID unik.
- Branch: jalur pengembangan.
- Merge: menggabungkan perubahan dari satu branch ke branch lain.
- Remote: repository yang berada di tempat lain, misalnya di GitHub atau GitLab.
- Clone: membuat salinan lengkap repository remote di komputer Anda.
- Pull: mengambil perubahan dari remote dan memasukkannya ke branch aktif.
- Push: mengirim commit dari branch lokal ke remote.

## Memasang Git

Cek dulu apakah Git sudah ada di komputer Anda:

```bash
git --version
```

Jika perintah itu tidak menampilkan nomor versi, pasang Git sesuai sistem operasi Anda:

- Windows: unduh installer dari [halaman unduh Git untuk Windows](https://git-scm.com/install/windows), lalu jalankan.
- macOS: jalankan `xcode-select --install` untuk memasang Xcode Command Line Tools. Atau jalankan `brew install git` jika Anda memakai Homebrew.
- Linux: di Debian dan Ubuntu, jalankan `sudo apt install git`. Di Fedora, jalankan `sudo dnf install git`. Distribusi lain punya perintah sendiri. Lihat [halaman unduh Git untuk Linux](https://git-scm.com/install/linux).

## Mengatur Git

Sebelum memakai Git, isi nama dan email Anda. Git menyimpan keduanya di setiap commit.

```bash
git config --global user.name "Nama Anda"
git config --global user.email "nama@example.com"
```

Atur juga nama branch awal menjadi `main`:

```bash
git config --global init.defaultBranch main
```

Tanpa pengaturan ini, Git memakai `master` sebagai nama branch awal. Git 3.0 akan memakai `main` secara bawaan, tetapi tanggal rilisnya belum ditetapkan.

## Perintah dasar Git

### Membuat repository baru

Masuk ke folder proyek, lalu jalankan:

```bash
git init
```

Git membuat folder tersembunyi bernama `.git`. Folder itu menyimpan seluruh riwayat proyek.

### Menyalin repository dari remote

```bash
git clone https://github.com/nama-akun/nama-repo.git
```

Perintah ini membuat folder baru bernama `nama-repo` yang berisi salinan repository tersebut.

### Melihat status

```bash
git status
```

Perintah ini menampilkan branch aktif dan file yang berubah sejak commit terakhir.

### Menyiapkan dan menyimpan perubahan

Jalankan `git add` untuk memasukkan file ke staging area, yaitu daftar perubahan yang akan masuk ke commit berikutnya. Lalu jalankan `git commit` untuk menyimpan semua isi staging area sebagai satu commit:

```bash
git add README.md
git commit -m "Tambah README"
```

Ganti `README.md` dengan nama file yang Anda ubah. Tulis pesan commit yang menjelaskan perubahannya.

### Melihat riwayat commit

```bash
git log
git log --oneline
```

`git log` menampilkan seluruh riwayat. `git log --oneline` menampilkan satu baris untuk setiap commit.

### Membuat dan berpindah branch

Buat branch baru, lalu pindah ke branch itu:

```bash
git branch fitur-login
git switch fitur-login
```

Atau buat dan pindah sekaligus:

```bash
git switch -c fitur-login
```

`git switch` khusus untuk pindah branch. `git checkout` masih bisa dipakai, misalnya `git checkout -b fitur-login` untuk membuat dan pindah sekaligus.

### Menggabungkan branch

Pindah ke `main`, lalu gabungkan branch fitur:

```bash
git switch main
git merge fitur-login
```

Jika dua branch mengubah baris yang sama di satu file, Git berhenti dan menandai konflik. Buka file itu dan pilih isi yang benar. Hapus tanda konflik, yaitu `<<<<<<<`, `=======`, dan `>>>>>>>`. Lalu jalankan `git add` dan `git commit`.

### Menghubungkan ke remote

Ganti URL dengan alamat repository Anda:

```bash
git remote add origin https://github.com/nama-akun/nama-repo.git
```

Kirim branch `main` ke remote untuk pertama kali. Opsi `-u` menghubungkan branch lokal dengan branch remote:

```bash
git push -u origin main
```

Jika Git meminta kata sandi saat push lewat HTTPS, pakai [token akses pribadi GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) sebagai gantinya.

Setelah itu, cukup jalankan `git push`. Jika remote punya commit yang belum ada di komputer Anda, push ditolak. Jalankan `git pull` dulu, lalu coba lagi. Jika `git pull` berhenti karena riwayat sudah bercabang, lihat bagian berikutnya.

### Mengambil perubahan dari remote

```bash
git pull origin main
```

Pull mengambil commit baru dari remote dan menerapkannya di branch aktif. Jika hanya remote yang punya commit baru, Git langsung memajukan branch Anda (fast-forward).

Jika riwayat lokal dan remote sudah bercabang, Git berhenti dan meminta Anda memilih cara menggabungkannya. Untuk satu kali pull, pakai merge:

```bash
git pull --no-rebase origin main
```

Untuk memakai merge di setiap pull, atur sekali:

```bash
git config --global pull.rebase false
```

Untuk materi yang lebih lengkap, baca [buku Pro Git dalam bahasa Indonesia](https://git-scm.com/book/id/v2) di situs resmi Git. Edisi ini baru sebagian diterjemahkan. Subbab 1.1 dan 1.2 sudah berbahasa Indonesia, tetapi subbab 2.2 dan 3.1 masih berbahasa Inggris.

Terbit pertama kali pada 1 Oktober 2024. Diperbarui pada 14 November 2026.
