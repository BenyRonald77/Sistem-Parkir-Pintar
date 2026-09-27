"use strict";

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const store = require("../lib/store");
const { siarkanKapasitas } = require("../lib/broadcast");

function parseKapasitas(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : NaN;
}

router.get("/", (req, res, next) => {
  try {
    const lantai = store.all("lantai");
    const tarif = store.all("tarif");
    const tarifAktif = tarif.find((t) => t.aktif) || null;
    res.render("lantai/index", {
      title: "Kelola Lantai & Tarif",
      currentPath: "/lantai",
      lantai,
      tarifAktif,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    const nama = (req.body.nama || "").trim();
    const kapasitas = parseKapasitas(req.body.kapasitas_total);

    if (!nama) {
      setFlash(req, "error", "Nama lantai wajib diisi.");
      return res.redirect("/lantai");
    }
    if (!Number.isInteger(kapasitas) || kapasitas < 1) {
      setFlash(req, "error", "Kapasitas total harus berupa angka lebih besar dari 0.");
      return res.redirect("/lantai");
    }

    store.insert("lantai", {
      id: crypto.randomUUID(),
      nama,
      kapasitas_total: kapasitas,
      slot_terisi: 0,
      dibuat_pada: new Date().toISOString(),
    });

    siarkanKapasitas(req.app.get("io"));
    setFlash(req, "sukses", `Lantai "${nama}" berhasil ditambahkan.`);
    res.redirect("/lantai");
  } catch (err) {
    next(err);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    const lantai = store.find("lantai", req.params.id);
    if (!lantai) {
      setFlash(req, "error", "Lantai tidak ditemukan.");
      return res.redirect("/lantai");
    }

    const nama = (req.body.nama || "").trim();
    const kapasitas = parseKapasitas(req.body.kapasitas_total);

    if (!nama) {
      setFlash(req, "error", "Nama lantai wajib diisi.");
      return res.redirect("/lantai");
    }
    if (!Number.isInteger(kapasitas) || kapasitas < 1) {
      setFlash(req, "error", "Kapasitas total harus berupa angka lebih besar dari 0.");
      return res.redirect("/lantai");
    }
    if (kapasitas < lantai.slot_terisi) {
      setFlash(
        req,
        "error",
        `Kapasitas baru (${kapasitas}) tidak boleh lebih kecil dari slot yang sedang terisi (${lantai.slot_terisi}).`
      );
      return res.redirect("/lantai");
    }

    store.update("lantai", lantai.id, { nama, kapasitas_total: kapasitas });
    siarkanKapasitas(req.app.get("io"));
    setFlash(req, "sukses", `Lantai "${nama}" berhasil diperbarui.`);
    res.redirect("/lantai");
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    const lantai = store.find("lantai", req.params.id);
    if (!lantai) {
      setFlash(req, "error", "Lantai tidak ditemukan.");
      return res.redirect("/lantai");
    }

    const adaTiketAktif = store.query(
      "tiket",
      (t) => t.lantai_id === lantai.id && t.status === "aktif"
    ).length > 0;

    if (adaTiketAktif) {
      setFlash(
        req,
        "error",
        `Lantai "${lantai.nama}" tidak bisa dihapus karena masih ada kendaraan yang belum keluar di lantai ini.`
      );
      return res.redirect("/lantai");
    }

    store.remove("lantai", lantai.id);
    siarkanKapasitas(req.app.get("io"));
    setFlash(req, "sukses", `Lantai "${lantai.nama}" berhasil dihapus.`);
    res.redirect("/lantai");
  } catch (err) {
    next(err);
  }
});

// --- Tarif progresif (satu aturan aktif, diedit di tempat) ---

router.put("/tarif/:id", (req, res, next) => {
  try {
    const setFlash = req.app.get("setFlash");
    const aturan = store.find("tarif", req.params.id);
    if (!aturan) {
      setFlash(req, "error", "Aturan tarif tidak ditemukan.");
      return res.redirect("/lantai");
    }

    const jamPertama = parseKapasitas(req.body.tarif_jam_pertama);
    const jamBerikutnya = parseKapasitas(req.body.tarif_per_jam_berikutnya);

    if (!Number.isInteger(jamPertama) || jamPertama < 0) {
      setFlash(req, "error", "Tarif jam pertama harus berupa angka rupiah yang valid (0 atau lebih).");
      return res.redirect("/lantai");
    }
    if (!Number.isInteger(jamBerikutnya) || jamBerikutnya < 0) {
      setFlash(req, "error", "Tarif per jam berikutnya harus berupa angka rupiah yang valid (0 atau lebih).");
      return res.redirect("/lantai");
    }

    store.update("tarif", aturan.id, {
      tarif_jam_pertama: jamPertama,
      tarif_per_jam_berikutnya: jamBerikutnya,
      diperbarui_pada: new Date().toISOString(),
    });

    setFlash(req, "sukses", "Aturan tarif berhasil diperbarui.");
    res.redirect("/lantai");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
