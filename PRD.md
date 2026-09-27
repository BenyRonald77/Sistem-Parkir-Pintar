# PRD: Sistem Parkir Pintar

## 1. Ringkasan

Sistem Parkir Pintar adalah aplikasi web internal untuk mengelola operasional
harian gedung/area parkir bertingkat: pencatatan kendaraan masuk dan keluar
lewat tiket berkode unik (dengan QR), perhitungan tarif progresif per jam,
pemantauan kapasitas slot secara realtime per lantai, serta pencatatan
pendapatan per shift petugas. Aplikasi ini dipakai oleh petugas loket dan
admin operasional, dijalankan di jaringan internal lokasi parkir.

## 2. Latar Belakang

Pencatatan parkir manual (kertas/karcis fisik tanpa sistem) rawan salah hitung
tarif, sulit dipantau kapasitasnya secara real time oleh pengelola, dan sulit
direkonsiliasi pendapatannya per shift petugas. Sistem ini dibuat untuk
mengganti proses tersebut dengan pencatatan digital yang konsisten: satu
sumber data untuk kapasitas, tarif, tiket, dan laporan shift.

## 3. Tujuan

1. Petugas dapat memproses kendaraan masuk dan keluar dengan cepat, dengan
   tarif yang terhitung otomatis dan konsisten sesuai aturan progresif aktif.
2. Pengelola dapat memantau kapasitas tiap lantai parkir secara realtime tanpa
   perlu me-refresh halaman.
3. Admin dapat mengubah kapasitas lantai dan aturan tarif progresif kapan pun
   dibutuhkan, tanpa mengubah kode aplikasi.
4. Setiap transaksi keluar tercatat di bawah shift petugas yang sedang aktif,
   sehingga pendapatan per shift dan per petugas dapat direkap dan difilter
   per tanggal.

## 4. Peran Pengguna

