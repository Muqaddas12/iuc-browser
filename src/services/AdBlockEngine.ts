import { BrowserSettings, ExtensionItem } from '../types/browser';

export const AD_BLOCK_DOMAINS = [
  // Google Ads & Marketing Networks
  'googlesyndication.com', 'googleadservices.com', 'doubleclick.net', 'adservice.google.com',
  'pagead2.googlesyndication.com', 'tpc.googlesyndication.com', 'partner.googleadservices.com',
  'google-analytics.com', 'googletagservices.com', 'googletagmanager.com',

  // Monetag / Vegamovies & Popunder Networks (CRITICAL)
  'cathaytrash.com', 'hd.cathaytrash.com', 'llvpn.com', 'monetag.com', 'trk.monetag.com',
  'a.monetag.com', 'ad.monetag.com', 'servicer.monetag.com', 'brooadgate.com', 'hontomoush.com',
  'nothingdo.com', 'yepremium.com', 'zarazagorus.com', 'pushance.com', 'pushails.com',
  'embedrise.com', 'betterenov.com', 'webpushsdk.com', 'pushfund.com', 'pusherism.com',
  'realsrv.com', 'syndication.realsrv.com', 'notifpush.com', 'subscribtions.com', 'pushcrew.com',
  'onesignal.com', 'gravitec.net', 'cleverpush.com', 'cdn.onesignal.com',

  // Popunder / Popup networks
  'popads.net', 'popcash.net', 'propellerads.com', 'propellerpops.com', 'exoclick.com',
  'exosrv.com', 'exdynsrv.com', 'adcash.com', 'adnxs.com', 'trafficjunky.com', 'juicyads.com',
  'clickadu.com', 'adsterra.com', 'adsterratools.com', 'hilltopads.com', 'richpush.co',
  'onclicktop.com', 'onclickbright.com', 'directrev.com', 'ad-maven.com', 'admaven.com',
  'galaksion.com', 'evadav.com',

  // Content recommendation
  'taboola.com', 'outbrain.com', 'revcontent.com', 'mgid.com', 'adblade.com', 'content.ad',
  'marketgid.com',

  // Tracking / DSP
  'criteo.com', 'criteo.net', 'adroll.com', 'smartadserver.com', 'rubiconproject.com', 'openx.net',
  'pubmatic.com', 'casalemedia.com', 'bidswitch.net', 'sovrn.com', 'indexexchange.com', 'teads.tv',
  'quantserve.com', 'scorecardresearch.com', 'adform.net', 'serving-sys.com', 'moatads.com',
  'advertising.com', 'amazon-adsystem.com', 'media.net',

  // Facebook
  'an.facebook.com', 'pixel.facebook.com',

  // Mobile ad networks
  'adcolony.com', 'inmobi.com', 'vungle.com', 'unityads.unity3d.com', 'ironsrc.com', 'applovin.com',
  'chartboost.com', 'tapjoy.com', 'flurry.com', 'mopub.com', 'startapp.com',

  // Analytics / fingerprinting
  'hotjar.com', 'mouseflow.com', 'fullstory.com', 'mixpanel.com', 'amplitude.com', 'segment.io',
  'optimizely.com', 'demdex.net', 'bluekai.com', 'krxd.net', 'addthis.com',

  // Link shorteners (piracy sites)
  'adf.ly', 'shorte.st', 'bc.vc', 'ouo.io', 'linkvertise.com', 'shrinkme.io',

  // Misc ad networks
  'bidvertiser.com', 'infolinks.com', 'revenuehits.com', 'trafficstars.com', 'plugrush.com',
  'zergnet.com', 'cpmstar.com'
];

export const WHITELIST_DOMAINS = [
  'google.com', 'youtube.com', 'youtu.be', 'googlevideo.com',
  'wikipedia.org', 'github.com', 'play.google.com', 'duckduckgo.com', 'brave.com',
  'vcloud.fit', 'fastdl.icu', 'hubcloud.club', 'hubcloud.lat', 'hubcloud.one', 'hubcloud.ink',
  'pixeldrain.com', 'mediafire.com', '1fichier.com', 'mega.nz', 'gdtot.pro', 'drivebuzz.org'
];

