(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    setupHeroSlider();
    setupLocalFilter();
    setupSearchPage();
  });

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (!slides.length || !dots.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function next() {
      activate((current + 1) % slides.length);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(next, 5000);
      });
    });

    activate(0);
    timer = setInterval(next, 5000);
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var empty = document.querySelector("[data-no-results]");

    if (!input || !cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-page-input]");

    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;
    input.dispatchEvent(new Event("input"));
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("moviePlayer");
  var start = document.getElementById("playerStart");
  var overlay = document.querySelector(".player-overlay");
  var loaded = false;

  if (!video || !start || !overlay || !streamUrl) {
    return;
  }

  function attachAndPlay() {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    overlay.classList.add("is-hidden");
    video.controls = true;
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {});
    }
  }

  start.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    attachAndPlay();
  });

  overlay.addEventListener("click", attachAndPlay);
  video.addEventListener("click", function () {
    if (video.paused) {
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    } else {
      video.pause();
    }
  });
}
