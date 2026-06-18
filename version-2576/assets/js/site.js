(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('[data-mobile-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var action = form.getAttribute('action') || 'search.html';
                var joiner = action.indexOf('?') >= 0 ? '&' : '?';
                window.location.href = query ? action + joiner + 'q=' + encodeURIComponent(query) : action;
            });
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var previous = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        qsa('[data-filter-bar]').forEach(function (bar) {
            var section = bar.closest('.section') || document;
            var cards = qsa('.movie-card', section);
            bar.addEventListener('click', function (event) {
                var button = event.target.closest('[data-filter]');
                if (!button) {
                    return;
                }
                var filter = button.getAttribute('data-filter');
                qsa('[data-filter]', bar).forEach(function (chip) {
                    chip.classList.toggle('active', chip === button);
                });
                cards.forEach(function (card) {
                    var type = card.getAttribute('data-type') || '';
                    var year = card.getAttribute('data-year') || '';
                    var shouldShow = filter === 'all' || type === filter || year === filter;
                    card.classList.toggle('hidden-by-filter', !shouldShow);
                });
            });
        });
    }

    function initDetailScroll() {
        qsa('[data-scroll-player]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                var player = qs('.movie-player');
                if (player) {
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    var button = qs('.player-overlay', player);
                    if (button) {
                        button.focus({ preventScroll: true });
                        window.setTimeout(function () {
                            button.click();
                        }, 250);
                    }
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initFilters();
        initDetailScroll();
    });
}());
