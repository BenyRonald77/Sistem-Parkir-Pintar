# Sistem Parkir Pintar

Aplikasi web internal untuk mengelola operasional parkir bertingkat: tiket
kendaraan masuk/keluar berbasis QR, tarif progresif per jam, kapasitas
lantai realtime, dan laporan pendapatan per shift petugas.

Lihat `PRD.md` untuk kebutuhan produk lengkap dan `DESIGN.md` untuk arahan
desain (termasuk catatan jujur soal asal arahan tersebut).

## Menjalankan aplikasi

Butuh Node.js versi 22 ke atas.

```bash
npm install
npm start
```

Aplikasi berjalan di `http://localhost:3000` secara default. Untuk memakai
port lain, atur variabel lingkungan `PORT`:

```bash
PORT=4000 npm start
```

## Mengisi ulang data awal (reseed)

Data disimpan sebagai berkas JSON di folder `data/`. Untuk mengembalikan ke
data contoh awal (3 lantai, 1 aturan tarif, 3 petugas, tanpa tiket/shift):

```bash
npm run reseed
```

Perintah ini **menimpa** seluruh isi `data/lantai.json`, `data/tarif.json`,
`data/petugas.json`, `data/tiket.json`, dan `data/shift.json`. Kode petugas
contoh setelah reseed: `SIT01` (Siti Rahayu), `BUD02` (Budi Santoso), `AND03`
(Andi Wijaya).

## Alur pemakaian singkat

1. **Kelola Lantai & Tarif** (`/lantai`): admin menambah lantai dan mengatur
   tarif jam pertama serta tarif per jam berikutnya.
2. **Masuk** (`/masuk`): swalayan, tanpa login. Pilih lantai, sistem membuat
   kode tiket unik dan QR.
3. **Shift** (`/shift`): petugas memasukkan kode petugas untuk memulai shift
   sebelum bisa memproses kendaraan keluar.
4. **Keluar** (`/keluar`): masukkan kode tiket, sistem menghitung tarif
   progresif dan mencatatnya di bawah shift yang sedang aktif.
5. **Monitor** (`/`): kapasitas semua lantai, diperbarui langsung lewat
   socket.io setiap ada kendaraan masuk atau keluar.
6. **Laporan** (`/laporan`): daftar shift dengan total pendapatan dan jumlah
   transaksi, bisa difilter per tanggal.

## Alasan teknis

- **Express + EJS**: cukup untuk aplikasi operasional server-rendered tanpa
  perlu build step atau bundler di sisi klien.
- **socket.io**: dipakai murni untuk menyiarkan kapasitas lantai terbaru ke
  halaman monitor yang terbuka, supaya pengelola tidak perlu me-refresh
  halaman secara manual.
- **Penyimpanan JSON sinkron (`lib/store.js`)**: tanpa dependensi database
  native, mudah dibaca/diperiksa langsung sebagai berkas teks, cukup untuk
  volume transaksi satu lokasi parkir (lihat Batasan di `PRD.md`). Bukan
  pilihan untuk beban tinggi atau banyak proses yang menulis bersamaan.
- **Kode tiket + `qrcode` (pure JS)**: QR dibuat sebagai data URL langsung
  saat tiket dicetak, tanpa perlu menyimpan berkas gambar terpisah di disk.
- **`express-session` dengan memory store**: cukup untuk melacak siapa yang
  sedang login shift di satu browser petugas. Karena bukan penyimpanan
  persisten, sesi login akan hilang jika proses server direstart (bukan data
  transaksi, yang tetap tersimpan di `data/*.json`).
- **Tidak ada `node-cron`**: tidak ada pekerjaan berjadwal (terjadwal
  waktu tertentu) yang dibutuhkan pada versi ini; semua perhitungan tarif
  terjadi saat transaksi keluar diproses.

## Struktur folder

```
server.js            Entry point, wiring Express + socket.io
lib/store.js          Penyimpanan JSON sinkron
lib/tarif.js           Perhitungan tarif progresif
lib/broadcast.js       Siaran kapasitas ke socket.io
routes/                Route per fitur (lantai, masuk, keluar, shift, monitor)
views/                 Template EJS + partial (head/nav/foot)
public/css/style.css   Seluruh gaya, custom properties, mobile-first
public/js/             Skrip klien vanilla (nav, monitor realtime)
data/                  Berkas data JSON (dibuat/diisi oleh scripts/seed.js)
scripts/seed.js        Reseed data awal
```

## Keterbatasan yang disengaja

Lihat bagian Batasan di `PRD.md`: tidak ada autentikasi berlapis, tidak ada
integrasi pembayaran non-tunai, tidak ada pembacaan plat nomor otomatis,
dan penyimpanan data belum memakai mesin basis data.
