"use strict";

const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { hitungTarif } = require("../lib/tarif");
const { siarkanKapasitas } = require("../lib/broadcast");

// Kendaraan keluar memerlukan shift petugas aktif karena transaksi ini
// menghasilkan pendapatan yang harus tercatat atas nama petugas yang bertugas.

router.get("/keluar", (req, res, next) => {
  try {
    if (!req.session.shiftId) {
      const setFlash = req.app.get("setFlash");
      setFlash(req, "info", "Mulai shift terlebih dahulu sebelum memproses kendaraan keluar.");
      return res.redirect("/shift");
    }
    res.render("tiket/keluar", {
      title: "Kendaraan Keluar",
      currentPath: "/keluar",
      hasil: null,
      errorPesan: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/keluar", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    if (!req.session.shiftId) {
      setFlash(req, "info", "Mulai shift terlebih dahulu sebelum memproses kendaraan keluar.");
      return res.redirect("/shift");
    }

    const kodeTiket = (req.body.kode_tiket || "").trim().toUpperCase();
    const tiket = store.query("tiket", (t) => t.kode_tiket === kodeTiket)[0];

    if (!tiket) {
      return res.status(404).render("tiket/keluar", {
        title: "Kendaraan Keluar",
        currentPath: "/keluar",
        hasil: null,
        errorPesan: `Kode tiket "${kodeTiket}" tidak ditemukan. Periksa kembali kode pada tiket atau QR.`,
      });
    }
    if (tiket.status !== "aktif") {
      return res.status(409).render("tiket/keluar", {
        title: "Kendaraan Keluar",
        currentPath: "/keluar",
        hasil: null,
        errorPesan: `Tiket "${kodeTiket}" sudah pernah diproses keluar pada ${new Date(tiket.waktu_keluar).toLocaleString("id-ID")}.`,
      });
    }

    const lantai = store.find("lantai", tiket.lantai_id);
    const aturanTarif = store.query("tarif", (t) => t.aktif)[0];

    if (!aturanTarif) {
      return res.status(500).render("tiket/keluar", {
        title: "Kendaraan Keluar",
        currentPath: "/keluar",
        hasil: null,
        errorPesan: "Tidak ada aturan tarif aktif. Hubungi admin untuk mengatur tarif di menu Kelola Lantai & Tarif.",
      });
    }

    const waktuKeluar = new Date().toISOString();
    const { jumlahJam, total } = hitungTarif(tiket.waktu_masuk, waktuKeluar, aturanTarif);

    const tiketDiperbarui = store.update("tiket", tiket.id, {
      status: "selesai",
      waktu_keluar: waktuKeluar,
      tarif: total,
      shift_id: req.session.shiftId,
    });

    if (lantai) {
      store.update("lantai", lantai.id, { slot_terisi: Math.max(0, lantai.slot_terisi - 1) });
    }
    siarkanKapasitas(req.app.get("io"));

    res.render("tiket/keluar", {
      title: "Kendaraan Keluar",
      currentPath: "/keluar",
      errorPesan: null,
      hasil: {
        kode_tiket: tiketDiperbarui.kode_tiket,
        lantaiNama: lantai ? lantai.nama : "(lantai sudah dihapus)",
        waktu_masuk: tiket.waktu_masuk,
        waktu_keluar: waktuKeluar,
        jumlahJam,
        tarif: total,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
