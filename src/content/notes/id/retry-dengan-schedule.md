---
title: "Retry dengan Schedule di Effect v4"
summary: "Jeda eksponensial plus jitter, tanpa menulis loop sendiri."
date: 2026-11-12
topic: effect
icon: arrows-clockwise
label: "Retry dengan Schedule"
tags: ["Effect", "Schedule", "Retry"]
tldr: "Gabungkan Schedule.exponential dengan jitter, lalu batasi jumlah percobaan. Jangan menulis loop retry sendiri."
---

Request ke layanan luar sering gagal sesaat. Di Effect v4, retry cukup satu argumen: sebuah Schedule yang menjelaskan jeda dan batas percobaan.

## Polanya

```ts {title=retry.ts}
const policy = Schedule.exponential("200 millis").pipe(
  Schedule.jittered,
  Schedule.compose(Schedule.recurs(4))
)

const program = fetchUser(id).pipe(Effect.retry(policy))
```

Jitter mencegah banyak klien mencoba ulang di detik yang sama. recurs(4) membuat total percobaan tetap terbatas, jadi kegagalan permanen tidak menggantung.

## Yang perlu diingat

1. Retry hanya untuk kegagalan sementara. Filter dulu dengan while atau until.
2. Catat jumlah percobaan di log agar lonjakan error mudah terlihat.
3. Uji dengan TestClock supaya tes tidak benar-benar menunggu.
