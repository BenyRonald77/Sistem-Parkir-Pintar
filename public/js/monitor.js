(function () {
  var grid = document.getElementById("kapasitasGrid");
  var kosong = document.getElementById("lantaiKosong");
  var indikator = document.getElementById("realtimeIndicator");
  var indikatorText = document.getElementById("realtimeText");

  function hitungStatus(l) {
    if (l.kapasitas_total <= 0 || l.slot_terisi >= l.kapasitas_total) return "penuh";
    if (l.slot_terisi / l.kapasitas_total >= 0.85) return "hampir-penuh";
    return "tersedia";
  }

  function labelStatus(status) {
    if (status === "penuh") return "PENUH";
    if (status === "hampir-penuh") return "HAMPIR PENUH";
    return "TERSEDIA";
  }

  function kartuHtml(l) {
    var status = hitungStatus(l);
    var persen = l.kapasitas_total > 0 ? Math.min(100, Math.round((l.slot_terisi / l.kapasitas_total) * 100)) : 100;
    return (
      '<div class="kartu-lantai" data-lantai-id="' + l.id + '" data-status="' + status + '">' +
      '<div class="kartu-lantai__nama"></div>' +
      '<div class="kartu-lantai__angka"><span class="nilai-terisi"></span><span></span></div>' +
      '<div class="level-bar"><div class="level-bar__fill" style="width:' + persen + '%"></div></div>' +
      '<div class="status-label">' + labelStatus(status) + "</div>" +
      "</div>"
    );
  }

  function renderGrid(daftarLantai) {
    if (!daftarLantai || daftarLantai.length === 0) {
      grid.innerHTML = "";
      if (kosong) kosong.style.display = "";
      return;
    }
    if (kosong) kosong.style.display = "none";

    grid.innerHTML = daftarLantai.map(kartuHtml).join("");

    daftarLantai.forEach(function (l) {
      var kartu = grid.querySelector('[data-lantai-id="' + l.id + '"]');
      if (!kartu) return;
      kartu.querySelector(".kartu-lantai__nama").textContent = l.nama;
      kartu.querySelector(".nilai-terisi").textContent = l.slot_terisi;
      kartu.querySelector(".kartu-lantai__angka span:last-child").textContent = " / " + l.kapasitas_total + " slot";
    });
  }

  function tandaiUpdate(daftarLantai) {
    (daftarLantai || []).forEach(function (l) {
      var kartu = grid.querySelector('[data-lantai-id="' + l.id + '"]');
      if (!kartu) return;
      kartu.classList.add("baru-update");
      setTimeout(function () {
        kartu.classList.remove("baru-update");
      }, 900);
    });
  }

  renderGrid(window.__DATA_LANTAI__ || []);

  if (typeof io === "function") {
    var socket = io();

    socket.on("connect", function () {
      indikator.setAttribute("data-terhubung", "true");
      indikatorText.textContent = "Terhubung, kapasitas diperbarui secara langsung";
    });

    socket.on("disconnect", function () {
      indikator.setAttribute("data-terhubung", "false");
      indikatorText.textContent = "Koneksi realtime terputus. Data di layar bisa jadi tidak terbaru, mencoba menghubungkan kembali...";
    });

    socket.on("connect_error", function () {
      indikator.setAttribute("data-terhubung", "false");
      indikatorText.textContent = "Gagal terhubung ke pembaruan realtime. Muat ulang halaman jika masalah berlanjut.";
    });

    socket.on("kapasitas:update", function (payload) {
      renderGrid(payload.lantai);
      tandaiUpdate(payload.lantai);
    });
  } else {
    indikatorText.textContent = "Pembaruan realtime tidak tersedia di browser ini. Muat ulang halaman secara berkala.";
  }
})();
