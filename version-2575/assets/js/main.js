(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-main-nav]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-left"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });

    document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-right"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function nextSlide() {
        showSlide(current + 1);
      }

      function startTimer() {
        stopTimer();
        timer = window.setInterval(nextSlide, 5200);
      }

      function stopTimer() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")));
          startTimer();
        });
      });

      carousel.addEventListener("mouseenter", stopTimer);
      carousel.addEventListener("mouseleave", startTimer);
      showSlide(0);
      startTimer();
    }

    var panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search-card]"));
      var input = panel.querySelector("[data-local-search]");
      var clearButton = panel.querySelector("[data-clear-filter]");
      var chipButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-chip-filter]"));
      var selectFilters = Array.prototype.slice.call(panel.querySelectorAll("[data-select-filter]"));
      var count = root.querySelector("[data-result-count]");

      if (input && input.getAttribute("data-url-query")) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get(input.getAttribute("data-url-query"));
        if (q) {
          input.value = q;
        }
      }

      function activeChipText() {
        var active = chipButtons.find(function (button) {
          return button.classList.contains("active");
        });
        return active ? active.getAttribute("data-chip-filter") : "all";
      }

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var chip = activeChipText();
        var selectValues = {};
        var visible = 0;

        selectFilters.forEach(function (select) {
          selectValues[select.getAttribute("data-select-filter")] = select.value;
        });

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search-text") || "").toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) >= 0;
          var matchChip = chip === "all" || haystack.indexOf(chip.toLowerCase()) >= 0;
          var matchSelects = Object.keys(selectValues).every(function (key) {
            var value = selectValues[key];
            if (!value) {
              return true;
            }
            return (card.getAttribute("data-" + key) || "").indexOf(value) >= 0;
          });
          var show = matchQuery && matchChip && matchSelects;
          card.classList.toggle("is-hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible > 0 ? "已匹配到相关内容" : "暂无匹配内容";
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      chipButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          chipButtons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          applyFilters();
        });
      });

      selectFilters.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          chipButtons.forEach(function (item) {
            item.classList.toggle("active", item.getAttribute("data-chip-filter") === "all");
          });
          selectFilters.forEach(function (select) {
            select.value = "";
          });
          applyFilters();
        });
      }

      applyFilters();
    });
  });
})();
