(function() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.dataset.slide || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(active + 1);
      }, 6200);
    }
  }

  const filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    const input = filterScope.querySelector('[data-filter-keyword]');
    const year = filterScope.querySelector('[data-filter-year]');
    const region = filterScope.querySelector('[data-filter-region]');
    const cards = Array.from(document.querySelectorAll('[data-filter-list] .movie-card'));

    function applyFilters() {
      const keyword = (input && input.value || '').trim().toLowerCase();
      const selectedYear = year && year.value || '';
      const selectedRegion = region && region.value || '';

      cards.forEach(function(card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
        const passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const passYear = !selectedYear || card.dataset.year === selectedYear;
        const passRegion = !selectedRegion || card.dataset.region === selectedRegion;
        card.style.display = passKeyword && passYear && passRegion ? '' : 'none';
      });
    }

    [input, year, region].forEach(function(el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });
  }

  const searchInput = document.getElementById('global-search');
  const searchType = document.getElementById('search-type');
  const searchButton = document.getElementById('search-button');
  const searchResults = document.getElementById('search-results');

  if (searchInput && searchResults && window.MovieSearchItems) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      searchInput.value = params.get('q');
    }

    function cardTemplate(item) {
      const tags = item.tags.slice(0, 3).map(function(tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card compact">',
        '<a class="poster" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-play">▶</span>',
        '<span class="poster-year">' + escapeHtml(item.year) + '</span>',
        '</a>',
        '<div class="movie-info">',
        '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function(character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function runSearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      const type = searchType && searchType.value || '';
      const pool = window.MovieSearchItems.filter(function(item) {
        const haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
        const passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const passType = !type || item.type === type;
        return passKeyword && passType;
      }).slice(0, 60);

      searchResults.innerHTML = pool.map(cardTemplate).join('');
    }

    searchInput.addEventListener('input', runSearch);
    if (searchType) {
      searchType.addEventListener('change', runSearch);
    }
    if (searchButton) {
      searchButton.addEventListener('click', runSearch);
    }
    if (searchInput.value) {
      runSearch();
    }
  }
})();
