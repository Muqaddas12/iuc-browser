// AdBlock injection script for blocking ad networks, popup scripts, and banner overlays
// Comprehensive UC AdBlock & Anti-Popup / Anti-Clickjack Protection Engine

export const AD_BLOCK_DOMAINS = [
  // Google Ads & Marketing Networks
  'googlesyndication.com',
  'googleadservices.com',
  'doubleclick.net',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'tpc.googlesyndication.com',
  'partner.googleadservices.com',
  
  // Popunder, Popup, and Redirect Ad Networks
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'exoclick.com',
  'adcash.com',
  'adnxs.com',
  'trafficjunky.com',
  'juicyads.com',
  'clickadu.com',
  'adsterra.com',
  'hilltopads.com',
  'monetag.com',
  'richpush.co',
  'onclicktop.com',
  'onclickbright.com',
  'directrev.com',
  'adcolony.com',
  'inmobi.com',
  'vungle.com',
  'unityads.unity3d.com',
  'ironsrc.com',
  'applovin.com',
  'chartboost.com',
  'tapjoy.com',
  'flurry.com',
  'mopub.com',
  'startapp.com',
  'bidvertiser.com',
  'infolinks.com',
  'revenuehits.com',
  'ero-advertising.com',
  'trafficstars.com',
  'plugrush.com',
  'zergnet.com',
  
  // Content Recommendation & Native Ads
  'taboola.com',
  'outbrain.com',
  'revcontent.com',
  'mgid.com',
  'adblade.com',
  'content.ad',
  'ligatus.com',
  'plista.com',
  'yadro.ru',
  'an.yandex.ru',
  'begun.ru',
  'adriver.ru',
  'marketgid.com',
  
  // Tracking & DSP Exchanges
  'criteo.com',
  'criteo.net',
  'adroll.com',
  'smartadserver.com',
  'rubiconproject.com',
  'openx.net',
  'pubmatic.com',
  'casalemedia.com',
  'yieldmo.com',
  'bidswitch.net',
  'sovrn.com',
  'indexexchange.com',
  'sonobi.com',
  'teads.tv',
  'admanmedia.com',
  'exponential.com',
  'tribalfusion.com',
  'quantserve.com',
  'scorecardresearch.com',
  'adform.net',
  'serving-sys.com',
  'moatads.com',
  'contextweb.com',
  'undertone.com',
  'adtech.de',
  'advertising.com'
];

export const AD_URL_REGEX = /(?:adserver|adservice|adsystem|adtrack|adclick|adcontent|adtag|popunder|popupad|affiliate_banner|clicktrack|redirect_ad|banner_id|ad_slot|ad_unit|ad_type=|\/ad\b|\/ads\b|\/ad-|\/ads-|\/banners?\/|banner\.php|ad\.js|ads\.js)/i;

/**
 * Checks if a given URL belongs to an ad network, tracking server, or popup spam service
 */
export function isAdUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const clean = rawUrl.toLowerCase().trim();

  // Allow internal browser schemes
  if (clean.startsWith('uc://') || clean.startsWith('about:') || clean.startsWith('blob:')) {
    return false;
  }

  // Allow legitimate search engines and popular top sites
  if (
    clean.includes('google.com/search') ||
    clean.includes('bing.com/search') ||
    clean.includes('duckduckgo.com') ||
    clean.includes('youtube.com/watch') ||
    clean.includes('wikipedia.org') ||
    clean.includes('github.com')
  ) {
    return false;
  }

  // Check known ad domain list
  for (let i = 0; i < AD_BLOCK_DOMAINS.length; i++) {
    if (clean.includes(AD_BLOCK_DOMAINS[i])) {
      return true;
    }
  }

  // Check generic ad regex pattern
  return AD_URL_REGEX.test(clean);
}

/**
 * High-performance AdBlock and Anti-Clickjack Injection Bundle
 * Injected at document_start to neutralize malicious overlays, popups, and banner ads
 */
