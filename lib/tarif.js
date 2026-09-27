// Perhitungan tarif parkir progresif.
"use strict";

const MS_PER_JAM = 60 * 60 * 1000;

/**
 * Menghitung jumlah jam parkir, dibulatkan ke atas.
 * Minimum 1 jam walau durasi kurang dari itu.
 */
function hitungJumlahJam(waktuMasuk, waktuKeluar) {
  const masuk = new Date(waktuMasuk).getTime();
  const keluar = new Date(waktuKeluar).getTime();
  const selisihMs = Math.max(0, keluar - masuk);
  const jam = Math.ceil(selisihMs / MS_PER_JAM);
  return Math.max(1, jam);
}

/**
 * Menghitung tarif progresif.
 * Jam pertama: tarifJamPertama.
 * Setiap jam berikutnya: tarifPerJamBerikutnya.
 */
function hitungTarif(waktuMasuk, waktuKeluar, aturanTarif) {
  const jumlahJam = hitungJumlahJam(waktuMasuk, waktuKeluar);
  const jamTambahan = Math.max(0, jumlahJam - 1);
  const total =
    aturanTarif.tarif_jam_pertama + jamTambahan * aturanTarif.tarif_per_jam_berikutnya;
  return { jumlahJam, total };
}

module.exports = { hitungJumlahJam, hitungTarif, MS_PER_JAM };
