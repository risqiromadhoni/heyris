---
title: "Internet: dari alamat IP sampai HTTPS"
summary: "Penjelasan singkat tentang IP, DNS, TCP, HTTP, dan TLS yang perlu dipahami saat membangun aplikasi web."
date: 2024-09-10
updated: 2026-11-14
topic: networking
---

Jaringan adalah sekumpulan komputer dan perangkat yang saling terhubung. Rumah Anda bisa punya jaringan sendiri, begitu juga tetangga Anda. Saat jaringan-jaringan itu saling terhubung, terbentuklah internet.

## Apa itu internet

Internet berawal dari ARPANET, jaringan riset yang didanai ARPA (sekarang DARPA) di bawah Departemen Pertahanan Amerika Serikat. ARPANET pertama kali tersambung pada September 1969. Pada 1 Januari 1983, ARPANET beralih dari protokol lamanya, NCP, ke TCP/IP.

Menurut [laporan ITU edisi 2026](https://www.itu.int/itu-d/reports/statistics/facts-figures-2026/), sekitar 6,3 miliar orang, atau 76%, memakai internet pada 2026. Meski begitu, 2 miliar orang masih belum terhubung.

## Cara kerja internet

Perangkat saling bertukar data lewat protokol. Protokol adalah aturan standar tentang cara data dikirim dan diterima. Karena aturannya sama, perangkat dari pembuat yang berbeda bisa saling berkomunikasi.

Pengirim memecah data menjadi paket kecil. Router meneruskan setiap paket ke router berikutnya sampai paket tiba di tujuan.

Protokol yang paling sering Anda temui saat membangun aplikasi web:

- IP (Internet Protocol): mengarahkan paket ke alamat tujuannya.
- TCP (Transmission Control Protocol) dan UDP (User Datagram Protocol): mengatur cara paket dikirim antara dua perangkat.
- DNS (Domain Name System): menerjemahkan nama domain menjadi alamat IP dan data lain.
- HTTP (Hypertext Transfer Protocol): mengatur pertukaran data antara browser dan server.
- TLS (Transport Layer Security): mengamankan koneksi. SSL (Secure Sockets Layer) adalah pendahulunya dan sudah tidak boleh dipakai.

## Alamat IP dan nama domain

Setiap perangkat di jaringan punya alamat IP. Alamat IPv4 memakai 32 bit. IPv6 memakai 128 bit, sehingga ruang alamatnya jauh lebih besar.

Nama domain seperti `google.com` lebih mudah diingat daripada alamat IP. DNS menyimpan data untuk setiap nama domain. Yang paling sering dicari adalah alamat IP-nya.

Saat Anda membuka situs lewat nama domainnya, perangkat meminta alamat IP-nya ke resolver DNS rekursif. Resolver itu mencari sampai dapat jawabannya. Resolver menyimpan hasilnya sementara (cache), sehingga pencarian berikutnya lebih cepat.

## TCP, UDP, dan port

TCP memberi aliran data yang andal dan berurutan. TCP memakai nomor urut untuk mendeteksi paket yang hilang, dan checksum untuk mendeteksi kesalahan. TCP mengirim ulang data yang hilang.

UDP tidak menjamin pengiriman dan tidak mencegah paket ganda. DNS memakai UDP port 53 untuk query dan jawaban yang pendek, dan TCP port 53 untuk jawaban yang lebih panjang. HTTP/3 juga berjalan di atas UDP, lewat QUIC, seperti diatur dalam [spesifikasi HTTP/3 (RFC 9114)](https://www.rfc-editor.org/rfc/rfc9114.txt).

Port menandai layanan atau aplikasi di dalam satu perangkat. Port memakai 16 bit, dari 0 sampai 65.535. IANA (Internet Assigned Numbers Authority) membagi rentang port menjadi tiga, sesuai [aturan pengelolaan port di RFC 6335](https://www.rfc-editor.org/rfc/rfc6335.txt):

- 0 sampai 1.023 untuk layanan sistem
- 1.024 sampai 49.151 untuk port pengguna (terdaftar di IANA)
- 49.152 sampai 65.535 untuk port dinamis

Socket adalah gabungan alamat IP dan port. Dua socket membentuk satu koneksi TCP, satu di setiap ujung.

## HTTP dan HTTPS

HTTP mengatur cara browser meminta data dan cara server membalasnya. HTTPS adalah HTTP yang dienkripsi dengan TLS.

Pada Juli 2018, [Chrome mulai menandai halaman HTTP](https://blog.google/products-and-platforms/products/chrome/milestone-chrome-security-marking-http-not-secure/) sebagai "Not secure". Pada September 2023, Chrome 117 di desktop [mengganti ikon gembok](https://blog.chromium.org/2023/05/an-update-on-lock-icon.html) di bilah alamat dengan ikon "tune" yang membuka pengaturan situs. Pada Oktober 2025, [Google mengumumkan](https://blog.google/security/https-by-defau/) bahwa Chrome akan meminta izin sebelum membuka situs publik tanpa HTTPS. Menurut [catatan rilis Chrome](https://developer.chrome.com/release-notes/154), versi stabil yang memuat perubahan ini terbit pada 22 September 2026. Di versi itu, Chrome meminta izin secara bawaan saat Anda membuka situs lewat koneksi HTTP.

HTTP/2 dibakukan pada Mei 2015 sebagai RFC 7540. RFC 9113 terbit pada Juni 2022 dan menggantikannya. HTTP/2 mengirim beberapa permintaan sekaligus dalam satu koneksi TCP, dan header-nya juga dikompres. Namun, head-of-line blocking di tingkat TCP tetap ada.

HTTP/3 dibakukan pada Juni 2022. Setiap aliran di QUIC berjalan sendiri, jadi paket yang hilang hanya menahan aliran yang datanya ada di paket itu. QUIC memakai [TLS 1.3 (RFC 8446)](https://www.rfc-editor.org/rfc/rfc8446.txt) untuk mengamankan koneksinya.

## TLS dan sertifikat

TLS dirancang untuk mencegah penyadapan, perubahan isi, dan pemalsuan pesan. Koneksi TLS dimulai dengan handshake. Kedua pihak menyepakati versi protokol dan algoritma, lalu membuat kunci bersama. Setelah itu, data dikirim dalam bentuk terenkripsi.

Sertifikat membuktikan identitas server. Browser memeriksa sertifikat itu melalui otoritas sertifikat tepercaya.

TLS 1.3 dibakukan pada Agustus 2018. TLS 1.0 dan TLS 1.1 tidak boleh dipakai lagi, sesuai [dokumen penghentian TLS 1.0 dan 1.1 (RFC 8996)](https://www.rfc-editor.org/rfc/rfc8996.txt). Untuk server, matikan SSL, TLS 1.0, dan TLS 1.1, lalu pasang sertifikat yang valid.

## Apa itu Web3

Menurut [halaman Web3 di ethereum.org](https://ethereum.org/web3/), Web3 adalah istilah payung untuk visi internet baru yang lebih baik. Intinya, Web3 memakai blockchain, mata uang kripto, dan NFT untuk mengembalikan kuasa kepada pengguna dalam bentuk kepemilikan. Menurut halaman yang sama, banyak bagian internet kini dikuasai dan dimiliki entitas terpusat. Di Web3, kepemilikannya tersebar di antara pembangun dan penggunanya. Gavin Wood, salah satu pendiri Ethereum, memperkenalkan istilah ini pada 2014.
