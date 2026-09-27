(function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav-utama");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
})();
