// Injected script for detecting HTML5 video streams and notifying React Native

export const MEDIA_SNIFFER_JS = `
(function() {
  function postVideoFound(src, title, poster, duration) {
    if (!src || src.startsWith('blob:') && src.length < 10) return;
    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MEDIA_DETECTED',
        payload: {
          src: src,
          title: title || document.title || 'Video Stream',
          poster: poster || '',
          duration: duration || 0
        }
      }));
    } catch(e) {}
  }

  function checkVideos() {
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      var src = v.currentSrc || v.src;
      if (!src) {
        var source = v.querySelector('source');
        if (source) src = source.src;
      }
      if (src && !v.dataset.ucSniffed) {
        v.dataset.ucSniffed = 'true';
        postVideoFound(src, document.title, v.poster, v.duration);
      }
    }
  }

  // Hook HTMLVideoElement.prototype.play
  var origPlay = HTMLVideoElement.prototype.play;
  HTMLVideoElement.prototype.play = function() {
    var src = this.currentSrc || this.src;
    if (src) {
      postVideoFound(src, document.title, this.poster, this.duration);
    }
    return origPlay.apply(this, arguments);
  };

  checkVideos();
  setInterval(checkVideos, 2000);
})();
true;
`;

