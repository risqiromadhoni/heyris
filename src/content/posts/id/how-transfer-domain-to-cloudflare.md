---
title: "Memindahkan domain ke Cloudflare Registrar"
summary: "Panduan memindahkan registrasi domain ke Cloudflare Registrar, sesuai dokumentasi Cloudflare per November 2026."
date: 2024-09-15
updated: 2026-11-14
topic: cloudflare
---

Domain harus aktif di Cloudflare sebelum Anda bisa memasukkan kode transfer. DNS pindah ke Cloudflare lebih dulu. Registrasinya baru pindah setelah transfer selesai.

Bagian yang Anda kerjakan sendiri memakan waktu sekitar 30 menit. Proses lengkapnya bisa sampai 10 hari, tergantung registrar lama. Langkah-langkahnya mengikuti [dokumentasi resmi Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/) yang terakhir diperbarui 29 Oktober 2026. Nama menu di dashboard bisa berbeda dari yang tertulis di sini, jadi ikuti dokumentasi itu jika tampilannya lain.

## Mengapa saya memakai Cloudflare

Saya memilih Cloudflare karena jaringannya tersebar di banyak kota, termasuk Jakarta. Untuk situs dengan anggaran kecil, fitur gratisnya membantu. Cloudflare memberi sertifikat SSL gratis untuk domain yang sudah aktif di sana. Perlindungan DDoS tersedia di semua paket, termasuk paket Free.

Cloudflare juga menyediakan fitur performa dan keamanan untuk situs Anda.

Cloudflare Registrar tidak menambah biaya di atas harga registry. Anda hanya membayar biaya registry dan ICANN.

## Sebelum memulai

Pastikan semua syarat ini terpenuhi.

:::checklist
- Akun Cloudflare: akun dengan email yang sudah diverifikasi dan metode pembayaran yang aktif.
- Umur domain: domain terdaftar minimal 60 hari lalu, dan belum dipindahkan dalam 60 hari terakhir.
- Data pemilik: nama, organisasi, atau email pemilik domain tidak berubah dalam 60 hari terakhir.
- Email pemilik: setelah transfer, email pemilik harus terverifikasi, karena ICANN mewajibkannya untuk domain di Cloudflare Registrar. Jika belum, atau verifikasinya kedaluwarsa, ICANN menahan domain dan mengganti nameserver dengan nameserver parkir. Nameserver kembali setelah verifikasi selesai.
- Registrar lama: akun masih aktif. Kalau domain sudah kedaluwarsa, perpanjang dulu di registrar lama.
- Domain yang baru kedaluwarsa: jika sudah diperpanjang, tunggu minimal 45 hari setelah tanggal kedaluwarsa awal sebelum transfer. Kalau tidak, registry mungkin tidak menambahkan perpanjangan satu tahun.
- Karakter domain: hanya huruf Latin, angka, dan tanda hubung. Domain dengan huruf non-Latin tidak didukung.
- DNS: domain memakai DNS Cloudflare. Selama terdaftar di Cloudflare Registrar, Anda tidak bisa memakai penyedia DNS lain.
:::

Cloudflare menyebut aturan 60 hari ini sebagai ketentuan ICANN. Menurut [Kebijakan Transfer ICANN](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy), registrar lama boleh menolak transfer dalam 60 hari setelah domain dibuat atau dipindahkan.

Kalau Anda memindahkan lebih dari satu domain, beri tahu bank Anda. Setiap domain dibebankan terpisah. Tagihan beruntun bisa memicu peringatan penipuan.

