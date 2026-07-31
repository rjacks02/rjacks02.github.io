(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    document.querySelectorAll(".constellation .pulse").forEach(function (el) {
      el.remove();
    });
  }

  /* ---------- starfield ---------- */

  var canvas = document.getElementById("starfield");
  var ctx = canvas.getContext("2d");
  var stars = [];
  var shootingStars = [];
  var width, height, dpr;

  function starCount() {
    var area = window.innerWidth * window.innerHeight;
    return Math.min(260, Math.round(area / 6500));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    var count = starCount();
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005
      });
    }
  }

  function maybeSpawnShootingStar() {
    if (reduceMotion) return;
    if (Math.random() < 0.0035 && shootingStars.length < 2) {
      var startX = Math.random() * width * 0.6 + width * 0.2;
      shootingStars.push({
        x: startX,
        y: -20,
        len: Math.random() * 90 + 60,
        vx: -(Math.random() * 4 + 5),
        vy: Math.random() * 4 + 5,
        life: 1
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = s.baseAlpha;
      if (!reduceMotion) {
        alpha = s.baseAlpha + Math.sin(time * s.speed + s.phase) * 0.25;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(230, 225, 255," + Math.max(0.08, alpha) + ")";
      ctx.fill();
    }

    if (!reduceMotion) {
      maybeSpawnShootingStar();
      for (var j = shootingStars.length - 1; j >= 0; j--) {
        var sh = shootingStars[j];
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * (sh.len / 6), sh.y - sh.vy * (sh.len / 6));
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(167,139,250,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * (sh.len / 6), sh.y - sh.vy * (sh.len / 6));
        ctx.stroke();

        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.012;
        if (sh.life <= 0 || sh.x < -50 || sh.y > height + 50) {
          shootingStars.splice(j, 1);
        }
      }
    }

    if (!reduceMotion) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
  if (reduceMotion) {
    draw(0);
  }

  /* ---------- mobile nav ---------- */

  var sidenav = document.getElementById("sidenav");
  var hamburger = document.getElementById("hamburger");
  var overlay = document.getElementById("navOverlay");

  function closeNav() {
    sidenav.classList.remove("open");
    hamburger.classList.remove("open");
    overlay.classList.remove("show");
  }
  function toggleNav() {
    var isOpen = sidenav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    overlay.classList.toggle("show", isOpen);
  }

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
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
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

  /* ---------- scroll reveal ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + "ms";
      if (isInViewport(el)) {
        el.classList.add("visible");
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
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
