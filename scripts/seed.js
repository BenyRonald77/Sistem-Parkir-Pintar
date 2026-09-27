// Mengisi ulang data awal (reseed). Menimpa seluruh berkas di data/*.json.
// Jalankan dengan: npm run reseed
"use strict";

const path = require("path");
const store = require(path.join(__dirname, "..", "lib", "store"));

function now() {
  return new Date().toISOString();
}

const lantai = [
  { id: "l-lt1", nama: "Lantai 1", kapasitas_total: 40, slot_terisi: 0, dibuat_pada: now() },
  { id: "l-lt2", nama: "Lantai 2", kapasitas_total: 40, slot_terisi: 0, dibuat_pada: now() },
  { id: "l-lt3", nama: "Lantai 3 (Motor)", kapasitas_total: 60, slot_terisi: 0, dibuat_pada: now() },
];

const tarif = [
  {
    id: "t-reguler",
    nama: "Tarif Reguler",
    tarif_jam_pertama: 5000,
    tarif_per_jam_berikutnya: 3000,
    aktif: true,
    diperbarui_pada: now(),
  },
];

const petugas = [
  { id: "p-siti", nama: "Siti Rahayu", kode_petugas: "SIT01" },
  { id: "p-budi", nama: "Budi Santoso", kode_petugas: "BUD02" },
  { id: "p-andi", nama: "Andi Wijaya", kode_petugas: "AND03" },
];

store.saveAll("lantai", lantai);
store.saveAll("tarif", tarif);
store.saveAll("petugas", petugas);
store.saveAll("tiket", []);
store.saveAll("shift", []);

console.log("Data awal berhasil ditulis ke folder data/:");
console.log(`- lantai: ${lantai.length} baris`);
console.log(`- tarif: ${tarif.length} baris (aktif: ${tarif[0].nama})`);
console.log(`- petugas: ${petugas.length} baris`);
console.log("- tiket: dikosongkan");
console.log("- shift: dikosongkan");
