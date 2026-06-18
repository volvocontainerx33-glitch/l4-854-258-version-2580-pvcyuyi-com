(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".nav-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-hero-panel]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !panels.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle("is-active", panelIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    var hero = document.querySelector(".hero-section");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function initFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll(".list-filter"));
    filters.forEach(function (input) {
      var selector = input.getAttribute("data-filter-target");
      var target = selector ? document.querySelector(selector) : null;
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-search") || card.textContent.toLowerCase();
          card.classList.toggle("is-filter-hidden", value && haystack.indexOf(value) === -1);
        });
      });
    });
  }

  function createSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"" + escapeHtml(item.file) + "\">" +
      "<div class=\"poster-wrap\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<div class=\"poster-shade\"></div>" +
      "<span class=\"year-pill\">" + escapeHtml(item.year) + "</span>" +
      "</div>" +
      "<div class=\"movie-card-body\">" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p class=\"meta-line\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>" +
      "<p class=\"movie-desc\">" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</a>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-input");
    var title = document.getElementById("search-title");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var list = window.SEARCH_MOVIES.filter(function (item) {
      if (!normalized) {
        return item.featured;
      }
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ").toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = query ? "与“" + query + "”相关的内容" : "精选内容";
    }
    if (!list.length) {
      results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容，可以换一个关键词继续搜索。</div>";
      return;
    }
    results.innerHTML = list.map(createSearchCard).join("");
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initBackTop();
  });
})();

function initMoviePlayer(source, videoId, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay) {
    return;
  }
  var prepared = false;
  var hls = null;
  function attach() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function start() {
    attach();
    overlay.classList.add("is-hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }
  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
