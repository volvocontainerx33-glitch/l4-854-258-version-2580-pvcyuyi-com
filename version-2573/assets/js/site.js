(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            toggle.textContent = isOpen ? "×" : "☰";
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector(".js-hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var prev = slider.querySelector(".js-hero-prev");
        var next = slider.querySelector(".js-hero-next");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                startTimer();
            });
        }
        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        show(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initLocalSearch() {
        var input = document.querySelector(".js-local-search");
        var select = document.querySelector(".js-type-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }

        function apply() {
            var term = normalize(input ? input.value : "");
            var selectedType = normalize(select ? select.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var tags = normalize(card.getAttribute("data-tags"));
                var type = normalize(card.getAttribute("data-type"));
                var matchesText = !term || title.indexOf(term) !== -1 || tags.indexOf(term) !== -1;
                var matchesType = !selectedType || type.indexOf(selectedType) !== -1;
                var show = matchesText && matchesType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    window.MoviePlayer = {
        create: function (source, videoSelector, overlaySelector, buttonSelector, statusSelector) {
            var video = document.querySelector(videoSelector);
            var overlay = document.querySelector(overlaySelector);
            var button = document.querySelector(buttonSelector);
            var status = document.querySelector(statusSelector);
            var loaded = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function bindSource() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }
                setStatus("播放暂不可用，请稍后再试");
            }

            function begin(event) {
                if (event) {
                    event.preventDefault();
                }
                bindSource();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var result = video.play();
                setStatus("正在缓冲，请稍候");
                if (result && typeof result.then === "function") {
                    result.then(function () {
                        setStatus("");
                    }).catch(function () {
                        setStatus("点击播放按钮继续观看");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", begin);
            }
            if (button) {
                button.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    begin();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                setStatus("");
            });
            video.addEventListener("error", function () {
                setStatus("播放暂不可用，请稍后再试");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initLocalSearch();
    });
})();
