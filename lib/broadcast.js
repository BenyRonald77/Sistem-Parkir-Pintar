// Menyiarkan kapasitas lantai terbaru ke semua klien socket.io.
"use strict";

const store = require("./store");

function daftarKapasitas() {
  return store.all("lantai").map((l) => ({
    id: l.id,
    nama: l.nama,
    kapasitas_total: l.kapasitas_total,
    slot_terisi: l.slot_terisi,
  }));
}

function siarkanKapasitas(io) {
  if (!io) return;
  io.emit("kapasitas:update", { lantai: daftarKapasitas(), waktu: new Date().toISOString() });
}

module.exports = { daftarKapasitas, siarkanKapasitas };
