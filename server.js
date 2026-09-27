"use strict";

const path = require("path");
const http = require("http");
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const { Server: SocketIOServer } = require("socket.io");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("io", io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "sistem-parkir-pintar-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 12 * 60 * 60 * 1000 }, // 12 jam, cukup untuk satu shift panjang
  })
);

// Flash sederhana lewat session, tanpa dependensi tambahan.
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.petugasAktif = req.session.petugas || null;
  next();
});

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}
app.set("setFlash", setFlash);

app.use("/", require("./routes/monitor"));
app.use("/lantai", require("./routes/lantai"));
app.use("/", require("./routes/masuk"));
app.use("/", require("./routes/keluar"));
app.use("/", require("./routes/shift"));

app.use((req, res) => {
  res.status(404).render("error", {
    title: "Halaman Tidak Ditemukan",
    kode: 404,
    pesan: `Halaman "${req.path}" tidak ada di Sistem Parkir Pintar.`,
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "Terjadi Kesalahan",
    kode: 500,
    pesan: "Terjadi kesalahan pada server. Coba muat ulang halaman ini.",
  });
});

io.on("connection", () => {
  // Klien hanya perlu mendengarkan event 'kapasitas:update', tidak ada
  // aksi masuk dari klien yang perlu ditangani di sini.
});

server.listen(PORT, () => {
  console.log(`Sistem Parkir Pintar berjalan di http://localhost:${PORT}`);
});

module.exports = { app, server, io };
