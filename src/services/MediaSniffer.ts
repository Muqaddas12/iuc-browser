// Injected script for detecting HTML5 video streams and notifying React Native
// Enhanced HTML5 and Streaming Video Sniffer with YouTube & HLS Support

export const MEDIA_SNIFFER_JS = `
(function() {
  function postVideoFound(src, title, poster, duration) {
    if (!src || src.startsWith('blob:') && src.length < 10) return;
  var detectedUrls = {};

  function sendVideo(data) {
    if (!data.src) return;
    if (detectedUrls[data.src]) return;
    detectedUrls[data.src] = true;

    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MEDIA_DETECTED',
        payload: {
          src: src,
          title: title || document.title || 'Video Stream',
          poster: poster || '',
          duration: duration || 0
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MEDIA_DETECTED',
          payload: {
            src: data.src,
            title: data.title || document.title || 'Streaming Video',
            poster: data.poster || '',
            duration: data.duration || 0,
            isHls: data.src.includes('.m3u8') || data.isHls,
            formats: data.formats || []
          }
        }));
      }
    } catch(e) {}
  }

  // 1. YouTube specific stream & metadata detector
  function checkYouTube() {
    try {
      if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be')) {
        var videoId = null;
        var match = window.location.search.match(/[?&]v=([^&]+)/);
        if (match) {
          videoId = match[1];
        } else if (window.location.pathname.startsWith('/shorts/')) {
          videoId = window.location.pathname.replace('/shorts/', '').split('/')[0];
        }
      }));

        if (videoId) {
          var titleEl = document.querySelector('h1.title, .slim-video-information-title, .ytp-title-link, title');
          var title = titleEl ? (titleEl.innerText || titleEl.textContent) : document.title;
          title = title.replace(' - YouTube', '').trim();
          var poster = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';

          // Check if direct progressive mp4 can be extracted or web playback stream
          var videoEl = document.querySelector('video');
          var videoSrc = videoEl ? (videoEl.currentSrc || videoEl.src) : '';

          sendVideo({
            src: videoSrc && !videoSrc.startsWith('blob:') ? videoSrc : 'https://www.youtube.com/watch?v=' + videoId,
            title: title || 'YouTube Video',
            poster: poster,
            duration: videoEl ? videoEl.duration : 0,
            formats: [
              { quality: '720p HD (MP4)', ext: 'mp4' },
              { quality: '480p (MP4)', ext: 'mp4' },
              { quality: '360p (MP4)', ext: 'mp4' },
              { quality: 'Audio Only (MP3)', ext: 'mp3' }
            ]
          });
        }
      }
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
  // 2. Generic HTML5 <video> and <source> DOM scanner
  function checkDomVideos() {
    try {
      var videos = document.querySelectorAll('video');
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        var src = v.currentSrc || v.src;
        if (!src) {
          var source = v.querySelector('source');
          if (source) src = source.src;
        }

        if (src && !src.startsWith('blob:')) {
          var title = document.title || 'Video Stream';
          sendVideo({
            src: src,
            title: title,
            poster: v.poster || '',
            duration: v.duration || 0,
            isHls: src.includes('.m3u8')
          });
        }
      }
      if (src && !v.dataset.ucSniffed) {
        v.dataset.ucSniffed = 'true';
        postVideoFound(src, document.title, v.poster, v.duration);
      }
    }
    } catch(e) {}
  }

  // Hook HTMLVideoElement.prototype.play
  var origPlay = HTMLVideoElement.prototype.play;
  HTMLVideoElement.prototype.play = function() {
    var src = this.currentSrc || this.src;
    if (src) {
      postVideoFound(src, document.title, this.poster, this.duration);
  // 3. Intercept Network XHR and Fetch for HLS/m3u8 and mp4 video playlists
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string') {
      if (url.includes('.m3u8') || (url.includes('.mp4') && !url.includes('ad'))) {
        sendVideo({
          src: url,
          title: document.title,
          isHls: url.includes('.m3u8')
        });
      }
    }
    return origPlay.apply(this, arguments);
    return origOpen.apply(this, arguments);
  };

  checkVideos();
  setInterval(checkVideos, 2000);
  // Run intervals
  checkYouTube();
  checkDomVideos();
  setInterval(function() {
    checkYouTube();
    checkDomVideos();
  }, 2000);
})();
true;
`;

