(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dots] button"));
      var current = 0;

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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query) {
        filterInput.value = query;
      }

      function applyFilter() {
        var keyword = normalize(filterInput.value);
        var category = categoryFilter ? normalize(categoryFilter.value) : "";
        var year = yearFilter ? normalize(yearFilter.value) : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.category,
            card.dataset.year,
            card.textContent
          ].join(" "));
          var cardCategory = normalize(card.dataset.category);
          var cardYear = normalize(card.dataset.year);
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedCategory = !category || cardCategory === category;
          var matchedYear = !year || cardYear === year;
          var matched = matchedKeyword && matchedCategory && matchedYear;

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("show", visible === 0);
        }
      }

      filterInput.addEventListener("input", applyFilter);

      if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilter);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
      }

      applyFilter();
    }
  });
})();