export function isAdUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // 1. Check Whitelist first
    for (let i = 0; i < WHITELIST_DOMAINS.length; i++) {
      const w = WHITELIST_DOMAINS[i];
      if (hostname === w || hostname.endsWith('.' + w)) {
        if (url.includes('/watch') || url.includes('/embed') || hostname.includes('googlevideo') || url.includes('/search')) {
          return false;
        }
        return false;
      }
    }

    // 2. Check Blacklist domains
    for (let i = 0; i < AD_BLOCK_DOMAINS.length; i++) {
      if (hostname === AD_BLOCK_DOMAINS[i] || hostname.endsWith('.' + AD_BLOCK_DOMAINS[i])) {
        return true;
      }
    }

    // 3. Check Regex pattern
    if (/(adserver|adservice|adsystem|adtrack|adclick|popunder|popupad|banner\.php|ad\.js|ads\.js|\/ad\/|\/ads\/|clicktrack|redirect_ad|cathaytrash|llvpn|tag\.min\.js)/i.test(url)) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// YouTube Ad Blocker Script
export const YOUTUBE_ADBLOCK_SNIPPET = `
  // YouTube Ad Immunity Script
  if (location.hostname.indexOf('youtube.com') > -1 || location.hostname.indexOf('youtu.be') > -1) {
    setInterval(function() {
      // 1. Skip button auto-clicker
      var skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
      if (skipBtn) {
        skipBtn.click();
      }
      // 2. Video ad fast-forward & mute
      var video = document.querySelector('video');
      var isAdShowing = document.querySelector('.ad-showing, .ad-interrupting');
      if (isAdShowing && video && !isNaN(video.duration)) {
        video.muted = true;
        video.currentTime = video.duration;
      }
      // 3. Hide banner overlays
      var overlays = document.querySelectorAll('.ytp-ad-overlay-container, ytd-promoted-video-renderer, ytd-banner-promo-renderer, #player-ads, .sparkles-light-cta');
      for (var i = 0; i < overlays.length; i++) {
        overlays[i].style.display = 'none';
      }
    }, 400);
  }
`;

// Cookie Consent Popups Blocker Script
export const COOKIE_CONSENT_SNIPPET = `
  // Cookie Consent & GDPR Annihilator
  (function() {
    var cookieSelectors = [
      '#onetrust-banner-sdk', '#onetrust-consent-sdk', '.cookie-banner', '#cookie-banner',
      'div[class*="cookie-consent"]', 'div[id*="cookie-notice"]', 'div[class*="cookie-notice"]',
      '.qc-cmp2-container', '#cmpbox', '.didomi-popup-container', '#usercentrics-root',
      '.cc-window', '#CybotCookiebotDialog', '.js-cookie-consent', 'div[aria-label*="cookie"]'
    ];
    function killCookies() {
      for (var i = 0; i < cookieSelectors.length; i++) {
        var el = document.querySelector(cookieSelectors[i]);
        if (el) {
          el.style.setProperty('display', 'none', 'important');
          el.remove();
        }
      }
      // Restore scrolling if locked by cookie modal
      if (document.body && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'auto';
      }
    }
    killCookies();
    setTimeout(killCookies, 1000);
    setTimeout(killCookies, 3000);
  })();
`;