| Peran | Deskripsi | Akses |
|---|---|---|
| Petugas (per shift) | Bertugas di loket keluar/masuk selama satu shift kerja. Login sederhana dengan nama dan kode petugas, tanpa password kompleks (bukan sistem keamanan berlapis, karena dipakai di jaringan internal terpercaya). | Mulai/akhiri shift, proses tiket keluar, lihat ringkasan transaksi shift berjalan, proses tiket masuk. |
| Admin | Mengelola data dasar operasional. Pada versi ini admin memakai perangkat yang sama tanpa login terpisah (lihat Batasan #1), karena fokus utama produk adalah alur transaksi, bukan manajemen akses. | Kelola data lantai (tambah/ubah/hapus, kapasitas total), kelola aturan tarif progresif, lihat laporan pendapatan seluruh shift. |

## 5. Ruang Lingkup

**Termasuk dalam ruang lingkup:**
- Manajemen lantai parkir dan kapasitasnya.
- Manajemen aturan tarif progresif (tarif jam pertama, tarif per jam
  berikutnya), dapat diedit admin.
- Proses tiket masuk: pilih lantai, validasi slot tersedia, generate kode
  tiket unik dan QR, catat waktu masuk, tambah slot terisi, broadcast
  realtime.
- Proses tiket keluar: input/scan kode tiket, validasi tiket aktif, hitung
  durasi dan tarif progresif (pembulatan ke atas per jam), catat waktu keluar
  dan tarif, kurangi slot terisi, broadcast realtime, catat transaksi di
  bawah shift petugas aktif.
- Manajemen shift: mulai shift, akhiri shift, laporan pendapatan per shift
  dengan filter tanggal.
- Halaman monitor kapasitas realtime per lantai.

**Tidak termasuk dalam ruang lingkup (lihat juga Batasan):**
- Pembayaran non-tunai/gateway pembayaran.
- Integrasi kamera/ANPR (pembacaan plat nomor otomatis).
- Autentikasi berlapis (role-based access control, password terenkripsi kuat).
- Reservasi slot parkir di muka.
- Aplikasi mobile terpisah.

## 6. User Stories

1. Sebagai petugas di gerbang masuk, saya ingin memilih lantai dan mencetak
   tiket berkode unik dengan QR, supaya kendaraan punya bukti masuk yang bisa
   dipindai saat keluar.
2. Sebagai petugas, saya ingin sistem menolak proses masuk dengan pesan yang
   jelas ketika lantai sudah penuh, supaya saya tidak mengarahkan kendaraan ke
   lantai yang tidak ada slotnya.
3. Sebagai petugas di gerbang keluar, saya ingin memasukkan kode tiket dan
   langsung melihat durasi serta tarif yang harus dibayar, supaya transaksi
   keluar cepat dan tidak salah hitung.
4. Sebagai petugas, saya ingin memulai shift dengan nama saya sebelum mulai
   melayani transaksi keluar, supaya pendapatan yang saya proses tercatat atas
   nama saya.
5. Sebagai pengelola, saya ingin melihat kapasitas semua lantai secara
   realtime dari satu layar monitor, supaya saya tahu lantai mana yang hampir
   penuh tanpa harus berkeliling.
6. Sebagai admin, saya ingin mengubah tarif jam pertama dan tarif per jam
   berikutnya, supaya saya bisa menyesuaikan harga tanpa bantuan developer.
7. Sebagai admin, saya ingin melihat laporan pendapatan per shift dan
   memfilternya per tanggal, supaya saya bisa merekonsiliasi setoran petugas.

## 7. Functional Requirements

### FR-1: Manajemen Lantai, Kapasitas, dan Tarif Progresif
- FR-1.1 Sistem menampilkan daftar lantai parkir beserta nama, kapasitas
  total, dan slot terisi saat ini.
- FR-1.2 Admin dapat menambah lantai baru dengan nama dan kapasitas total.
- FR-1.3 Admin dapat mengubah nama dan kapasitas total lantai yang sudah ada.
- FR-1.4 Admin dapat menghapus lantai, dengan penolakan jika masih ada tiket
  aktif di lantai tersebut (mencegah data tiket menjadi yatim).
- FR-1.5 Sistem menampilkan aturan tarif progresif aktif: tarif jam pertama
  dan tarif per jam berikutnya.
- FR-1.6 Admin dapat mengubah nilai tarif jam pertama dan tarif per jam
  berikutnya pada aturan yang aktif.
- FR-1.7 Perubahan tarif hanya berlaku untuk tiket yang keluar setelah
  perubahan disimpan; tiket yang sudah keluar sebelumnya tidak dihitung ulang.

### FR-2: Proses Tiket Masuk Berbasis QR
- FR-2.1 Petugas/operator gerbang memilih lantai tujuan pada form kendaraan
  masuk.
- FR-2.2 Sistem memvalidasi slot tersedia pada lantai yang dipilih sebelum
  membuat tiket.
- FR-2.3 Jika lantai penuh (slot terisi sama dengan kapasitas total), sistem
  menolak proses dan menampilkan pesan yang menyebutkan nama lantai dan bahwa
  lantai tersebut penuh.
- FR-2.4 Sistem membuat kode tiket unik dan gambar QR dari kode tersebut.
- FR-2.5 Sistem mencatat waktu masuk pada saat tiket dibuat.
- FR-2.6 Sistem menambah jumlah slot terisi pada lantai terkait sebanyak satu.
- FR-2.7 Sistem menyiarkan (broadcast) kapasitas terbaru ke semua klien yang
  membuka halaman monitor, tanpa perlu refresh halaman.

### FR-3: Proses Tiket Keluar dan Hitung Tarif Progresif
- FR-3.1 Petugas memasukkan kode tiket pada form kendaraan keluar.
- FR-3.2 Sistem memvalidasi bahwa kode tiket ditemukan dan masih berstatus
  aktif (belum diproses keluar sebelumnya).
- FR-3.3 Sistem menampilkan pesan jelas jika kode tiket tidak ditemukan atau
  tiket sudah pernah diproses keluar.
- FR-3.4 Sistem menghitung durasi parkir dari waktu masuk sampai waktu proses
  keluar.
- FR-3.5 Sistem membulatkan durasi ke atas per satu jam (contoh: 61 menit
  dihitung 2 jam) untuk keperluan tarif.
- FR-3.6 Sistem menghitung tarif progresif: jam pertama dikenakan tarif jam
  pertama, setiap jam tambahan setelah jam pertama dikenakan tarif per jam
  berikutnya, sesuai aturan tarif yang aktif saat itu.
- FR-3.7 Sistem mencatat waktu keluar dan nilai tarif pada tiket.
- FR-3.8 Sistem mengurangi jumlah slot terisi pada lantai terkait sebanyak
  satu.
- FR-3.9 Sistem menyiarkan kapasitas terbaru ke halaman monitor.
- FR-3.10 Proses keluar hanya dapat dilakukan oleh petugas yang sedang
  memiliki shift aktif; jika belum ada shift aktif, sistem mengarahkan
  petugas untuk memulai shift terlebih dahulu.
- FR-3.11 Transaksi keluar tercatat sebagai bagian dari shift petugas yang
  sedang aktif saat transaksi diproses.

### FR-4: Manajemen Shift dan Laporan Pendapatan per Shift
- FR-4.1 Petugas dapat memulai shift dengan memasukkan nama dan kode petugas
  yang terdaftar.
- FR-4.2 Sistem menolak memulai shift dengan pesan jelas jika kode petugas
  tidak ditemukan, atau jika petugas tersebut masih punya shift aktif yang
  belum diakhiri.
- FR-4.3 Petugas dapat mengakhiri shift yang sedang berjalan.
- FR-4.4 Sistem mencatat waktu mulai dan waktu akhir setiap shift.
- FR-4.5 Selama shift aktif, sistem menampilkan ringkasan transaksi keluar
  yang sudah diproses pada shift tersebut (jumlah transaksi dan total
  pendapatan sementara).
- FR-4.6 Sistem menyediakan halaman laporan yang menampilkan daftar shift
  beserta nama petugas, waktu mulai/akhir, jumlah transaksi, dan total
  pendapatan per shift.
- FR-4.7 Laporan dapat difilter berdasarkan rentang tanggal.

### FR-5: Monitor Kapasitas Realtime
- FR-5.1 Sistem menyediakan halaman monitor yang menampilkan seluruh lantai
  dengan kapasitas total dan slot terisi saat ini.
- FR-5.2 Halaman monitor memperbarui angka kapasitas secara langsung melalui
  koneksi realtime ketika ada tiket masuk atau keluar, tanpa memuat ulang
  halaman.
- FR-5.3 Halaman monitor menandai status setiap lantai (tersedia, hampir
  penuh, penuh) secara visual berdasarkan perbandingan slot terisi terhadap
  kapasitas total.

## 8. Data Model

### Tabel `lantai`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | Primary key |
| nama | string | Nama lantai, contoh "Lantai 1" |
| kapasitas_total | integer | Jumlah maksimum slot |
| slot_terisi | integer | Jumlah slot terisi saat ini, berubah saat masuk/keluar |
| dibuat_pada | string (ISO datetime) | Waktu data dibuat |

### Tabel `tarif`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | Primary key |
| nama | string | Nama aturan tarif, contoh "Tarif Reguler" |
| tarif_jam_pertama | integer | Nominal rupiah untuk jam pertama |
| tarif_per_jam_berikutnya | integer | Nominal rupiah per jam setelah jam pertama |
| aktif | boolean | Hanya satu aturan boleh aktif pada satu waktu |
| diperbarui_pada | string (ISO datetime) | Waktu terakhir diubah |

### Tabel `petugas`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | Primary key |
| nama | string | Nama petugas |
| kode_petugas | string | Kode unik untuk login shift |

### Tabel `tiket`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | Primary key |
| kode_tiket | string | Kode unik tiket, tercetak sebagai QR |
| lantai_id | string (UUID) | Referensi ke `lantai` |
| status | string | `aktif` atau `selesai` |
| waktu_masuk | string (ISO datetime) | Dicatat saat tiket dibuat |
| waktu_keluar | string (ISO datetime) atau null | Dicatat saat proses keluar |
| tarif | integer atau null | Nominal tarif hasil hitung, null selama aktif |
| shift_id | string (UUID) atau null | Shift yang memproses keluar, null selama aktif |

### Tabel `shift`
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | Primary key |
| petugas_id | string (UUID) | Referensi ke `petugas` |
| status | string | `aktif` atau `selesai` |
| waktu_mulai | string (ISO datetime) | Dicatat saat shift dimulai |
| waktu_selesai | string (ISO datetime) atau null | Dicatat saat shift diakhiri |

## 9. Non-Functional Requirements

- **Realtime**: pembaruan kapasitas pada halaman monitor harus tersiar ke
  semua klien yang terhubung dalam hitungan detik setelah transaksi masuk
  atau keluar diproses, memakai koneksi socket.io yang tetap terbuka selama
  halaman dibuka.
- **Akurasi tarif**: perhitungan tarif progresif harus konsisten dan dapat
  diverifikasi ulang secara manual dari data waktu masuk, waktu keluar, dan
  aturan tarif yang berlaku saat tiket keluar diproses. Pembulatan durasi
  selalu ke atas per jam.
- **Aksesibilitas**: seluruh kontrol interaktif dapat dioperasikan dengan
  keyboard, memiliki indikator fokus yang terlihat jelas, target sentuh
  minimum 44x44 piksel, dan kontras teks memenuhi standar WCAG AA.
- **Ketersediaan data**: data tersimpan sebagai berkas JSON di server dan
  tetap ada selama proses server tidak dihentikan atau berkas data tidak
  dihapus; tidak ada replikasi/backup otomatis pada versi ini (lihat
  Batasan).
- **Kegunaan pada kondisi nyata**: setiap halaman yang menampilkan data harus
  punya kondisi kosong, memuat, dan gagal yang dapat ditindaklanjuti (bukan
  sekadar pesan generik).

## 10. Batasan

1. Tidak ada autentikasi berlapis untuk admin; halaman kelola lantai dan
   tarif dapat diakses siapa pun yang memiliki akses ke jaringan internal
   tempat aplikasi berjalan. Login petugas per shift bersifat sederhana
   (nama dan kode petugas), bukan mekanisme keamanan penuh.
2. Penyimpanan data memakai berkas JSON lokal (tanpa mesin basis data),
   sehingga tidak cocok untuk beban transaksi tinggi atau akses bersamaan
   dalam skala besar; cocok untuk satu lokasi parkir dengan jumlah loket
   terbatas.
3. Tidak ada integrasi pembayaran non-tunai; nominal tarif ditampilkan untuk
   dibayar tunai secara manual di loket.
4. Tidak ada pembacaan plat nomor otomatis; kode tiket adalah satu-satunya
   identitas kendaraan yang dipakai sistem.
5. Aplikasi ditujukan untuk satu lokasi/gedung parkir dalam satu proses
   server; belum mendukung multi-lokasi dalam satu instalasi.
