"use strict";

const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");
const router = express.Router();
const store = require("../lib/store");
const { siarkanKapasitas } = require("../lib/broadcast");

function buatKodeTiket() {
  const acak = crypto.randomUUID().split("-")[0].toUpperCase();
  const tanggal = new Date();
  const ymd =
    tanggal.getFullYear().toString().slice(2) +
    String(tanggal.getMonth() + 1).padStart(2, "0") +
    String(tanggal.getDate()).padStart(2, "0");
  return `TKT-${ymd}-${acak}`;
}

function kodeTiketUnik() {
  const semuaTiket = store.all("tiket");
  let kode;
  do {
    kode = buatKodeTiket();
  } while (semuaTiket.some((t) => t.kode_tiket === kode));
  return kode;
}

// Kendaraan masuk bersifat swalayan (self-service), tanpa perlu login
// petugas, sama seperti mesin karcis di gerbang masuk fisik.

router.get("/masuk", (req, res, next) => {
  try {
    const lantai = store.all("lantai");
    res.render("tiket/masuk", {
      title: "Kendaraan Masuk",
      currentPath: "/masuk",
      lantai,
      tiketBaru: null,
      errorPesan: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/masuk", async (req, res, next) => {
  try {
    const lantaiId = req.body.lantai_id;
    const lantai = store.find("lantai", lantaiId);
    const semuaLantai = store.all("lantai");

    if (!lantai) {
      return res.status(400).render("tiket/masuk", {
        title: "Kendaraan Masuk",
        currentPath: "/masuk",
        lantai: semuaLantai,
        tiketBaru: null,
        errorPesan: "Lantai yang dipilih tidak valid. Pilih lantai dari daftar yang tersedia.",
      });
    }

    if (lantai.slot_terisi >= lantai.kapasitas_total) {
      return res.status(409).render("tiket/masuk", {
        title: "Kendaraan Masuk",
        currentPath: "/masuk",
        lantai: semuaLantai,
        tiketBaru: null,
        errorPesan: `${lantai.nama} sudah penuh (${lantai.slot_terisi}/${lantai.kapasitas_total} slot). Arahkan kendaraan ke lantai lain.`,
      });
    }

    const kodeTiket = kodeTiketUnik();
    const waktuMasuk = new Date().toISOString();

    const tiket = store.insert("tiket", {
      id: crypto.randomUUID(),
      kode_tiket: kodeTiket,
      lantai_id: lantai.id,
      status: "aktif",
      waktu_masuk: waktuMasuk,
      waktu_keluar: null,
      tarif: null,
      shift_id: null,
    });

    store.update("lantai", lantai.id, { slot_terisi: lantai.slot_terisi + 1 });
    siarkanKapasitas(req.app.get("io"));

    const qrDataUrl = await QRCode.toDataURL(kodeTiket, { margin: 1, width: 240 });

    res.render("tiket/masuk", {
      title: "Kendaraan Masuk",
      currentPath: "/masuk",
      lantai: store.all("lantai"),
      tiketBaru: { ...tiket, lantaiNama: lantai.nama, qrDataUrl },
      errorPesan: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
