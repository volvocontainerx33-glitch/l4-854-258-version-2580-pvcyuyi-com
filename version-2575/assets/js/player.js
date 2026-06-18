function setupMoviePlayer(options) {
  var source = options && options.source ? options.source : "";
  var video = document.getElementById("movie-video");
  var button = document.querySelector("[data-play-button]");
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    button.classList.add("is-hidden");
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", playVideo);

  video.addEventListener("click", function () {
    if (!started || video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
