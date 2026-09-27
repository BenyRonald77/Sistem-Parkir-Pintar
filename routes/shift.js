"use strict";

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const store = require("../lib/store");

function ringkasanShift(shiftId) {
  const transaksi = store.query(
    "tiket",
    (t) => t.shift_id === shiftId && t.status === "selesai"
  );
  const totalPendapatan = transaksi.reduce((sum, t) => sum + (t.tarif || 0), 0);
  return { jumlahTransaksi: transaksi.length, totalPendapatan };
}

// ---------- Login/logout shift ----------

router.get("/shift", (req, res, next) => {
  try {
    if (req.session.shiftId) {
      const shift = store.find("shift", req.session.shiftId);
      if (shift && shift.status === "aktif") {
        const ringkasan = ringkasanShift(shift.id);
        return res.render("shift/aktif", {
          title: "Shift Aktif",
          currentPath: "/shift",
          shift,
          petugas: req.session.petugas,
          ringkasan,
        });
      }
      // Data shift sudah tidak konsisten (misalnya dihapus manual), bersihkan sesi.
      delete req.session.shiftId;
      delete req.session.petugas;
    }
    res.render("shift/login", {
      title: "Mulai Shift",
      currentPath: "/shift",
      errorPesan: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/shift/mulai", (req, res, next) => {
  try {
    if (req.session.shiftId) {
      return res.redirect("/shift");
    }

    const kode = (req.body.kode_petugas || "").trim().toUpperCase();
    const petugas = store.query(
      "petugas",
      (p) => p.kode_petugas.toUpperCase() === kode
    )[0];

    if (!petugas) {
      return res.status(404).render("shift/login", {
        title: "Mulai Shift",
        currentPath: "/shift",
        errorPesan: `Kode petugas "${req.body.kode_petugas}" tidak ditemukan. Periksa kembali kode Anda.`,
      });
    }

    const shiftBerjalan = store.query(
      "shift",
      (s) => s.petugas_id === petugas.id && s.status === "aktif"
    )[0];

    if (shiftBerjalan) {
      return res.status(409).render("shift/login", {
        title: "Mulai Shift",
        currentPath: "/shift",
        errorPesan: `${petugas.nama} masih memiliki shift aktif yang belum diakhiri. Akhiri shift tersebut sebelum memulai yang baru.`,
      });
    }

    const shift = store.insert("shift", {
      id: crypto.randomUUID(),
      petugas_id: petugas.id,
      status: "aktif",
      waktu_mulai: new Date().toISOString(),
      waktu_selesai: null,
    });

    req.session.shiftId = shift.id;
    req.session.petugas = { id: petugas.id, nama: petugas.nama, kode_petugas: petugas.kode_petugas };

    const setFlash = req.app.get("setFlash");
    setFlash(req, "sukses", `Shift dimulai untuk ${petugas.nama}.`);
    res.redirect("/shift");
  } catch (err) {
    next(err);
  }
});

router.post("/shift/akhiri", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    if (!req.session.shiftId) {
      return res.redirect("/shift");
    }

    const shift = store.find("shift", req.session.shiftId);
    if (shift) {
      const ringkasan = ringkasanShift(shift.id);
      store.update("shift", shift.id, {
        status: "selesai",
        waktu_selesai: new Date().toISOString(),
      });
      setFlash(
        req,
        "sukses",
        `Shift diakhiri. Total ${ringkasan.jumlahTransaksi} transaksi, pendapatan Rp${ringkasan.totalPendapatan.toLocaleString("id-ID")}.`
      );
    }

    delete req.session.shiftId;
    delete req.session.petugas;
    res.redirect("/shift");
  } catch (err) {
    next(err);
  }
});

// ---------- Laporan pendapatan per shift ----------

router.get("/laporan", (req, res, next) => {
  try {
    const { tanggal_mulai, tanggal_selesai } = req.query;
    let shiftList = store.all("shift");
    const petugasList = store.all("petugas");
    const petugasById = new Map(petugasList.map((p) => [p.id, p]));

    if (tanggal_mulai) {
      const awal = new Date(tanggal_mulai + "T00:00:00").getTime();
      shiftList = shiftList.filter((s) => new Date(s.waktu_mulai).getTime() >= awal);
    }
    if (tanggal_selesai) {
      const akhir = new Date(tanggal_selesai + "T23:59:59").getTime();
      shiftList = shiftList.filter((s) => new Date(s.waktu_mulai).getTime() <= akhir);
    }

    shiftList.sort((a, b) => new Date(b.waktu_mulai) - new Date(a.waktu_mulai));

    const baris = shiftList.map((s) => {
      const ringkasan = ringkasanShift(s.id);
      const petugas = petugasById.get(s.petugas_id);
      return {
        id: s.id,
        namaPetugas: petugas ? petugas.nama : "(petugas tidak dikenal)",
        status: s.status,
        waktu_mulai: s.waktu_mulai,
        waktu_selesai: s.waktu_selesai,
        jumlahTransaksi: ringkasan.jumlahTransaksi,
        totalPendapatan: ringkasan.totalPendapatan,
      };
    });

    const totalKeseluruhan = baris.reduce((sum, b) => sum + b.totalPendapatan, 0);
    const totalTransaksiKeseluruhan = baris.reduce((sum, b) => sum + b.jumlahTransaksi, 0);

    res.render("shift/laporan", {
      title: "Laporan Pendapatan",
      currentPath: "/laporan",
      baris,
      totalKeseluruhan,
      totalTransaksiKeseluruhan,
      adaDataShiftSamaSekali: store.all("shift").length > 0,
      filter: { tanggal_mulai: tanggal_mulai || "", tanggal_selesai: tanggal_selesai || "" },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