// Anti-Fingerprinting Shield Script
export const ANTI_FINGERPRINT_SNIPPET = `
  // Chromium Anti-Fingerprinting Shield
  (function() {
    // 1. Canvas Fingerprint Randomizer
    try {
      var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        var ctx = this.getContext('2d');
        if (ctx) {
          var imgData = ctx.getImageData(0, 0, Math.min(this.width, 10), Math.min(this.height, 10));
          if (imgData && imgData.data && imgData.data.length > 0) {
            imgData.data[0] = (imgData.data[0] + 1) % 255; // Subtle jitter to foil hashing
            ctx.putImageData(imgData, 0, 0);
          }
        }
        return origToDataURL.apply(this, arguments);
      };
    } catch(e) {}

    // 2. AudioContext Fingerprint Protection
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        var origGetChannelData = AudioBuffer.prototype.getChannelData;
        AudioBuffer.prototype.getChannelData = function() {
          var data = origGetChannelData.apply(this, arguments);
          for (var i = 0; i < Math.min(data.length, 20); i += 5) {
            data[i] = data[i] + 0.0000001; // subtle audio jitter
          }
          return data;
        };
      }
    } catch(e) {}

    // 3. WebGL Vendor & Renderer Spoofing
    try {
      var origGetParam = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(param) {
        // UNMASKED_VENDOR_WEBGL
        if (param === 37445) return 'Google Inc. (Chromium)';
        // UNMASKED_RENDERER_WEBGL
        if (param === 37446) return 'ANGLE (Qualcomm, Adreno 750 OpenGL ES 3.2)';
        return origGetParam.apply(this, arguments);
      };
    } catch(e) {}

    // 4. Battery API Blocker
    if (navigator.getBattery) {
      navigator.getBattery = function() {
        return Promise.reject(new Error('Battery status blocked by IUC Privacy Shield'));
      };
    }
  })();
`;

// Email Spy Pixel & Tracking Beacon Blocker
export const SPY_PIXEL_SNIPPET = `
  // Email Spy Pixel & Web Beacon Blocker
  (function() {
    function purgePixels() {
      var images = document.querySelectorAll('img[width="1"][height="1"], img[width="0"], img[style*="display:none"], img[style*="display: none"]');
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var src = (img.getAttribute('src') || '').toLowerCase();
        if (src.indexOf('pixel') > -1 || src.indexOf('track') > -1 || src.indexOf('beacon') > -1) {
          img.remove();
        }
      }
    }
    purgePixels();
    setTimeout(purgePixels, 1500);
  })();
`;

