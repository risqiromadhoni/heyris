---
title: "Cara kerja nameserver dari nama domain sampai alamat IP"
summary: "Pencarian DNS melewati resolver, server root, server TLD, lalu nameserver otoritatif sampai mendapat alamat IP."
date: 2024-09-12
updated: 2026-11-14
topic: networking
---

Saat Anda membuka `www.example.com` di browser, perangkat belum tahu alamat IP situs itu. Nama domain harus diubah dulu menjadi alamat IP. Proses ini disebut resolusi DNS (Domain Name System). Nameserver adalah server yang menjalankannya.

Istilah nameserver dipakai untuk dua peran yang berbeda. Resolver rekursif mencari jawaban untuk perangkat Anda. Nameserver otoritatif menyimpan data resmi milik domain itu.

## Langkah saat Anda membuka situs

Pencarian DNS yang tidak ditemukan di cache biasanya melewati empat jenis server.

### Cek cache di perangkat

Browser dan sistem operasi biasanya menyimpan hasil pencarian DNS sementara. Kalau alamat IP sudah ada di cache, perangkat langsung memakainya. Selama masa berlakunya belum habis, tidak ada permintaan baru ke server.

Kalau tidak ada di cache, permintaan diteruskan ke stub resolver. Stub resolver adalah bagian sederhana di sistem operasi yang tidak bisa mencari sendiri. Ia lalu meneruskannya ke resolver rekursif.

### Resolver rekursif menerima permintaan

Resolver rekursif mencari jawaban atas nama perangkat Anda. Biasanya resolver ini disediakan ISP, atau layanan DNS publik seperti `1.1.1.1` dari Cloudflare dan `8.8.8.8` dari Google. Kalau jawabannya sudah ada di cache resolver, ia langsung membalas. Kalau belum, ia mulai bertanya ke root server.

### Root server menunjuk server TLD

