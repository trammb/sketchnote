/* ============================================================
   script.js: render nội dung từ data.js + xử lý giao diện
   Bình thường bạn KHÔNG cần sửa file này.
   Mọi nội dung cần thay đều nằm trong data.js
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Gom dữ liệu từ data.js ----------
     Nếu mở với ?preview=1 (nút "Xem trước" trong trang admin.html),
     web sẽ lấy bản nháp trong localStorage thay cho data.js.
  ------------------------------------------------------------ */
  var D = {};
  ["SITE", "PINTEREST_BOARD_URL", "PINTEREST_WIDGET", "GALLERY_FALLBACK",
   "LIVE_GALLERY", "SERVICES", "COURSES", "FEEDBACKS"].forEach(function (k) {
    try { D[k] = eval(k); } catch (e) { D[k] = undefined; }
  });

  if (location.search.indexOf("preview=1") > -1) {
    try {
      var draft = JSON.parse(localStorage.getItem("sketchnote-admin-draft") || "null");
      if (draft) {
        Object.keys(draft).forEach(function (k) { D[k] = draft[k]; });
        var flag = document.createElement("div");
        flag.textContent = "Đang xem trước bản nháp từ trang admin, chưa lưu vào data.js";
        flag.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:999;background:#0E5A66;" +
          "color:#fff;text-align:center;padding:.6rem 1rem;font:600 13px/1.4 Mulish,sans-serif";
        document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(flag); });
      }
    } catch (e) {}
  }

  /* Ảnh chưa có thì hiện nền nhạt thay vì icon vỡ */
  function softenImages(scope) {
    $$("img", scope).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("img-missing");
        img.removeAttribute("src");
      }, { once: true });
    });
  }

  /* ---------- Bộ icon line-art (cùng style với minh hoạ) ---------- */
  function ico(paths) {
    return '<svg viewBox="0 0 48 48" fill="none" stroke="#0E5A66" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }
  var ICONS = {
    // 5 dịch vụ
    "day-sketchnote": ico('<rect x="8" y="7" width="26" height="32" rx="3"/><path d="M8 7q-5 16 0 32"/><path d="M15 16h12M15 22h14M15 28h9"/><path d="M40 12l4 4-13 13-5 1 1-5z"/>'),
    "calligraphy":    ico('<path d="M6 36q12 2 24 0"/><path d="M11 30q0-16 8-16t5 20q-2 10-9 8t-1-16"/><path d="M27 30q-7 0-6-6t10-2-2 9q6 3 9-2"/><path d="M36 14l6 6"/>'),
    "training":       ico('<circle cx="17" cy="15" r="5"/><circle cx="32" cy="17" r="4"/><path d="M8 36q0-8 9-8t9 8"/><path d="M29 26q8 0 9 9"/><path d="M20 41h8"/>'),
    "live-recording": ico('<rect x="6" y="8" width="30" height="21" rx="2"/><path d="M11 14h18M11 19h12"/><path d="M21 29v8M15 41h12"/><path d="M40 13l4 4-9 9-5 1 1-5z"/>'),
    "ve-theo-yeu-cau":ico('<path d="M6 14q7-4 14 0v20q-7-4-14 0z"/><path d="M20 14q7-4 14 0v20q-7-4-14 0z"/><path d="M20 14v20"/><path d="M38 20h8l-2 20h-4z"/><path d="M46 24q4 3 0 7"/>'),
    // 4 điểm mạnh
    "pen":   ico('<path d="M12 38l-5 4 2-8 22-24 6 5-22 24z"/><path d="M31 10l6 5"/><path d="M9 34l6 5"/>'),
    "globe": ico('<circle cx="24" cy="24" r="16"/><path d="M8 24h32"/><path d="M24 8q8 8 8 16t-8 16q-8-8-8-16t8-16"/>'),
    "star":  ico('<path d="M24 7l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"/>'),
    "cup":   ico('<path d="M11 16h22l-3 24H14z"/><path d="M33 20q7 4 0 11"/><path d="M17 10q2-3 0-5M24 10q2-3 0-5M31 10q2-3 0-5"/>')
  };

  /* ---------- Link liên hệ lấy từ SITE ---------- */
  function wireContacts(scope) {
    if (!D.SITE) return;
    var SITE = D.SITE;
    var mailto = "mailto:" + SITE.email;
    $$("[data-site-email]", scope).forEach(function (el) {
      el.href = mailto;
      if (el.dataset.siteEmail === "text") el.textContent = SITE.email;
    });
    $$("[data-site-instagram]", scope).forEach(function (el) { el.href = SITE.instagram; });
    $$("[data-site-tiktok]", scope).forEach(function (el) { el.href = SITE.tiktok; });
    $$("[data-site-zalo]", scope).forEach(function (el) {
      if (SITE.zalo) el.href = SITE.zalo;
      else (el.closest("li") || el).remove();
    });
    $$("[data-site-register]", scope).forEach(function (el) {
      el.href = SITE.registerForm || mailto;
      if (SITE.registerForm) { el.target = "_blank"; el.rel = "noopener"; }
    });
  }

  /* ---------- Dải 4 điểm mạnh ---------- */
  var STRIP = [
    { icon: "pen",   text: "Dạy từ nét cơ bản, không cần biết vẽ" },
    { icon: "globe", text: "Nhận lớp online và offline" },
    { icon: "star",  text: "6 năm đứng lớp, trẻ em tới người đi làm" },
    { icon: "cup",   text: "Nhận vẽ theo yêu cầu: sách, ly, minh hoạ" }
  ];
  var strip = $("#strip");
  if (strip) {
    strip.innerHTML = STRIP.map(function (i) {
      return '<div class="strip-item">' + ICONS[i.icon] + "<span>" + i.text + "</span></div>";
    }).join("");
  }

  /* ---------- Thẻ dịch vụ ---------- */
  var cards = $("#service-cards");
  if (cards && D.SERVICES) {
    cards.innerHTML = D.SERVICES.map(function (s) {
      return '<article class="card reveal">' + (ICONS[s.id] || "") +
        "<h3>" + s.title + "</h3><p>" + s.short + "</p>" +
        '<a class="btn btn--text btn--sm" href="#' + s.id + '">Xem thêm</a></article>';
    }).join("");
  }

  /* ---------- Chi tiết từng dịch vụ ---------- */
  var details = $("#service-details");
  if (details && D.SERVICES) {
    details.innerHTML = D.SERVICES.map(function (s) {
      return '<section class="svc" id="' + s.id + '"><div class="svc-body">' +
        '<div class="svc-media"><img src="' + s.image + '" alt="Minh hoạ ' + s.title + '" loading="lazy"></div>' +
        '<div><span class="eyebrow">' + s.tag + "</span>" +
          '<h2 class="display" style="font-size:clamp(1.7rem,5.5vw,2.4rem)">' + s.title + "</h2>" +
          "<p>" + s.desc + "</p>" +
          '<div class="svc-cols">' +
            "<div><h4>Phù hợp với</h4><ul class=\"check-list\">" +
              s.forWho.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
            "<div><h4>Bạn nhận được</h4><ul class=\"check-list\">" +
              s.benefits.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
          "</div>" +
          '<ul class="tag-list">' + s.formats.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>" +
          '<div class="note-box"><p>' + s.note + "</p></div>" +
          '<p style="margin-top:1.3rem"><a class="btn btn--sm" data-site-register href="#">Nhận tư vấn</a></p>' +
        "</div></div></section>";
    }).join("");
    softenImages(details);
  }

  /* ---------- Feedback ---------- */
  var fbTrack = $("#feedback-track");
  if (fbTrack && D.FEEDBACKS) {
    // Feedback chỉ hiện chữ, không kèm ảnh
    fbTrack.innerHTML = D.FEEDBACKS.map(function (f) {
      return '<article class="fb-card">' +
        '<div class="fb-stars" aria-label="5 sao">★★★★★</div>' +
        '<blockquote class="fb-quote">“' + f.quote + '”</blockquote>' +
        '<div class="fb-name">' + f.name + "</div>" +
        '<div class="fb-role">' + (f.role || "") + "</div></article>";
    }).join("");

    var step = function (dir) {
      var card = $(".fb-card", fbTrack);
      var w = card ? card.getBoundingClientRect().width + 16 : 300;
      fbTrack.scrollBy({ left: dir * w, behavior: "smooth" });
    };
    var p = $("[data-fb-prev]"), n = $("[data-fb-next]");
    if (p) p.addEventListener("click", function () { step(-1); });
    if (n) n.addEventListener("click", function () { step(1); });
  }

  /* ---------- Khoá học ---------- */
  var courseGrid = $("#course-grid");
  if (courseGrid && D.COURSES) {
    courseGrid.innerHTML = D.COURSES.map(function (c) {
      return '<article class="course reveal">' +
        '<img src="' + c.cover + '" alt="Ảnh bìa khoá ' + c.title + '" loading="lazy">' +
        '<div class="body"><div class="course-meta"><span>' + c.level + "</span><span>" + c.lessons + "</span></div>" +
        "<h3>" + c.title + "</h3><p>" + c.desc + "</p>" +
        '<a class="btn btn--sm" href="' + c.url + '" target="_blank" rel="noopener">Xem trên Udemy</a>' +
        "</div></article>";
    }).join("");
    softenImages(courseGrid);
  }

  /* ---------- Gallery live recording ---------- */
  var liveGrid = $("#live-gallery");
  if (liveGrid && D.LIVE_GALLERY) {
    liveGrid.innerHTML = D.LIVE_GALLERY.map(function (g) {
      return "<figure><img src='" + g.src + "' alt='" + g.caption + "' loading='lazy'>" +
             "<figcaption>" + g.caption + "</figcaption></figure>";
    }).join("");
    softenImages(liveGrid);
  }

  /* ---------- Thư viện Pinterest ----------
     Widget chính chủ (assets.pinterest.com/js/pinit.js).
     Sau 3.5 giây chưa dựng xong → chuyển sang ảnh tĩnh GALLERY_FALLBACK.
  ------------------------------------------------------------ */
  var pinBox = $("#pinterest-embed");
  if (pinBox && D.PINTEREST_BOARD_URL) {
    var fallbackBox = $("#pinterest-fallback");
    $$("[data-pin-link]").forEach(function (a) { a.href = D.PINTEREST_BOARD_URL; });

    var a = document.createElement("a");
    a.href = D.PINTEREST_BOARD_URL;
    a.setAttribute("data-pin-do", "embedBoard");
    a.setAttribute("data-pin-board-width", String(D.PINTEREST_WIDGET.boardWidth));
    a.setAttribute("data-pin-scale-height", String(D.PINTEREST_WIDGET.boardHeight));
    a.setAttribute("data-pin-scale-width", String(D.PINTEREST_WIDGET.imageWidth));
    pinBox.appendChild(a);

    var sc = document.createElement("script");
    sc.async = true; sc.defer = true;
    sc.src = "https://assets.pinterest.com/js/pinit.js";
    document.body.appendChild(sc);

    var showFallback = function () {
      if (!fallbackBox || fallbackBox.dataset.rendered === "1") return;
      fallbackBox.dataset.rendered = "1";
      fallbackBox.hidden = false;
      pinBox.hidden = true;
      $(".gallery-grid", fallbackBox).innerHTML = D.GALLERY_FALLBACK.map(function (g) {
        return "<figure><img src='" + g.src + "' alt='" + g.alt + "' loading='lazy'></figure>";
      }).join("");
      softenImages(fallbackBox);
    };
    sc.addEventListener("error", showFallback);
    setTimeout(function () {
      var built = pinBox.querySelector("iframe, span[data-pin-href], .PIN_");
      if (!built) showFallback();
      else { var l = $(".pin-loading", pinBox); if (l) l.remove(); }
    }, 3500);
  }

  /* ---------- Đánh dấu mục đang xem trên menu ---------- */
  var navAnchors = $$('.site-header .nav-links a[href^="#"]');
  var sections = navAnchors
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------- Hiện dần khi cuộn ---------- */
  var revealables = $$(".reveal");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Năm hiện tại ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  wireContacts(document);
  softenImages(document);
})();
