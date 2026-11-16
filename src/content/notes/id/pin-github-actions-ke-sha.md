---
title: "Pin GitHub Actions ke commit SHA, versinya di komentar"
summary: "Tag bisa dipindah ke commit lain, commit SHA tidak. Repo ini kini memasang SHA penuh di setiap action dari luar."
date: 2026-11-16
topic: ci
icon: list-checks
label: "Pin Actions ke SHA"
tags: ["GitHub Actions", "Keamanan"]
tldr: "Tag seperti v1.22.0 bisa dialihkan ke commit lain, commit SHA penuh tidak. Repo ini kini memakai SHA untuk 16 pemanggilan action, dengan versi di komentar."
---

Action di GitHub Actions biasanya dipanggil dengan tag, misalnya `actions/checkout@v7.0.1`. Tag itu bisa dipindah ke commit lain. [Panduan keamanan GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use) menyebut bahwa jika repo action disusupi, orang itu bisa mengalihkan atau menghapus tag. Commit SHA penuh mengikuti isi commit, jadi isinya tidak bisa diganti tanpa mengubah SHA-nya.

Panduan itu punya bagian khusus tentang pin ke SHA penuh. Karena itu, saya menulis SHA lengkap di setiap baris `uses:` yang memanggil action dari luar, lalu menaruh versinya di komentar.

## Apa yang berubah di PR #9 {#changes}

PR [#9](https://github.com/risqiromadhoni/heyris/pull/9) mengubah 7 berkas. Ada 19 baris ditambah dan 17 baris dihapus. Commit hasilnya, [809cb07](https://github.com/risqiromadhoni/heyris/commit/809cb07), bertanggal 16 November 2026, pukul 14.05 WIB.

## Jumlah pin di setiap workflow {#pins}

Sekarang ada 16 pemanggilan action dari luar repo, masing-masing memakai SHA penuh:

| Berkas workflow | Baris `uses:` |
| --- | --- |
| `check.yml` | 2 |
| `test.yml` | 3 |
| `playwright.yml` | 3 |
| `unlighthouse.yml` | 3 |
| `size.yml` | 2 |
| `release.yml` | 3 |

`release.yml` juga memanggil lima workflow lokal dengan `./.github/workflows/`. Pemanggilan lokal tidak memakai ref, jadi tidak ada SHA yang bisa dipasang.

## Cara memasang satu action {#pin-one}

:::checklist
- Cari tag rilis: buka halaman Releases repo action itu, lalu catat tag yang dipakai, misalnya v7.0.1.
- Ambil SHA: jalankan `gh api repos/actions/checkout/commits/v7.0.1 --jq .sha` dengan tag persis seperti di workflow.
- Tulis SHA dan versi: SHA di depan, versi di komentar, seperti `uses: actions/checkout@<SHA> # v7.0.1`.
- Matikan persist-credentials: isi `with:` di langkah checkout dengan `persist-credentials: false`.
:::

Ini contoh dari `.github/workflows/check.yml`:

```yaml {title=.github/workflows/check.yml}
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
```

Menurut [README actions/checkout](https://github.com/actions/checkout), secara bawaan checkout menyimpan token supaya langkah berikutnya bisa memakai git yang perlu autentikasi. Dengan `persist-credentials: false`, token itu tidak disimpan untuk git.

Saya memasang opsi ini di setiap langkah checkout, di keenam workflow. Job deploy di `release.yml` juga memegang token Cloudflare, jadi saya tidak mau ada kredensial lain tertinggal di ruang kerjanya.

## Yang belum terbukti {#unverified}

Saya belum melihat Dependabot memperbarui SHA sekaligus dengan komentar versinya. Repo ini belum pernah punya PR Dependabot untuk GitHub Actions. Empat PR Dependabot pertama, #1 sampai #4, semuanya untuk npm. Konfigurasi `.github/dependabot.yml` sudah memuat ekosistem github-actions. [Panduan Dependabot untuk actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot) membahas pembaruan actions, tetapi tidak menyebut pin SHA dengan komentar. Sampai ada PR yang membuktikannya, periksa SHA dan komentarnya setiap kali ada pembaruan.
