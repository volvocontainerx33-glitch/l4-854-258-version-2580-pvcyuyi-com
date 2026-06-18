(function () {
    function setMessage(wrapper, message) {
        var box = wrapper.querySelector('.player-message');
        if (box) {
            box.textContent = message;
        }
    }

    function initPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var sourceUrl = wrapper.getAttribute('data-src');
        if (!video || !sourceUrl) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            setMessage(wrapper, '正在加载高清播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage(wrapper, '播放源加载完成');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage(wrapper, '网络异常，正在重试...');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage(wrapper, '媒体解析异常，正在恢复...');
                        hlsInstance.recoverMediaError();
                    } else {
                        setMessage(wrapper, '播放源暂时无法加载');
                        hlsInstance.destroy();
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                setMessage(wrapper, '播放源加载完成');
                return Promise.resolve();
            }

            video.src = sourceUrl;
            setMessage(wrapper, '浏览器将尝试直接播放');
            return Promise.resolve();
        }

        function play() {
            loadSource().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setMessage(wrapper, '请再次点击播放按钮');
                    });
                }
            });
        }

        var overlay = wrapper.querySelector('.player-overlay');
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
            setMessage(wrapper, '正在播放');
        });
        video.addEventListener('pause', function () {
            wrapper.classList.remove('is-playing');
            setMessage(wrapper, '播放已暂停');
        });
        video.addEventListener('ended', function () {
            wrapper.classList.remove('is-playing');
            setMessage(wrapper, '播放结束');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
    });
}());
