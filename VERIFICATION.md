# Catatan Verifikasi Manual (R-35)

Dilakukan pada lingkungan pengembangan lokal, Node.js v22.22.2, `npm install`
lalu server dijalankan dengan `node server.js` di port sementara (bukan port
default 3000, karena port tersebut dipakai proyek lain di mesin verifikasi;
tidak memengaruhi cara aplikasi berjalan). Data awal diisi dengan
`npm run reseed` sebelum pengujian, dan dikembalikan ke kondisi bersih
(`git checkout -- data/lantai.json data/tarif.json`, tiket dan shift memang
kosong lagi setelah reseed) setelah pengujian selesai.

Setiap langkah di bawah adalah bukti klik-per-klik/permintaan-per-permintaan
yang benar-benar dijalankan lewat `curl`, bukan asumsi.

## 1. Instalasi dan server menyala

- `npm install` -> selesai tanpa error, `node_modules` terbentuk.
- Server dijalankan, `GET /` -> **200**. Tidak ada error di log server
  selama seluruh sesi pengujian (log diperiksa setelah proses dihentikan).

## 2. Manajemen lantai dan tarif (FR-1)

- `POST /lantai` dengan nama "Lantai Verifikasi", kapasitas 2 -> **302**
  (redirect setelah simpan, sesuai pola flash-redirect aplikasi).
- Lantai baru muncul di `data/lantai.json` dengan `slot_terisi: 0`.
- (Pengujian tambahan sebelumnya, di luar catatan run final ini) percobaan
  mengubah kapasitas lebih kecil dari slot terisi ditolak dengan pesan yang
  menyebutkan slot yang sedang terisi; percobaan menghapus lantai yang masih
  punya tiket aktif ditolak dengan pesan jelas; setelah tiket diselesaikan,
  penghapusan lantai berhasil.

## 3. Proses tiket masuk berbasis QR (FR-2)

- `POST /masuk` (lantai kapasitas 2, slot 0/2) -> **200**, kode tiket
  `TKT-260927-382F6B71` dibuat, gambar QR (`<img src="data:image/png...">`)
  muncul tepat 1 kali di halaman, `slot_terisi` lantai naik dari 0 menjadi 1.
- `POST /masuk` kedua ke lantai yang sama -> **200**, tiket kedua
  `TKT-260927-3F273EED` dibuat, slot menjadi 2/2.
- `POST /masuk` ketiga ke lantai yang sama (sudah penuh) -> **409**, pesan:
  "Lantai Verifikasi sudah penuh (2/2 slot). Arahkan kendaraan ke lantai
  lain." Slot tidak bertambah lagi.

## 4. Proses tiket keluar dan tarif progresif (FR-3)

Aturan tarif aktif saat pengujian: jam pertama Rp5.000, jam berikutnya
Rp3.000/jam.

- `waktu_masuk` tiket pertama diubah mundur 2,5 jam secara langsung di
  `data/tiket.json` untuk mensimulasikan kendaraan yang sudah lama parkir.
- `POST /keluar` tanpa shift aktif -> **302** redirect ke `/shift` (ditolak
  sesuai FR-3.10, tidak memproses transaksi).
- `POST /shift/mulai` dengan kode `SIT01` -> **302**, shift aktif untuk Siti
  Rahayu.
- `POST /keluar` dengan kode tiket pertama -> **200**. Durasi dihitung
  **3 jam** (2,5 jam dibulatkan ke atas, sesuai FR-3.5), tarif dihitung
  **Rp11.000** (5.000 jam pertama + 2 x 3.000 jam berikutnya, sesuai
  FR-3.6). `slot_terisi` lantai turun dari 2 menjadi 1.
- `POST /keluar` dengan kode tiket yang sama sekali lagi -> **409**, pesan:
  "Tiket ... sudah pernah diproses keluar pada ...". Tarif tidak dihitung
  ulang.
- `POST /keluar` dengan kode acak yang tidak ada -> **404**, pesan: "Kode
  tiket ... tidak ditemukan. Periksa kembali kode pada tiket atau QR."

## 5. Manajemen shift dan laporan pendapatan (FR-4)

- `GET /shift` (setelah shift dimulai) menampilkan ringkasan: **1
  transaksi**, **Rp11.000**, sesuai transaksi keluar yang baru diproses.
- `POST /shift/akhiri` -> **302**, pesan flash: "Shift diakhiri. Total 1
  transaksi, pendapatan Rp11.000." Sesi shift dibersihkan (kembali ke
  halaman login shift).
- `GET /laporan` -> **200**, baris "Siti Rahayu" muncul dengan total
  Rp11.000 tercantum di baris maupun di ringkasan/tfoot.
- `GET /laporan?tanggal_mulai=2020-01-01&tanggal_selesai=2020-01-02` (rentang
  tidak relevan) -> **200**, menampilkan state kosong actionable: "Tidak ada
  shift pada rentang tanggal ini" beserta tombol menghapus filter.

## 6. Monitor realtime

- `GET /socket.io/socket.io.js` -> **200**, aset client socket.io
  tersaji dengan benar sehingga halaman monitor bisa membuka koneksi
  realtime.
- Pemeriksaan kode (`lib/broadcast.js` dipanggil dari `routes/masuk.js`,
  `routes/keluar.js`, dan `routes/lantai.js` setiap kali `slot_terisi`
  berubah) mengonfirmasi setiap transaksi masuk/keluar dan perubahan
  kapasitas lantai menyiarkan event `kapasitas:update` ke seluruh klien
  yang terhubung.

## 7. Ringkasan status

Semua alur inti (manajemen lantai/tarif, tiket masuk dengan QR, tiket keluar
dengan tarif progresif dan pembulatan jam, manajemen shift, laporan dengan
filter tanggal) diverifikasi berjalan sesuai `PRD.md` dengan bukti
permintaan/respons di atas. Tidak ditemukan error pada log server selama
pengujian. Server dihentikan setelah verifikasi selesai.
