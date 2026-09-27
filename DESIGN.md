# Arahan Desain: Sistem Parkir Pintar

## Catatan jujur tentang asal arahan ini (wajib dibaca)

Proyek ini dikerjakan tanpa pemilik produk yang bisa ditanya langsung (mode kerja
otomatis, tanpa sesi tanya-jawab). Sesuai opsi R-37 nomor 2, arahan desain di
bawah ini **dibuat oleh agent sendiri**, bukan oleh pemilik produk. Ini bukan
brand asli, hanya keputusan kerja supaya hasilnya konsisten dan tidak jatuh ke
tampilan default AI (gradient biru-ungu, kartu seragam, ikon sparkle, dan lain
lain). Risikonya: arah ini tetap bisa terasa seperti "selera AI yang rapi" jika
tidak dipegang ketat. Untuk menguranginya, arahan ini diikat ke konvensi nyata
di lapangan parkir (rambu, palang pintu, warna sinyal slot) bukan ke tren UI
generik, dan ke kebutuhan baca cepat petugas di loket, bukan ke estetika.
Siapa pun yang melanjutkan proyek ini disarankan mengganti arahan ini dengan
brand asli bila tersedia.

## Konteks pemakaian

Pengguna utama: petugas loket yang berdiri/duduk di gerbang keluar, sering di
bawah sinar matahari langsung atau lampu neon gerbang, harus membaca angka
tarif dan sisa slot dalam hitungan detik sambil ada antrean kendaraan. Pengguna
kedua: admin yang mengatur lantai dan tarif dari kantor, dan melihat laporan
shift. Ini bukan produk yang harus terlihat menarik, ini alat kerja yang harus
terlihat jelas dari jarak dan tidak membingungkan saat terburu-buru.

## Palet warna

Maksimal 2 warna inti + 1 aksen, dengan warna status (hijau/merah) diperlakukan
sebagai warna sistem fungsional, bukan bagian dari palet identitas (sama seperti
rambu lalu lintas: hijau/merah bukan "keputusan gaya", tapi kode makna yang
sudah dipahami semua orang).

| Peran | Warna | Alasan |
|---|---|---|
| Inti 1 - Struktur (navbar, header, teks utama) | `#152238` (navy gelap) | Kontras tinggi terhadap latar terang, tidak memantulkan silau seperti warna terang, kesan ruang kontrol/pos jaga, bukan gradient, flat solid |
| Inti 2 - Latar halaman | `#F4F5F1` (putih gading) | Netral, tidak menyilaukan mata petugas yang bolak-balik lihat layar dan lihat kendaraan di luar, kontras aman untuk teks navy |
| Aksen - Aksi utama & sorot (tombol submit, kode tiket, badge shift aktif) | `#F2A900` (kuning amber) | Warna yang sama dengan palang pintu dan rambu peringatan area parkir, dipakai secukupnya untuk menandai "ini yang harus diperhatikan/ditekan" |
| Sistem - Slot tersedia | `#1E7A46` (hijau sinyal) | Konvensi universal "aman/tersedia", dipakai hanya pada indikator kapasitas, bukan dekorasi |
| Sistem - Slot penuh / error | `#B3261E` (merah sinyal) | Konvensi universal "berhenti/penuh", dipakai hanya pada indikator kapasitas dan pesan error |

Tidak ada gradient di mana pun. Semua warna dipakai flat (satu nilai solid),
karena tujuannya keterbacaan instan, bukan kedalaman visual.

## Tipografi

- **IBM Plex Sans** untuk semua teks UI (judul, label, paragraf, tombol).
  Alasan: dirancang untuk sistem antarmuka perusahaan/industri dengan penekanan
  pada kejelasan di ukuran kecil dan kepadatan informasi, cocok untuk dashboard
  operasional yang dibaca cepat, bukan pilihan default model (Inter/Geist/Space
  Grotesk) yang dipakai karena kebiasaan.
- **IBM Plex Mono** untuk kode tiket, nominal rupiah, jam, dan durasi.
  Alasan: lebar karakter tetap (tabular) membuat deretan angka (jam masuk,
  durasi, tarif) sejajar dan mudah dibandingkan sekilas, penting saat petugas
  mencocokkan kode tiket fisik dengan yang tampil di layar.

## Motif identitas

Motif berulang: **garis progres kapasitas bergaya indikator level** (bukan
progress bar generik bulat/pill) pada setiap kartu lantai, dengan sudut siku
(radius kecil, bukan pill) dan label angka besar "12/40" di sampingnya. Ini
meniru cara papan indikator "SLOT TERSEDIA" fisik di gedung parkir menampilkan
angka, bukan gaya kartu SaaS pada umumnya. Radius kecil dipakai konsisten di
seluruh aplikasi (4-6px) untuk kesan panel kontrol, bukan tombol pil.

Tidak ada ikon dekoratif generik (sparkle, lightning, robot). Ikon yang dipakai
terbatas pada glyph fungsional sederhana buatan sendiri lewat CSS (misalnya
bentuk gerbang/palang sebagai motif kecil di header), bukan dari pustaka ikon
bergaya seragam.

## Dial ENERGY / RHYTHM / MOTION

- **ENERGY: 1 (tenang)** - Ini alat operasional harian, bukan halaman
  pemasaran. Referensi rasa: dekat dengan GOV.UK, bukan Awwwards. Tidak ada
  elemen yang "berteriak" untuk menarik perhatian di luar status kapasitas.
- **RHYTHM: 2 (konsisten dengan sedikit variasi)** - Halaman monitor (grid
  kartu lantai), halaman transaksi (form + struk satu kolom), dan halaman
  laporan (tabel) punya komposisi berbeda sesuai isinya, tapi masing-masing
  konsisten secara internal, tidak berubah-ubah tanpa alasan.
- **MOTION: 1 (hover/focus + transisi status nyata saja)** - Satu-satunya
  animasi berarti adalah highlight singkat saat angka kapasitas berubah lewat
  socket.io (menandai "ini baru saja diperbarui secara realtime"), dan
  transisi warna saat hover/focus tombol. Tidak ada animasi loop, tidak ada
  efek masuk halaman.

## Keputusan lain (satu baris alasan tiap keputusan, R-31)

- Border radius kecil (4-6px) konsisten: kesan panel instrumen, bukan kartu
  konsumen.
- Tidak ada bayangan besar/blur/glassmorphism: layar dilihat di kondisi
  pencahayaan bervariasi (indoor/outdoor), kontras solid lebih andal daripada
  efek transparan.
- Font ukuran besar untuk angka kapasitas dan tarif: dibaca cepat dari jarak
  oleh petugas yang tidak selalu duduk dekat layar.
- Tombol aksi utama selalu warna amber solid, tombol sekunder outline navy:
  supaya di layar yang penuh data, mata langsung tahu tombol mana yang harus
  ditekan.
- Tidak ada toggle mode gelap/terang: warna status hijau/merah harus tampil
  identik di semua layar dan kondisi cahaya supaya petugas tidak salah baca
  status kapasitas; satu tema tetap lebih aman daripada dua tema yang harus
  sama-sama diverifikasi.