Domain .us punya syarat tambahan. Lihat [syarat untuk domain .us](https://developers.cloudflare.com/registrar/top-level-domains/us-domains/).

Tidak semua ekstensi domain bisa dipindahkan. Cloudflare Registrar mendukung lebih dari 400 TLD, dan daftar lengkapnya ada di [halaman TLD policies](https://www.cloudflare.com/tld-policies/). Per 14 November 2026, daftar itu tidak memuat .id. Domain .com, .net, dan .org termasuk yang didukung.

## Langkah 1: Tambahkan domain ke Cloudflare

Domain harus berstatus aktif di Cloudflare sebelum transfer dimulai. Tanpa status itu, kolom kode otorisasi tidak bisa dipakai.

### Matikan DNSSEC di registrar lama

Tanda tangan DNSSEC terikat pada penyedia DNS lama. Setelah nameserver pindah ke Cloudflare, tanda tangan itu tidak cocok lagi. Akibatnya, resolusi DNS bisa gagal dan domain tidak bisa aktif.

Ikuti langkah ini di registrar lama:

1. Cari pengaturan DNSSEC atau DS record. Jika tidak ada, lewati langkah ini.
2. Hapus atau nonaktifkan DNSSEC. Istilahnya kadang "DS records".
3. Tunggu minimal 24 jam sebelum mengganti nameserver.

DNSSEC yang masih aktif juga bisa menghalangi transfer registrasi.

### Tambahkan domain dan ganti nameserver

Di dashboard Cloudflare, tambahkan domain Anda. Ikuti [panduan pengaturan DNS Cloudflare](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) untuk meninjau record DNS. Cloudflare bisa memindai record DNS secara otomatis, tetapi pemindaian itu tidak dijamin menemukan semua record. Periksa juga record untuk web host atau layanan email Anda sebelum mengganti nameserver.

Setelah itu, ganti nameserver di registrar lama dengan nameserver yang diberikan Cloudflare. Cara mengganti nameserver berbeda di tiap registrar. Panduannya ada di [dokumentasi nameserver Cloudflare](https://developers.cloudflare.com/dns/nameservers/update-nameservers/).

### Tunggu domain aktif

Di dashboard Cloudflare, status domain berubah dari Pending menjadi Active. Biasanya prosesnya hanya beberapa menit, tetapi bisa sampai 24 jam. Jika status masih Pending lebih dari 24 jam, cek lagi nameserver di registrar lama. Pastikan DNSSEC juga sudah mati.

Cek nameserver dengan perintah ini. Ganti `example.com` dengan domain Anda:

```sh
dig ns example.com @1.1.1.1
```

Jika nameserver yang muncul cocok dengan yang diberikan Cloudflare, perubahan sudah tersebar. Kalau tidak punya `dig`, pakai `nslookup -type=ns example.com 1.1.1.1`.

## Langkah 2: Transfer registrasi

Proses ini bolak-balik antara registrar lama dan Cloudflare. Anda membuka kunci domain, mengambil kode, lalu menyetujui transfer di registrar lama.

### Buka kunci domain

Di registrar lama, nonaktifkan registrar lock. Istilah lainnya domain lock atau transfer lock. Di WHOIS, kunci ini terlihat sebagai `clientTransferProhibited`.

Sebagian registrar punya beberapa kunci, misalnya domain lock dan privacy lock. Nonaktifkan semuanya. Kalau domain masih terkunci, periksa pengaturan lain.

### Minta kode otorisasi

Di registrar lama, minta kode otorisasi. Kode ini juga disebut auth code, EPP code, authinfo code, atau transfer code. Cloudflare memakainya untuk memastikan pemilik domain menyetujui transfer.

Kode biasanya hanya berlaku sebentar, jadi minta kode saat Anda siap memasukkannya. Jika registrar tidak menyediakan cara bagi Anda membuat kode sendiri, registrar wajib memberikannya dalam 5 hari kalender setelah diminta. Aturannya ada di [Kebijakan Transfer ICANN](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy), bagian 5.2.

Setiap registrar punya menu sendiri. Di Hostinger, misalnya, kode ada di bagian Domain Overview. Lihat [panduan EPP code dari Hostinger](https://www.hostinger.com/support/1583203-how-to-get-the-epp-code-at-hostinger/).

### Masukkan kode di Cloudflare

Di dashboard Cloudflare, buka halaman Transfer domains. Pilih domain, lalu masukkan kode otorisasi.

Untuk sebagian besar domain generik seperti .com, .net, dan .org, transfer sudah mencakup perpanjangan satu tahun. Perpanjangan itu dihitung dari tanggal kedaluwarsa saat ini. Aturan ini berasal dari ICANN untuk transfer gTLD.

Domain negara seperti .uk punya aturan sendiri. Untuk .uk, transfer tidak menambah tahun dan tidak dikenai biaya transfer.

Pastikan metode pembayaran valid sebelum Anda mengirim kode. Pembayaran yang gagal setelah kode dikirim bisa membuat transfer berhenti di tengah jalan.

Isi informasi kontak, lalu pilih Confirm transfer untuk menyetujui syarat layanan. Cloudflare menyembunyikan data ini dari WHOIS publik secara default. ICANN tetap mewajibkan data yang akurat. Data yang salah bisa membuat domain ditangguhkan.

Untuk domain .ca, .mx, dan .nz, Anda mungkin menerima email terpisah untuk memverifikasi data kontak setelah transfer selesai. Jika verifikasi tidak selesai dalam batas waktunya, domain bisa ditangguhkan.

### Setujui di registrar lama

Setelah Anda mengirim, Cloudflare memproses permintaan. Cloudflare juga mengirim email Form of Authorization (FOA) ke pemilik domain. Email ini dikirim jika data pemilik tersedia di WHOIS publik. Registrar lama juga mengirim email konfirmasi.

Setujui lewat email atau dashboard registrar lama. Kebanyakan registrar memproses dalam 5 hari kerja. Untuk .mx, bisa sampai 10 hari kerja.

Pantau statusnya di halaman Transfer domains:

- Transfer in progress: Cloudflare sudah mengirim permintaan ke registrar lama. Jika status ini bertahan lebih dari 24 jam, pastikan domain sudah tidak terkunci.
- Pending approval: registrar lama sudah menerima permintaan dan bisa butuh sampai 5 hari untuk melepas domain. Setujui lewat email atau dashboard untuk mempercepat.
- Transfer rejected: registrar lama menolak permintaan. Pilih Retry untuk mengirim permintaan baru.

## Kalau domain ada di Shopify atau Block

Platform seperti Shopify dan Block sering juga bertindak sebagai registrar. Platform ini biasanya tidak mengizinkan ganti nameserver. Dalam kondisi itu, transfer langsung ke Cloudflare tidak bisa dilakukan.

Anda perlu memindahkan domain dua kali:

1. Ambil kode transfer dari platform Anda, lalu transfer domain ke registrar lain yang mengizinkan ganti nameserver. Proses ini biasanya memakan waktu 3 sampai 5 hari.
2. Ganti nameserver ke Cloudflare. Anda bisa langsung memakai CDN, DNS, dan fitur keamanan Cloudflare setelah langkah ini.
3. Setelah 60 hari, transfer registrasi ke Cloudflare lewat halaman Transfer domains.

Setiap transfer menambah satu tahun ke registrasi. Anda membayar registrar lain untuk transfer pertama, dan Cloudflare untuk transfer kedua. Kalau Anda hanya ingin memakai DNS dan fitur Cloudflare, cukup berhenti setelah nameserver diganti.

## Setelah transfer

Kelola domain yang sudah pindah di halaman Manage domains.

### Aktifkan lagi DNSSEC

DNSSEC di Cloudflare bisa diaktifkan dengan satu klik, dan fiturnya gratis. Buka Manage domains, pilih domain, lalu pilih Configuration > Enable DNSSEC. Setelah Anda mengaktifkannya, prosesnya bisa memakan waktu satu sampai dua hari. Jangan langsung menganggap ada yang gagal.

### Cek perpanjangan

Auto-renew aktif secara default. Cloudflare mencoba memperpanjang domain sekitar 30 hari sebelum kedaluwarsa, dengan harga resmi registry. Kalau tidak ingin memperpanjang, matikan auto-renew paling lambat 30 hari sebelum kedaluwarsa. Perpanjangan yang sudah dibayar tidak bisa dikembalikan.

### Data pribadi di WHOIS

Untuk domain yang terdaftar di Cloudflare Registrar, nama, email, dan alamat pemilik tidak tampil di WHOIS publik. Fitur ini gratis. Negara dan provinsi tetap terlihat karena aturan ICANN.
