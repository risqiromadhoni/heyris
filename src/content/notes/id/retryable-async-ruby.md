---
title: "Jeda retry retryable-async tidak menahan task Async lain"
summary: "retryable-async menunggu dengan sleep biasa, dan di dalam task Async jeda itu hanya menahan task yang mencoba ulang."
date: 2026-11-14
topic: ruby
icon: arrows-clockwise
label: "Retry di Async"
tags: ["Ruby", "Async"]
tldr: "Di dalam task Async, jeda retry hanya menahan task yang sedang mencoba ulang. Gem ini memakai sleep biasa untuk jeda."
---

Saya menulis retryable-async, gem Ruby kecil untuk mengulang blok kode yang gagal. Gem ini bisa dipakai di dalam task Async.

## Apa yang ditambahkan gem ini

Secara bawaan, `Retryable::Async.run` mencoba blok sampai tiga kali. Jeda antar percobaan naik secara linear: 1 detik, lalu 2 detik. Jika percobaan ketiga juga gagal, error dilempar lagi ke pemanggil.

Anda bisa mengubah perilakunya dengan opsi berikut:

- `max_attempts` mengatur jumlah percobaan.
- `on` memilih exception yang dicoba ulang. Bawaannya semua `StandardError`.
- `base_delay` dan `backoff` mengatur jeda. Pilihan `backoff` adalah `:linear` atau `:exponential`.
- `jitter` mengacak jeda, antara 0,5 dan 1,5 kali nilai aslinya.
- `before_retry` menerima nomor percobaan yang gagal dan exception-nya, sebelum setiap percobaan ulang.

## Contoh dari README

Gem ini tidak bergantung pada async, jadi Anda memuat `async` sendiri.

```ruby
require 'async'
require 'retryable-async'

Async do
  Retryable::Async.run do
    puts "Doing something asynchronously..."
    raise "fail"
  end
end
```

Blok di contoh ini selalu gagal. Jadi ada dua jeda, 1 detik sebelum percobaan kedua dan 2 detik sebelum percobaan ketiga. Setelah itu, error dilempar lagi dari `Retryable::Async.run`.

## Jeda ini tidak menahan task lain

Penjelasan ini mengacu pada async 2.46.0, yang memerlukan Ruby 3.3 atau lebih baru.

Async menjalankan setiap task di atas fiber. Setiap jeda retry memanggil `sleep` biasa. Di dalam task Async, Ruby meneruskan `sleep` itu ke scheduler Async.

Scheduler hanya menunda fiber yang memanggil `sleep`. Task Async lain tetap bisa berjalan selama jeda retry.