Ada 13 nama root server, dari `a.root-servers.net` sampai `m.root-servers.net`. Ketiga belas nama itu didukung banyak server yang tersebar di berbagai negara. Anda bisa melihat lokasinya di [daftar server root](https://root-servers.org/). Root server tidak menyimpan alamat IP situs. Ia hanya menunjuk server TLD (top-level domain) sesuai ekstensi domain, misalnya .com.

### Server TLD menunjuk nameserver otoritatif

Server TLD menyimpan daftar nameserver untuk semua domain dengan ekstensi yang sama, misalnya .com. Untuk example.com, server .com menjawab dengan daftar nameserver milik domain itu. Server TLD tidak menyimpan alamat IP situs itu.

### Nameserver otoritatif memberi alamat IP

Nameserver otoritatif menyimpan catatan resmi untuk domain itu. Ia membalas dengan catatan A, yaitu alamat IPv4 situs. Kalau nama yang dicari adalah alias (CNAME), resolver mengulang pencarian untuk nama tujuan alias itu. Resolver lalu mengirim alamat IP ke perangkat, dan browser memakainya untuk terhubung ke server web.

## Jenis catatan DNS yang sering dipakai

Nameserver otoritatif menyimpan catatan DNS, sedangkan resolver hanya menyimpan salinan sementara. Catatan yang paling sering dipakai:

- `A`: alamat IPv4 untuk nama domain
- `AAAA`: alamat IPv6 untuk nama domain
- `CNAME`: alias yang mengarah ke nama lain, dan tidak berisi alamat IP
- `MX`: server tujuan email untuk domain itu
- `TXT`: teks biasa, yang sering dipakai untuk verifikasi kepemilikan domain dan keamanan email
- `NS`: nameserver yang bertanggung jawab atas domain itu

## TTL dan alasan perubahan DNS butuh waktu

TTL (time to live) adalah batas waktu, dalam detik, sebuah catatan boleh disimpan di cache. [RFC 2181 tentang klarifikasi DNS](https://www.rfc-editor.org/rfc/rfc2181) menegaskan bahwa TTL adalah batas maksimal, bukan waktu wajib. Resolver boleh menyimpan catatan lebih singkat, dan boleh membatasi TTL yang terlalu besar.

Yang disebut propagasi DNS sebenarnya adalah cache di banyak resolver yang habis masa berlakunya pada waktu berbeda-beda. Resolver yang sudah menyimpan jawaban lama memakainya sampai TTL-nya habis, lalu bertanya lagi ke nameserver otoritatif.

### Perubahan isi catatan

Kalau Anda mengubah alamat IP atau nilai CNAME, tunggu sampai TTL lama habis. Mengubah TTL pada saat yang sama tidak membantu, karena cache yang sudah ada tetap memakai TTL lama. Untuk migrasi yang sudah dijadwalkan, turunkan TTL lebih dulu. [Panduan persiapan migrasi DNS dari Cloudflare](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/) menyarankan jeda setidaknya 24 sampai 48 jam, atau lebih lama, sebelum migrasi dimulai. Idealnya, jeda itu sama dengan TTL terpanjang yang sedang berlaku. Panduan yang sama juga menyebut 300 detik (5 menit) sebagai TTL pendek yang umum untuk migrasi.

### Perubahan nameserver di registrar

Mengganti nameserver di registrar mengubah delegasi di server TLD, bukan isi zona domain. Untuk example.com, server .com memberi TTL 172.800 detik (48 jam) untuk daftar nameserver domain itu. Cloudflare menyarankan Anda menunggu hingga 24 jam selama registrar memperbarui nameserver. Waktu tunggu bergantung pada TTL itu dan pada proses registrar.

Panel registrar hanya menunjukkan apa yang Anda minta. Untuk melihat apa yang sudah dipublikasikan server TLD, gunakan `dig` seperti di bagian akhir artikel ini.

### Kalau domain memakai DNSSEC

DNSSEC menambahkan tanda tangan kriptografi pada catatan DNS. Tanda tangan itu membantu resolver memastikan data berasal dari pemilik zona dan tidak diubah selama perjalanan. Mengganti nameserver saat DNSSEC masih aktif bisa membuat domain tidak bisa diakses. Karena itu, matikan DNSSEC di registrar dengan menghapus catatan DS lebih dulu. Setelah itu, tunggu sampai TTL catatan DS habis di server TLD, baru ganti nameserver. [Panduan persiapan migrasi DNS dari Cloudflare](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/) menyarankan menunggu setidaknya sepanjang TTL itu, dan sebaiknya hingga 1,5 kali lipatnya. TTL catatan DS yang umum adalah 86.400 detik (24 jam).

## Beberapa nameserver untuk satu domain

Spesifikasi DNS dan aturan pendaftaran domain mewajibkan minimal dua server untuk setiap zona. [RFC 2182 tentang server DNS sekunder](https://www.rfc-editor.org/rfc/rfc2182) membahas cara memilih dan mengelola server itu. RFC ini juga menganjurkan lebih dari dua server. Saat salah satu server tidak tersedia, zona dengan dua server hanya didukung satu server yang aktif.

Istilah primary dan secondary sering disalahpahami sebagai server utama dan server cadangan. Keduanya sebenarnya menjelaskan asal salinan data zona lewat transfer zona. Bagi resolver, semua nameserver yang terdaftar setara. Resolver sering mengukur kinerja tiap server, lalu lebih sering memakai server yang dianggap terbaik. Kalau satu server tidak menjawab, resolver mencoba server lain.

## Cek sendiri dengan dig

Ganti `example.com` dengan domain Anda sendiri. Perintah `dig` tersedia di macOS. Di Linux, `dig` biasanya ada di paket BIND, misalnya `bind9-dnsutils` di Ubuntu. Di Windows, gunakan `nslookup`, misalnya `nslookup -type=ns example.com 1.1.1.1`.

Mulai dari nameserver domain itu:

```bash
dig +short NS example.com
```

Perintah ini menelusuri jalur dari root server sampai ke catatan A:

```bash
dig +trace example.com
```

Setiap blok hasil berasal dari satu langkah pencarian. Blok terakhir berisi catatan A.

Angka kedua pada setiap baris catatan adalah TTL dalam detik. Jalankan perintah ini ke resolver publik, lalu ulangi beberapa detik kemudian:

```bash
dig @1.1.1.1 example.com A +noall +answer
```

Angka TTL biasanya turun karena resolver menghitung sisa masa cache.

Untuk melihat jawaban langsung dari nameserver otoritatif, tanya nameserver itu langsung. Jawabannya tidak berasal dari cache resolver. Ganti `elliott.ns.cloudflare.com` dengan salah satu nameserver dari perintah pertama:

```bash
dig @elliott.ns.cloudflare.com example.com A +noall +answer
```

Setelah mengganti nameserver di registrar, periksa apa yang dipublikasikan server TLD:

```bash
dig +trace example.com NS +noall +authority +nodnssec
```

Kalau hasilnya masih menunjuk nameserver lama, perubahan di registrar belum sampai ke server TLD. Tunggu, lalu cek lagi.