export function getInjectedScript(settings: BrowserSettings, extensions: ExtensionItem[] = []): string {
  const parts: string[] = [];

  // 1. Core Ad & Anti-Clickjack Protection
  if (settings.adBlockEnabled) {
    parts.push(`
      (function() {
        if (window.__IUC_ADBLOCK__) return;
        window.__IUC_ADBLOCK__ = true;

        var AD_DOMAINS = ${JSON.stringify(AD_BLOCK_DOMAINS)};
        var isAd = function(url) {
          if (!url || typeof url !== 'string') return false;
          try {
            var urlObj = new URL(url, location.origin);
            var hostname = urlObj.hostname.toLowerCase();
            for (var i = 0; i < AD_DOMAINS.length; i++) {
              if (hostname === AD_DOMAINS[i] || hostname.endsWith('.' + AD_DOMAINS[i])) return true;
            }
          } catch(e) {}
          return false;
        };

        // CSS rules to hide ad elements
        var style = document.createElement('style');
        style.innerHTML = 'div[id^="ad"], div[class^="ad"], iframe[src*="ad"], ins.adsbygoogle, .ad-banner, .advertisement, [data-ad-slot], div[class*="popunder"], div[id*="popunder"] { display: none !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; width: 0 !important; z-index: -1 !important; }';
        (document.head || document.documentElement).appendChild(style);

        // Anti-clickjack & overlays removal
        var removeOverlays = function() {
          var divs = document.querySelectorAll('div, iframe, a');
          for (var i = 0; i < divs.length; i++) {
            var el = divs[i];
            var cs = window.getComputedStyle(el);
            if (el.tagName.toLowerCase() === 'div' && (cs.position === 'absolute' || cs.position === 'fixed')) {
              var w = parseFloat(cs.width) || 0;
              var h = parseFloat(cs.height) || 0;
              var z = parseInt(cs.zIndex) || 0;
              var o = parseFloat(cs.opacity) || 1;
              var vw = window.innerWidth;
              var vh = window.innerHeight;
              if (z > 900 && w > vw * 0.6 && h > vh * 0.6 && o < 0.15) {
                el.parentNode.removeChild(el);
              }
            }
          }
        };

        // window.open neutralization
        var originalWindowOpen = window.open;
        window.open = function(url) {
          if (isAd(url) || url === 'about:blank') return null;
          return originalWindowOpen.apply(this, arguments);
        };

        // onclick redirect blocking
        document.addEventListener('click', function(e) {
          var target = e.target;
          while (target && target !== document) {
            if (target.tagName && target.tagName.toLowerCase() === 'a') {
              var href = target.getAttribute('href');
              if (isAd(href)) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
            }
            target = target.parentNode;
          }
        }, true);

        // createElement hook
        var origCreate = document.createElement;
        document.createElement = function(tag) {
          var el = origCreate.apply(document, arguments);
          var t = tag.toLowerCase();
          if (t === 'script' || t === 'iframe') {
            Object.defineProperty(el, 'src', {
              set: function(val) {
                if (isAd(val)) {
                  this.setAttribute('data-blocked-src', val);
                } else {
                  this.setAttribute('src', val);
                }
              },
              get: function() {
                return this.getAttribute('src') || this.getAttribute('data-blocked-src');
              }
            });
          }
          return el;
        };

        // Fetch / XHR blocking
        var origFetch = window.fetch;
        window.fetch = function() {
          if (arguments[0] && typeof arguments[0] === 'string' && isAd(arguments[0])) {
            return Promise.reject(new Error('Ad blocked'));
          }
          return origFetch.apply(this, arguments);
        };

        var origXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
          if (isAd(url)) {
            this.abort();
            return;
          }
          origXHROpen.apply(this, arguments);
        };

        // Notification blocking
        if (window.Notification) {
          Object.defineProperty(Notification, 'requestPermission', {
            value: function() { return Promise.resolve('denied'); },
            writable: false,
            configurable: false
          });
        }

        // Service Worker blocking for ad pushers
        if (navigator.serviceWorker) {
          var origReg = navigator.serviceWorker.register;
          navigator.serviceWorker.register = function(url) {
            if (url.indexOf('push') > -1 || url.indexOf('ad') > -1 || isAd(url)) {
              return Promise.reject(new Error('SW blocked'));
            }
            return origReg.apply(this, arguments);
          };
        }

        // Anti-Ad Redirect Shield: only block redirects targeting known ad/tracker domains
        try {
          var _origAssign = window.location.assign;
          window.location.assign = function(url) {
            if (typeof url === 'string' && isAd(url)) {
              console.log('IUC Shield: Blocked ad redirect to ' + url);
              return;
            }
            return _origAssign.call(window.location, url);
          };
          var _origReplace = window.location.replace;
          window.location.replace = function(url) {
            if (typeof url === 'string' && isAd(url)) {
              console.log('IUC Shield: Blocked ad redirect to ' + url);
              return;
            }
            return _origReplace.call(window.location, url);
          };
        } catch(e) {}

        removeOverlays();
        setInterval(removeOverlays, 1000);
      })();
    `);
  }

  // 2. YouTube Ad Immunity
  if (settings.youtubeAdBlocker) {
    parts.push(YOUTUBE_ADBLOCK_SNIPPET);
  }

  // 3. Cookie Consent Banner Annihilator
  if (settings.cookieConsentBlocker) {
    parts.push(COOKIE_CONSENT_SNIPPET);
  }

  // 4. Anti-Fingerprinting Shield
  if (settings.antiFingerprinting) {
    parts.push(ANTI_FINGERPRINT_SNIPPET);
  }

  // 5. Email Spy Pixel Blocker
  parts.push(SPY_PIXEL_SNIPPET);

  // 6. User Extensions / Userscripts Injection
  extensions.forEach((ext) => {
    if (ext.enabled && ext.script) {
      parts.push(`
        // Extension: ${ext.name}
        try {
          ${ext.script}
        } catch(extErr) {
          console.warn('Error in extension ${ext.name}:', extErr);
        }
      `);
    }
  });

  parts.push('true;');
  return parts.join('\n');
}

export const AD_BLOCK_JS = getInjectedScript({
  searchEngine: 'duckduckgo',
  adBlockEnabled: true,
  desktopMode: false,
  antiFingerprinting: true,
  cookieConsentBlocker: true,
  youtubeAdBlocker: true,
  torProxyEnabled: false,
  torProxyPort: 9050,
  splitScreenEnabled: false,
  verticalTabsEnabled: false,
  readerTheme: 'dark',
  activeWorkspaceId: 'ws_personal'
});
