// Enhanced HTML5, Streaming, HLS (.m3u8), OK.ru, YouTube, and Progressive Video Sniffer

export const MEDIA_SNIFFER_JS = `
(function() {
  if (window.__UC_SNIFFER_INSTALLED__) return;
  window.__UC_SNIFFER_INSTALLED__ = true;

  var detectedMap = {};
  var isYouTube = /youtube\\.com|youtu\\.be/i.test(window.location.hostname);
  var isOkRu = /ok\\.ru/i.test(window.location.hostname);

  function isVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('blob:') && url.length < 20) return false;
    if (url.startsWith('data:image')) return false;

    var cleanUrl = url.toLowerCase();
    return (
      cleanUrl.includes('.m3u8') ||
      cleanUrl.includes('.mp4') ||
      cleanUrl.includes('.webm') ||
      cleanUrl.includes('.m4v') ||
      cleanUrl.includes('.flv') ||
      cleanUrl.includes('.f4v') ||
      cleanUrl.includes('.mkv') ||
      cleanUrl.includes('mime=video') ||
      cleanUrl.includes('mime%3dvideo') ||
      cleanUrl.includes('video/mp4') ||
      cleanUrl.includes('video/webm') ||
      cleanUrl.includes('googlevideo.com/videoplayback') ||
      cleanUrl.includes('mycdn.me/video.m3u8') ||
      cleanUrl.includes('mycdn.me/video/') ||
      cleanUrl.includes('ok.ru/dk?cmd=videoplayermetadata') ||
      cleanUrl.includes('ok.ru/videoembed') ||
      cleanUrl.includes('manifest.mpd')
    );
  }

  function getPageTitle() {
    var titleEl = document.querySelector(
      'h1.title, .slim-video-information-title, .ytp-title-link, .vp_video_header, .html5-vpl_title, meta[property="og:title"]'
    );
    var title = '';
    if (titleEl) {
      title = titleEl.getAttribute('content') || titleEl.innerText || titleEl.textContent || '';
    }
    if (!title) {
      title = document.title || 'Video Stream';
    }
    return title.replace(/ - YouTube$/i, '').replace(/ - OK.RU$/i, '').trim();
  }

  function sendVideo(data) {
    if (!data || !data.src) return;
    var rawSrc = data.src;

    // Filter duplicate reports of exact same URL
    if (detectedMap[rawSrc]) return;
    detectedMap[rawSrc] = true;

    var title = data.title || getPageTitle();
    var poster = data.poster || '';
    if (!poster) {
      var metaImg = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
      if (metaImg) poster = metaImg.getAttribute('content') || '';
    }

    var isHls = rawSrc.includes('.m3u8') || data.isHls === true;

    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MEDIA_DETECTED',
          payload: {
            src: rawSrc,
            title: title,
            poster: poster,
            duration: data.duration || 0,
            isHls: isHls,
            formats: data.formats || []
          }
        }));
      }
    } catch (e) {}
  }

  // 1. Hook XMLHttpRequest
  try {
    var origXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      try {
        if (typeof url === 'string' && isVideoUrl(url)) {
          sendVideo({
            src: url,
            isHls: url.includes('.m3u8')
          });
        }
      } catch (e) {}
      return origXhrOpen.apply(this, arguments);
    };
  } catch (e) {}

  // 2. Hook Fetch API
  try {
    if (window.fetch) {
      var origFetch = window.fetch;
      window.fetch = function(input, init) {
        try {
          var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
          if (url && isVideoUrl(url)) {
            sendVideo({
              src: url,
              isHls: url.includes('.m3u8')
            });
          }
        } catch (e) {}
        return origFetch.apply(this, arguments);
      };
    }
  } catch (e) {}

  // 3. Hook HTMLMediaElement play & load
  try {
    var origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() {
      try {
        var src = this.currentSrc || this.src;
        if (src && isVideoUrl(src)) {
          sendVideo({
            src: src,
            poster: this.getAttribute('poster') || '',
            duration: this.duration || 0,
            isHls: src.includes('.m3u8')
          });
        }
      } catch (e) {}
      return origPlay.apply(this, arguments);
    };
  } catch (e) {}

  // 4. Hook HTMLVideoElement src property setter
  try {
    var videoSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (videoSrcDescriptor && videoSrcDescriptor.set) {
      var origSet = videoSrcDescriptor.set;
      Object.defineProperty(HTMLMediaElement.prototype, 'src', {
        set: function(val) {
          try {
            if (val && isVideoUrl(val)) {
              sendVideo({
                src: val,
                isHls: val.includes('.m3u8')
              });
            }
          } catch (e) {}
          return origSet.call(this, val);
        },
        get: videoSrcDescriptor.get,
        configurable: true
      });
    }
  } catch (e) {}

  // 5. YouTube Specific Sniffing
  function checkYouTube() {
    if (!isYouTube) return;
    try {
      var videoId = null;
      var match = window.location.search.match(/[?&]v=([^&]+)/);
      if (match) {
        videoId = match[1];
      } else if (window.location.pathname.startsWith('/shorts/')) {
        videoId = window.location.pathname.replace('/shorts/', '').split('/')[0];
      }

      if (videoId) {
        var poster = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';
        var videoEl = document.querySelector('video');
        var vSrc = videoEl ? (videoEl.currentSrc || videoEl.src) : '';

        sendVideo({
          src: vSrc && !vSrc.startsWith('blob:') ? vSrc : 'https://www.youtube.com/watch?v=' + videoId,
          title: getPageTitle(),
          poster: poster,
          duration: videoEl ? videoEl.duration : 0,
          formats: [
            { quality: '1080p Full HD (MP4)', ext: 'mp4' },
            { quality: '720p HD (MP4)', ext: 'mp4' },
            { quality: '480p Standard (MP4)', ext: 'mp4' },
            { quality: '360p Fast (MP4)', ext: 'mp4' },
            { quality: 'Audio Only (MP3)', ext: 'mp3' }
          ]
        });
      }
    } catch (e) {}
  }

  // 6. OK.ru (Odnoklassniki) Specific Sniffing
  function checkOkRu() {
    if (!isOkRu) return;
    try {
      // Look for OK.ru video player data-options attributes
      var playerEls = document.querySelectorAll('[data-options], [data-player-url], [data-video], .html5-vpl_video');
      for (var p = 0; p < playerEls.length; p++) {
        var optStr = playerEls[p].getAttribute('data-options');
        if (optStr) {
          try {
            var opts = JSON.parse(optStr);
            if (opts && opts.flashvars) {
              var fvars = opts.flashvars;
              if (fvars.metadataUrl) {
                sendVideo({ src: fvars.metadataUrl, isHls: true });
              }
              if (fvars.hlsManifestUrl) {
                sendVideo({ src: fvars.hlsManifestUrl, isHls: true });
              }
            }
          } catch (err) {}
        }
      }

      // Check current video element
      var videoEl = document.querySelector('video');
      if (videoEl) {
        var vSrc = videoEl.currentSrc || videoEl.src;
        if (vSrc && !vSrc.startsWith('blob:')) {
          sendVideo({
            src: vSrc,
            poster: videoEl.poster || '',
            duration: videoEl.duration || 0,
            isHls: vSrc.includes('.m3u8')
          });
        } else if (vSrc && vSrc.startsWith('blob:')) {
          // OK.ru uses blob: with HLS under the hood, pass the canonical video page URL if direct stream is obscured
          var okVideoIdMatch = window.location.pathname.match(/\\/video\\/(\\d+)/);
          var canonicalUrl = okVideoIdMatch
            ? 'https://ok.ru/video/' + okVideoIdMatch[1]
            : window.location.href;
          sendVideo({
            src: canonicalUrl,
            title: getPageTitle(),
            isHls: true
          });
        }
      }
    } catch (e) {}
  }

  // 7. General DOM <video> & <source> & Meta Scanner
  function scanDom() {
    try {
      // Scan <video> and <audio> elements
      var mediaElements = document.querySelectorAll('video, audio');
      for (var i = 0; i < mediaElements.length; i++) {
        var el = mediaElements[i];
        var src = el.currentSrc || el.src;
        if (!src) {
          var sourceTag = el.querySelector('source');
          if (sourceTag) src = sourceTag.src;
        }

        if (src && isVideoUrl(src)) {
          sendVideo({
            src: src,
            poster: el.poster || '',
            duration: el.duration || 0,
            isHls: src.includes('.m3u8')
          });
        }
      }

      // Scan meta tags (OpenGraph video, Twitter player)
      var metaVideo = document.querySelector(
        'meta[property="og:video"], meta[property="og:video:url"], meta[property="og:video:secure_url"], meta[name="twitter:player:stream"]'
      );
      if (metaVideo) {
        var metaUrl = metaVideo.getAttribute('content');
        if (metaUrl && isVideoUrl(metaUrl)) {
          sendVideo({ src: metaUrl, isHls: metaUrl.includes('.m3u8') });
        }
      }

      // Scan iframes with video embeds
      var iframes = document.querySelectorAll('iframe[src*="video"], iframe[src*="embed"], iframe[src*="player"]');
      for (var j = 0; j < iframes.length; j++) {
        var ifrSrc = iframes[j].src;
        if (ifrSrc && isVideoUrl(ifrSrc)) {
          sendVideo({ src: ifrSrc, isHls: ifrSrc.includes('.m3u8') });
        }
      }
    } catch (e) {}
  }

  // Run immediately and periodically
  checkYouTube();
  checkOkRu();
  scanDom();

  var scanInterval = setInterval(function() {
    checkYouTube();
    checkOkRu();
    scanDom();
  }, 1500);

  // Stop scanning interval after 2 minutes to conserve battery
  setTimeout(function() {
    clearInterval(scanInterval);
  }, 120000);
})();
true;
`;
