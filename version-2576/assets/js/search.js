(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    function getParams() {
        return new URLSearchParams(window.location.search);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    function card(movie) {
        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <span class="poster-box">',
            '        <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="card-play">▶</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
            '        <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
            '        <span class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function render(items, message) {
        if (status) {
            status.textContent = message;
        }
        if (!results) {
            return;
        }
        if (!items.length) {
            results.innerHTML = '<div class="search-status">没有找到匹配影片，请更换关键词。</div>';
            return;
        }
        results.innerHTML = items.map(card).join('');
    }

    function search(query, type) {
        var normalized = String(query || '').trim().toLowerCase();
        var selectedType = type || 'all';
        var items = data.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            var matchedQuery = !normalized || text.indexOf(normalized) >= 0;
            var matchedType = selectedType === 'all' || movie.type === selectedType;
            return matchedQuery && matchedType;
        }).slice(0, 240);
        var label = normalized ? '关键词“' + query + '”找到 ' + items.length + ' 条结果' : '显示精选搜索结果';
        render(items, label);
    }

    function syncFromUrl() {
        var params = getParams();
        var query = params.get('q') || '';
        var type = params.get('type') || 'all';
        if (form) {
            form.q.value = query;
            form.type.value = type;
        }
        if (query || type !== 'all') {
            search(query, type);
        }
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = form.q.value.trim();
            var type = form.type.value;
            var params = new URLSearchParams();
            if (query) {
                params.set('q', query);
            }
            if (type && type !== 'all') {
                params.set('type', type);
            }
            var nextUrl = params.toString() ? 'search.html?' + params.toString() : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            search(query, type);
        });
    }

    document.addEventListener('DOMContentLoaded', syncFromUrl);
}());
