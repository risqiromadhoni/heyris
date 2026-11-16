---
title: "Rilis 1.0.0: release-please, lima pemeriksaan, satu persetujuan"
summary: "Cara rilis 1.0.0 berjalan dari release-please sampai deploy ke Cloudflare, dan tiga hal yang tidak saya duga."
date: 2026-11-16
topic: ci
---

Pada 16 November 2026 pukul 13.24 WIB, [PR rilis #5](https://github.com/risqiromadhoni/heyris/pull/5) digabung ke `main`. Tag `v1.0.0` dan [GitHub release](https://github.com/risqiromadhoni/heyris/releases/tag/v1.0.0) langsung dibuat. Deploy ke Cloudflare selesai pukul 13.31 WIB.

Ada tiga hal dalam alur ini yang tidak saya duga. Pertama, run CI di PR rilis menunggu persetujuan. Kedua, workflow yang dipanggil memakai nama workflow pemanggilnya, jadi setiap grup concurrency butuh akhiran sendiri. Ketiga, Check tetap merah setelah perbaikan.

## Alur dari commit ke deploy

Workflow `Release` berjalan setiap ada push ke `main`.

:::diagram
- Push ke main: release-please membaca commit
- PR rilis: dibuat dengan GITHUB_TOKEN
- Merge PR: tag v1.0.0 dan GitHub release
- Lima pemeriksaan: check, test, playwright, unlighthouse, size
- Persetujuan: reviewer di environment production
- Deploy: vp run void\:deploy
:::

Lima pemeriksaan dan deploy hanya jalan kalau `release_created` bernilai `true`. Mereka juga bisa jalan manual lewat `workflow_dispatch`. Kondisi itu ada di `.github/workflows/release.yml`.

## Versi pertama dan token

Job `release-please` memakai `googleapis/release-please-action` versi 5.0.0, yang dikunci ke commit SHA. Saya memakai token bawaan `GITHUB_TOKEN`, bukan personal access token. Ini keputusan saya.

[README release-please-action](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs) menulis bahwa tag dan PR rilis yang dibuat dengan token bawaan tidak memicu workflow lain. README itu menyarankan personal access token kalau CI harus jalan di PR rilis. Saya memilih tetap memakai token bawaan, dan hasilnya ada di bagian "PR rilis menunggu persetujuan" di bawah.

Repo ini belum punya tag versi sebelumnya. Karena itu, release-please perlu tahu versi pertamanya. Saya menulisnya sebagai footer `Release-As: 1.0.0` di commit `27f3ac8`. Berkas `.release-please-manifest.json` berisi satu baris: `{".":"1.0.0"}`.

## Lima pemeriksaan dipanggil dari Release

Tag `v1.0.0` dibuat dengan `GITHUB_TOKEN`, jadi tag itu tidak memicu workflow lain. Pemeriksaan tidak bisa menunggu event tag. Karena itu, `release.yml` memanggil kelima alur itu langsung dengan `uses:`. Setiap alur punya pemicu `workflow_call` untuk keperluan ini. Job `deploy` menunggu semuanya lewat `needs`:

```yaml {title=.github/workflows/release.yml}
  deploy:
    name: Deploy to Cloudflare
    needs: [release-please, check, test, e2e, lighthouse, size]
    if: ${{ needs.release-please.outputs.release_created == 'true' || github.event_name == 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment:
      name: production
      url: ${{ vars.VITE_APP_SITE }}
```

## Path filter dan ukuran bundle

Commit `28b03fb` (PR #8) membatasi empat workflow di PR. Test, Playwright, Unlighthouse, dan Size hanya jalan kalau berkas yang mereka pakai berubah. Check tidak punya filter, jadi ia jalan di setiap push dan PR.

Filter path hanya ada di event `push` dan `pull_request`. Saat Release memanggil workflow, filter itu tidak berlaku. Jadi setiap deploy melewati kelima pemeriksaan penuh. Pada run rilis 1.0.0, kelimanya lulus.

Size memeriksa anggaran di `.size-limit.json`, yaitu 4,5 kB untuk JS latar WebGL, 3 kB untuk JS lain, dan 14 kB untuk CSS, dihitung dengan Brotli.

## Satu grup concurrency untuk tiap workflow

Setiap alur yang bisa dipanggil punya grup concurrency sendiri. Ini isi `check.yml`, baris 13 sampai 15:

```yaml {title=.github/workflows/check.yml}
concurrency:
  group: ${{ github.workflow }}-check-${{ github.ref }}
  cancel-in-progress: true
```

Nama alur di grup itu ada karena alasan berikut. Dokumentasi [menggunakan ulang konfigurasi workflow](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations) menyebut bahwa workflow yang dipanggil memakai nama workflow pemanggilnya di `github.workflow`. Dokumentasi yang sama juga memperingatkan agar caller dan workflow yang dipanggil tidak memakai `concurrency.group` yang sama saat `cancel-in-progress` bernilai `true`, karena workflow yang sudah berjalan bisa dibatalkan. Semua tujuh job di run rilis 1.0.0 melaporkan nama workflow `Release` di Actions jobs API. Dengan nama itu di setiap job, kelima grup akan sama tanpa akhiran. Akhiran `-check-`, `-test-`, dan seterusnya menjaga kelima grup tetap terpisah.

Saya belum melihat satu pun job dibatalkan karena masalah ini. Saya tetap memakai nama alur di grup.

## Persetujuan sebelum deploy

Job `deploy` memakai environment `production`. Environment itu punya reviewer wajib, dan hanya cabang `main` yang boleh deploy ke sana. Job menunggu sampai reviewer menyetujui. [Dokumentasi environment deployment GitHub](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) menulis bahwa satu reviewer dari daftar sudah cukup.

Saya menyetujui run ini. Deploy mulai pukul 13.30 WIB dan selesai pukul 13.31 WIB dengan status sukses.

## PR rilis menunggu persetujuan {#pr-menunggu}

PR #5 dibuka oleh github-actions[bot] pukul 11.48 WIB. Lima workflow `pull_request` pertama untuk PR itu, yaitu Check, Test, Playwright, Unlighthouse, dan Size, dibuat pada 11.48 WIB dengan status `action_required`.

[Dokumentasi GitHub tentang GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token) menulis bahwa event dari `GITHUB_TOKEN` tidak membuat run baru. Pengecualiannya adalah event `pull_request` dengan jenis opened, synchronize, atau reopened. Run dari event itu masuk status menunggu persetujuan. Orang dengan akses tulis memulainya dengan memilih "Approve workflows to run". Dokumen itu juga menyebut bahwa PR yang dibuat atau diperbarui dengan token GitHub App atau PAT tidak memerlukan persetujuan.

Saya tetap memakai `GITHUB_TOKEN`, bukan PAT. Akibatnya, run itu perlu disetujui orang sebelum CI berjalan di PR rilis.

## Check yang tetap merah

Check di PR #5 gagal karena `vp check` menolak berkas `.release-please-manifest.json`. Log-nya menulis "Formatting issues found" untuk berkas itu. release-please menulis manifest dalam satu baris JSON, dan format itu dianggap salah.

Commit `7416554` (PR #7) memasukkan berkas itu ke `fmt.ignorePatterns` di `vite.config.ts`, baris 63. PR #7 digabung pukul 13.03 WIB, dan PR #8 pukul 13.09 WIB.

Check di PR #5 tetap gagal pukul 13.15 WIB, pada commit `6641f78` yang sama. Log checkout run itu mengambil `refs/remotes/pull/5/merge`, yaitu commit `676b083` berjudul `Merge 6641f78 into c03b772`. Commit `c03b772` adalah commit `main` pukul 12.44 WIB (PR #6). Jadi merge itu dibuat sebelum PR #7 dan PR #8 masuk ke `main`, dan `vite.config.ts` di pohon itu belum mengabaikan manifest. Log-nya masih menyebut manifest yang sama.

Dalam kasus ini, Check lulus pukul 13.20 WIB setelah PR #5 saya tutup dan buka lagi. GitHub membuat merge ref baru dari `main` setelah PR #8. Empat workflow lain tampil `skipped`.

## Urutan waktu pada 16 November 2026

| Waktu (WIB) | Kejadian |
| --- | --- |
| 11.48 | release-please membuka PR #5 |
| 13.03 | PR #7 digabung ke main |
| 13.09 | PR #8 digabung ke main |
| 13.15 | Check di PR #5 gagal lagi |
| 13.20 | Check hijau setelah PR #5 dibuka lagi |
| 13.24 | PR #5 digabung, tag v1.0.0 dan release dibuat |
| 13.24 sampai 13.30 | Lima pemeriksaan lulus |
| 13.30 sampai 13.31 | Deploy berjalan setelah persetujuan, lalu sukses |

## Commit yang membentuk alur ini

Commit berikut, dari yang paling awal:

:::commits
- 27f3ac8 ci(release): deploy to Cloudflare from release-please releases
- 5408d8d ci(size): enforce JS and CSS size budgets with size-limit
- 4af10e3 ci(release): gate deploy on every CI workflow
- 7416554 chore(fmt): leave release-please's manifest unformatted (#7)
- 28b03fb ci: run heavy workflows only when their inputs change (#8)
- 4bff11e chore(main): release 1.0.0 (#5)
:::

## Yang belum saya periksa

Dua hal ini belum saya periksa:

- Situs live: deploy yang sukses belum membuktikan bahwa halaman yang tampil memakai build 1.0.0.
- `VITE_APP_SITE`: saya belum memeriksa apakah variabel repo itu sudah terisi. Kalau kosong, langkah deploy membuangnya, lalu situs memakai nilai bawaan.