export const AD_BLOCK_JS = `
(function() {
  const adSelectors = [
  if (window.__UC_ADBLOCK_INSTALLED__) return;
  window.__UC_ADBLOCK_INSTALLED__ = true;

  var adDomains = ${JSON.stringify(AD_BLOCK_DOMAINS)};
  var adRegex = ${AD_URL_REGEX.toString()};

  function isAdTarget(url) {
    if (!url || typeof url !== 'string') return false;
    var u = url.toLowerCase().trim();
    if (u.startsWith('javascript:') || u === '#' || u.startsWith('about:') || u.startsWith('blob:')) return false;
    for (var i = 0; i < adDomains.length; i++) {
      if (u.indexOf(adDomains[i]) !== -1) return true;
    }
    return adRegex.test(u);
  }

  // 1. Inject Comprehensive Global CSS Rule to hide ads instantly
  var cssRules = [
    'ins.adsbygoogle',
    'div[id^="google_ads_"]',
    'iframe[id^="google_ads_"]',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="adnxs.com"]',
    'iframe[src*="exoclick.com"]',
    'iframe[src*="propellerads.com"]',
    'iframe[src*="popads.net"]',
    'div[class*="ad-container"]',
    'div[class*="ad-wrapper"]',
    'div[class*="ad-banner"]',
    'div[class*="ad_banner"]',
    'div[class*="ad-slot"]',
    'div[id*="ad-slot"]',
    'div[id*="ad_slot"]',
    'div[id*="adbanner"]',
    'div[class*="adbanner"]',
    'div[class*="sponsored-post"]',
    'div[class*="taboola"]',
    'div[id*="taboola"]',
    'div[id*="outbrain"]',
    'div[class*="outbrain"]',
    'div[class*="native-ad"]',
    'div[id*="advertisement"]',
    'div[class*="advertisement"]',
    'div[class*="ad-box"]',
    'div[class*="adsbox"]',
    'div[class*="banner-ads"]',
    'div[class*="floating-ad"]',
    'div[class*="bottom-ad"]',
    'div[class*="sticky-ad"]',
    'div[id*="sticky-ad"]',
    'a[href*="doubleclick.net"]',
    'a[href*="adclick"]',
    '.ad-wrapper',
    '.adsbox',
    '.banner-ads'
  ];
    'a[href*="popads.net"]',
    'a[href*="propellerads.com"]',
    'a[href*="exoclick.com"]',
    'a[href*="clickadu.com"]',
    'a[href*="trafficjunky.com"]',
    'a[href*="adsterra.com"]',
    '.ad-placement',
    '.ad-holder',
    '.ad-unit',
    '.ad-spot',
    '.video-ad-overlay',
    '.ytp-ad-overlay-container',
    '.ytp-ad-message-container'
  ].join(', ');

  function removeAds() {
  var styleEl = document.createElement('style');
  styleEl.id = '__uc_adblock_styles__';
  styleEl.textContent = cssRules + ' { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; max-height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important; z-index: -100 !important; }';
  
  function applyStyle() {
    var headOrDoc = document.head || document.documentElement;
    if (headOrDoc && !document.getElementById('__uc_adblock_styles__')) {
      headOrDoc.appendChild(styleEl);
    }
  }
  applyStyle();

  // 2. Anti-Clickjack: Detect & Remove Transparent/Invisible Click-Trap Overlays
  function removeDeceptiveOverlays() {
    try {
      adSelectors.forEach(function(selector) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          if (el) {
            el.style.display = 'none !important';
            el.style.visibility = 'hidden !important';
            el.style.height = '0px !important';
            el.style.pointerEvents = 'none !important';
            if (el.parentNode && el.tagName.toLowerCase() !== 'body') {
              el.parentNode.removeChild(el);
            }
      var allDivs = document.querySelectorAll('div, a, span, section');
      var winW = window.innerWidth || document.documentElement.clientWidth;
      var winH = window.innerHeight || document.documentElement.clientHeight;

      for (var i = 0; i < allDivs.length; i++) {
        var el = allDivs[i];
        if (el === document.body || el === document.documentElement) continue;

        var style = window.getComputedStyle(el);
        var zIndex = parseInt(style.zIndex, 10);
        var isFixed = style.position === 'fixed' || style.position === 'absolute';
        var opacity = parseFloat(style.opacity);

        // Check for full-screen high z-index transparent click-traps
        if (isFixed && zIndex > 999 && (opacity < 0.1 || style.background.includes('transparent') || style.backgroundColor === 'rgba(0, 0, 0, 0)')) {
          var rect = el.getBoundingClientRect();
          if (rect.width >= winW * 0.7 && rect.height >= winH * 0.7) {
            el.style.display = 'none';
            el.style.pointerEvents = 'none';
            if (el.parentNode) el.parentNode.removeChild(el);
          }
        }
      });
      }
    } catch(e) {}
  }

  // Run immediately and observe DOM mutations
  removeAds();
  setInterval(removeAds, 1500);
  // 3. Capturing-Phase Click Interceptor (Stops Ad Clicks & Button Hijacks)
  document.addEventListener('click', function(e) {
    try {
      var target = e.target;
      while (target && target.tagName !== 'A' && target !== document.body) {
        target = target.parentNode;
      }

  if (window.MutationObserver) {
    var observer = new MutationObserver(function() {
      removeAds();
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }
      if (target && target.tagName === 'A') {
        var href = target.getAttribute('href') || target.href || '';
        var targetAttr = target.getAttribute('target') || '';

  // Neutralize window.open popups that are not user initiated
        // If link points to known ad domain or ad URL pattern, kill the event completely
        if (isAdTarget(href)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }

        // Neutralize target="_blank" that tries to launch ad trackers
        if (targetAttr === '_blank' && isAdTarget(href)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    } catch(err) {}
  }, true);

  // 4. Neutralize window.open ad popups & popunders
  var origOpen = window.open;
  window.open = function(url, target, features) {
    if (url && (url.includes('ad') || url.includes('pop') || url.includes('banner') || url.includes('click'))) {
      console.log('Blocked popup:', url);
    if (!url || typeof url !== 'string' || isAdTarget(url)) {
      return null;
    }
    // Disallow opening about:blank popups that malicious scripts use for delayed redirection
    if (url === 'about:blank' || url === '') {
      return null;
    }
    return origOpen.apply(this, arguments);
  };

  // 5. Intercept createElement to prevent ad script and iframe injection
  var origCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    var el = origCreateElement.call(document, tagName, options);
    if (!tagName) return el;
    var tag = tagName.toLowerCase();

    if (tag === 'iframe' || tag === 'script') {
      var origSetAttr = el.setAttribute;
      el.setAttribute = function(name, val) {
        if (name && name.toLowerCase() === 'src' && isAdTarget(val)) {
          return origSetAttr.call(el, 'src', 'about:blank');
        }
        return origSetAttr.apply(el, arguments);
      };

      Object.defineProperty(el, 'src', {
        set: function(val) {
          if (isAdTarget(val)) {
            this.setAttribute('src', 'about:blank');
          } else {
            origSetAttr.call(this, 'src', val);
          }
        },
        get: function() {
          return this.getAttribute('src') || '';
        },
        configurable: true
      });
    }
    return el;
  };

  // 6. DOM MutationObserver & Interval Cleanup
  function scanAndPurgeAds() {
    applyStyle();
    removeDeceptiveOverlays();
  }

  scanAndPurgeAds();
  var purgeInterval = setInterval(scanAndPurgeAds, 1000);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function() {
      scanAndPurgeAds();
    });
    if (document.documentElement || document.body) {
      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  setTimeout(function() {
    clearInterval(purgeInterval);
  }, 120000);
})();
true;
`;

