(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    document.querySelectorAll(".constellation .pulse").forEach(function (el) {
      el.remove();
    });
  }

  /* ---------- starfield (static) ---------- */

  var canvas = document.getElementById("starfield");
  var ctx = canvas.getContext("2d");

  // Star positions are stored as fractions of the screen so a resize
  // (e.g. a phone's address bar hiding) doesn't reshuffle them.
  var stars = [];
  for (var i = 0; i < 260; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.5 + 0.35
    });
  }

  function drawStars() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var count = Math.min(stars.length, Math.round((width * height) / 6500));
    for (var i = 0; i < count; i++) {
      var s = stars[i];
      ctx.beginPath();
      ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(230, 225, 255," + s.alpha + ")";
      ctx.fill();
    }
  }

  drawStars();
  window.addEventListener("resize", drawStars);

  /* ---------- mobile nav ---------- */

  var sidenav = document.getElementById("sidenav");
  var hamburger = document.getElementById("hamburger");
  var overlay = document.getElementById("navOverlay");

  function closeNav() {
    var wasOpen = sidenav.classList.contains("open");
    sidenav.classList.remove("open");
    hamburger.classList.remove("open");
    overlay.classList.remove("show");
    hamburger.setAttribute("aria-expanded", "false");
    return wasOpen;
  }
  function toggleNav() {
    var isOpen = sidenav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    overlay.classList.toggle("show", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      var first = sidenav.querySelector(".sidenav-links a");
      if (first) setTimeout(function () { first.focus(); }, 50);
    }
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && closeNav()) {
      hamburger.focus();
    }
  });

  hamburger.addEventListener("click", toggleNav);
  overlay.addEventListener("click", closeNav);
  document.querySelectorAll(".sidenav-links a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  /* ---------- active section highlighting ---------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".sidenav-links a"));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute("href") === "#" + id;
              link.classList.toggle("active", isActive);
              if (isActive) {
                link.setAttribute("aria-current", "true");
              } else {
                link.removeAttribute("aria-current");
              }
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- scroll progress bar ---------- */

  var progress = document.getElementById("scrollProgress");
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();
