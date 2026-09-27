"use strict";

const express = require("express");
const router = express.Router();
const store = require("../lib/store");

function statusLantai(l) {
  if (l.kapasitas_total <= 0) return "penuh";
  const rasio = l.slot_terisi / l.kapasitas_total;
  if (l.slot_terisi >= l.kapasitas_total) return "penuh";
  if (rasio >= 0.85) return "hampir-penuh";
  return "tersedia";
}

router.get("/", (req, res, next) => {
  try {
    const lantai = store.all("lantai").map((l) => ({
      ...l,
      status: statusLantai(l),
    }));
    res.render("monitor", {
      title: "Monitor Kapasitas",
      currentPath: "/",
      lantai,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.statusLantai = statusLantai;
