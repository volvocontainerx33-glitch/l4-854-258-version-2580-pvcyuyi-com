
const onReady = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

onReady(() => {
    initMobileNav();
    initHeroCarousel();
    initFilters();
    initPlayers();
});

function initMobileNav() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
}

function initHeroCarousel() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const background = hero.querySelector("[data-hero-bg]");
    let current = 0;
    let timer = null;

    const activate = (index) => {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });

        if (background && slides[current]) {
            const image = slides[current].getAttribute("data-bg");
            background.style.backgroundImage = `url('${image}')`;
        }
    };

    const start = () => {
        timer = window.setInterval(() => {
            activate(current + 1);
        }, 5200);
    };

    const reset = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            activate(index);
            reset();
        });
    });

    activate(0);
    start();
}

function initFilters() {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach((panel) => {
        const scope = panel.closest("main") || document;
        const search = panel.querySelector("[data-filter-search]");
        const category = panel.querySelector("[data-filter-category]");
        const type = panel.querySelector("[data-filter-type]");
        const year = panel.querySelector("[data-filter-year]");
        const count = panel.querySelector("[data-filter-count]");
        const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
        const empty = scope.querySelector("[data-filter-empty]");

        const update = () => {
            const query = (search?.value || "").trim().toLowerCase();
            const selectedCategory = category?.value || "";
            const selectedType = type?.value || "";
            const selectedYear = year?.value || "";
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year
                ].join(" ").toLowerCase();

                const matchesQuery = !query || haystack.includes(query);
                const matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
                const matchesType = !selectedType || card.dataset.type === selectedType;
                const matchesYear = !selectedYear || card.dataset.year === selectedYear;
                const isVisible = matchesQuery && matchesCategory && matchesType && matchesYear;

                card.classList.toggle("hidden-by-filter", !isVisible);

                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} 部`;
            }

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        [search, category, type, year].forEach((element) => {
            if (element) {
                element.addEventListener("input", update);
                element.addEventListener("change", update);
            }
        });

        update();
    });
}

async function initPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    if (!players.length) {
        return;
    }

    let Hls = null;

    try {
        const module = await import("./hls-vendor-dru42stk.js");
        Hls = module.H;
    } catch (error) {
        Hls = window.Hls || null;
    }

    players.forEach((player) => {
        setupPlayer(player, Hls);
    });
}

function setupPlayer(player, Hls) {
    const video = player.querySelector("video");
    const source = video?.querySelector("source");
    const overlay = player.querySelector(".player-overlay");

    if (!video || !source) {
        return;
    }

    const src = source.getAttribute("src");

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
    }

    const play = () => {
        overlay?.classList.add("is-hidden");
        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {
                overlay?.classList.remove("is-hidden");
            });
        }
    };

    overlay?.addEventListener("click", play);
    overlay?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            play();
        }
    });

    video.addEventListener("play", () => {
        overlay?.classList.add("is-hidden");
    });

    video.addEventListener("pause", () => {
        if (!video.ended) {
            overlay?.classList.remove("is-hidden");
        }
    });

    video.addEventListener("ended", () => {
        overlay?.classList.remove("is-hidden");
    });
}
