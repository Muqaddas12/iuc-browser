// IUC Shield - GeckoView Content Script & Cosmetic Ad Blocker
(function() {
  'use strict';

  if (window.__IUC_SHIELD_ACTIVE__) return;
  window.__IUC_SHIELD_ACTIVE__ = true;

  // 1. Inject Instant Hide CSS
  var adSelectors = [
    'ins.adsbygoogle', '.adsbygoogle', '#google_ads_frame',
    '.ytp-ad-overlay-container', '.ytp-ad-message-container', '#player-ads',
    'ytd-promoted-video-renderer', 'ytd-banner-promo-renderer', 'ytd-statement-banner-renderer',
    'ytd-in-feed-ad-layout-renderer', 'ytd-ad-slot-renderer',
    'ytd-enforcement-message-view-model', '#error-screen.ytd-watch-flexy',
    'div[class*="ad-slot"]', 'div[id*="ad-slot"]', 'div[class*="ad-banner"]',
    'div[id*="ad-banner"]', 'div[class*="native-ad"]', 'div[id*="native-ad"]',
    '.taboola-ad', '#taboola-below-article-thumbnails', '.outbrain-ad',
    '#onetrust-banner-sdk', '.cookie-banner', '#cookie-banner',
    'div[class*="cookie-consent"]', 'div[id*="cookie-notice"]',
    '.qc-cmp2-container', '#cmpbox', '.didomi-popup-container'
  ];

  var styleEl = document.createElement('style');
  styleEl.id = '__iuc_shield_css__';
  styleEl.textContent = adSelectors.join(', ') + ' { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; height: 0 !important; }';
  (document.head || document.documentElement).appendChild(styleEl);

  // 2. YouTube Ad Skipping & Auto-Mute Loop
  function handleYouTubeAds() {
    if (!window.location.hostname.includes('youtube.com')) return;

    var video = document.querySelector('video');
    var skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, button.ytp-ad-skip-button');
    if (skipBtn) {
      console.log('[IUC ContentScript 📺 YOUTUBE AD SKIP BUTTON CLICKED] on:', window.location.href);
      skipBtn.click();
    }

    var isAdShowing = document.querySelector('.ad-showing, .ad-interrupting');
    if (isAdShowing && video && !isNaN(video.duration)) {
      console.log('[IUC ContentScript 📺 YOUTUBE AD MUTED & SKIPPED TO END] on:', window.location.href);
      video.muted = true;
      video.playbackRate = 16.0;
      video.currentTime = video.duration;
    }

    // Dismiss YouTube AdBlock Warning Modal
    var warningModal = document.querySelector('ytd-enforcement-message-view-model');
    if (warningModal) {
      console.log('[IUC ContentScript 📺 YOUTUBE ANTI-ADBLOCK MODAL REMOVED]');
      warningModal.remove();
      var backdrop = document.querySelector('tp-yt-iron-overlay-backdrop');
      if (backdrop) backdrop.remove();
      if (video && video.paused) video.play();
    }
  }

  // 3. Cookie Consent Auto-Dismiss
  function handleCookieBanners() {
    var consentButtons = [
      '#onetrust-reject-all-handler', '#onetrust-accept-btn-handler',
      '.cookie-banner__accept', '.cookie-btn-accept',
      'button[id*="cookie-reject"]', 'button[class*="cookie-reject"]',
      'button[id*="accept-all"]', 'button[class*="accept-all"]'
    ];
    for (var i = 0; i < consentButtons.length; i++) {
      var btn = document.querySelector(consentButtons[i]);
      if (btn) {
        console.log('[IUC ContentScript 🍪 COOKIE BANNER AUTO-DISMISSED]:', consentButtons[i], 'on:', window.location.href);
        btn.click();
        break;
      }
    }
  }

  // 4. Remove Invisible Clickjack / Transparent Overlays
  function removeOverlays() {
    try {
      var allDivs = document.querySelectorAll('div, a, span');
      for (var i = 0; i < allDivs.length; i++) {
        var el = allDivs[i];
        var style = window.getComputedStyle(el);
        if (
          style.position === 'fixed' &&
          parseInt(style.zIndex, 10) > 999 &&
          parseFloat(style.opacity) < 0.1 &&
          el.offsetWidth > window.innerWidth * 0.8 &&
          el.offsetHeight > window.innerHeight * 0.8
        ) {
          console.log('[IUC ContentScript 🛡️ CLICKJACK OVERLAY REMOVED] on:', window.location.href);
          el.remove();
        }
      }
    } catch (e) {}
  }

  // 5. Anti-Fingerprinting Spoofing
  try {
    if (HTMLCanvasElement.prototype.toDataURL) {
      var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        var ctx = this.getContext('2d');
        if (ctx) {
          try {
            var imgData = ctx.getImageData(0, 0, 1, 1);
            imgData.data[0] = (imgData.data[0] + 1) % 255;
            ctx.putImageData(imgData, 0, 0);
          } catch (e) {}
        }
        return origToDataURL.apply(this, arguments);
      };
    }

    if (navigator.hardwareConcurrency) {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: function() { return 4; } });
    }

    if (navigator.getBattery) {
      navigator.getBattery = function() {
        return Promise.reject(new Error('Battery API disabled for privacy'));
      };
    }
  } catch (e) {}

  // 6. Execution Loop
  setInterval(function() {
    handleYouTubeAds();
    handleCookieBanners();
    removeOverlays();
  }, 400);

})();

