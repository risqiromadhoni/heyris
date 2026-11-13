---
title: "Chat terbalik dengan TanStack Virtual"
summary: "Dengan TanStack Virtual 3.13.4, demo ini membalik wadah gulir supaya pesan dengan waktu paling akhir ada di bawah, lalu mengukur tinggi tiap pesan."
date: 2026-11-14
topic: react
icon: code
label: "Chat terbalik"
tags: ["React", "TanStack Virtual"]
tldr: "Di TanStack Virtual 3.13.4, demo membalik wadah dan setiap baris dengan scaleY(-1). Panduan saat ini memakai wadah biasa dengan anchorTo: 'end'."
---

[Demo tanstack-virtual-chat](https://github.com/risqiromadhoni/tanstack-virtual-chat) memakai `@tanstack/react-virtual` 3.13.4 untuk membuat daftar chat. Pesan dengan waktu paling akhir ada di bawah. Saya membuatnya dengan Next.js 15 dan React 19.

## Dibalik sekali, lalu dibalik lagi

Demo memberi wadah gulir `scaleY(-1)`, sehingga isinya terbalik secara vertikal. Setiap baris dibalik lagi supaya teksnya tetap tegak. Demo mengurutkan data menurun berdasarkan jam dan menit. Jadi indeks 0, pesan dengan waktu paling akhir, tampil paling bawah.

```tsx {title=src/app/_components/Chats.tsx}
<div ref={scrollRef} className="relative flex-1 w-full overflow-y-auto" style={{ transform: "scaleY(-1)" }}>
  <ul className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
    {rowVirtualizerItems.map((rowVirtualizerItem) => (
      <li
        key={rowVirtualizerItem.key}
        data-index={rowVirtualizerItem.index}
        ref={rowVirtualizer.measureElement}
        className="absolute top-0 left-0 w-full"
        style={{ transform: `translateY(${rowVirtualizerItem.start}px) scaleY(-1)` }}
      >
        {/* ... */}
      </li>
    ))}
  </ul>
</div>
```

Potongan ini diringkas dan tidak menampilkan `className` dan `style` yang diteruskan dari props, `...props`, pencarian `chats.find`, atau `<ChatBox>`.

Wadah yang dibalik membuat gulir bawaan browser terbalik. Saat roda digulir ke bawah, `scrollTop` naik, sehingga isi malah bergeser turun di layar. Pada daftar biasa, isi bergeser ke atas saat roda digulir ke bawah.

Karena itu, demo memasang listener `wheel`. Listener itu memakai `passive: false`, memanggil `preventDefault()`, lalu mengurangi `scrollTop` dengan `deltaY`. Dengan begitu, saat roda digulir ke bawah, isi bergeser ke atas menuju pesan dengan waktu paling akhir.

## Tinggi pesan tidak sama

Panjang pesan berbeda-beda, jadi tinggi barisnya tidak tetap. `estimateSize` memberi perkiraan awal, yaitu 50 piksel. Setelah baris dirender, `measureElement` yang dipasang di `ref` mengukur tinggi aslinya. TanStack Virtual juga meminta atribut `data-index` di elemen itu.

## Yang tidak ada di demo

Demo tidak memanggil `scrollToIndex` atau `scrollToOffset`. Karena wadahnya dibalik, posisi gulir nol ada di bawah. Jadi, tampilan awal sudah menampilkan pesan dengan waktu paling akhir. Demo juga memuat pesan sekali di server dari endpoint `/api/chats`, yang mengembalikan 2000 pesan. Tidak ada pesan lama yang dimuat saat Anda menggulir ke atas.

## Panduan saat ini tanpa pembalikan

Versi 3.13.4 belum punya opsi `anchorTo: 'end'`. Opsi itu ada di `@tanstack/react-virtual` 3.14.26, lewat `@tanstack/virtual-core` 3.19.11.

[Panduan chat TanStack Virtual](https://tanstack.com/virtual/latest/docs/chat) memakai wadah gulir biasa dengan urutan item biasa. Anda tidak perlu `flex-direction: column-reverse` atau transformasi terbalik. Panduan itu memakai `anchorTo: 'end'`, memanggil `scrollToEnd()` setelah wadah gulir terpasang, dan memakai `followOnAppend`. Tampilan hanya mengikuti pesan baru jika pengguna sudah berada di bawah.
