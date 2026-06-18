(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero-carousel]');
    if (!root) return;
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-root]').forEach(function (root) {
      var input = qs('[data-filter-input]', root);
      var cards = qsa('[data-filter-card]', root);
      var empty = qs('[data-empty-state]', root);
      var typeButtons = qsa('[data-type-filter]', root);
      var typeValue = 'all';

      if (root.hasAttribute('data-query-from-url') && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var matchText = !query || text.indexOf(query) !== -1;
          var matchType = typeValue === 'all' || cardType === typeValue;
          var show = matchText && matchType;
          card.classList.toggle('is-filtered-out', !show);
          if (show) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          typeButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          typeValue = button.getAttribute('data-type-filter') || 'all';
          apply();
        });
      });

      apply();
    });
  }

  window.bootPlayer = function (videoId, overlayId, src) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !src) return;
    var attached = false;

    function attach() {
      if (attached) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = src;
      attached = true;
    }

    function start() {
      attach();
      overlay.hidden = true;
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.hidden = false;
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
