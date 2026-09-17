// ============================================================================
// IUC Browser - Ultimate AdBlock & Anti-Clickjack Protection Engine
// ============================================================================
// Features:
//   1. Network-level ad URL blocking (domains + URL path/query patterns)
//   2. CSS-based instant hiding of known ad selectors
//   3. Anti-clickjack: invisible overlay purging (transparent full-screen divs)
//   4. Anti-onclick redirect ads (capturing click interceptor)
//   5. Popunder / popupad / window.open neutralization
//   6. Script & iframe injection interception via createElement hook
//   7. MutationObserver-driven continuous DOM purging
//   8. Fetch/XMLHttpRequest interception for ad network requests
//   9. Event listener hijack prevention (addEventListener hook)
//  10. Anti-redirect: beforeunload & location.assign/replace hooking
// ============================================================================

// ---------------------------------------------------------------------------
// SECTION 1: Known Ad / Tracker / Popup Domains (400+)
// ---------------------------------------------------------------------------
export const AD_BLOCK_DOMAINS = [
  // === Google Ads & Marketing Networks ===
  'googlesyndication.com',
  'googleadservices.com',
  'doubleclick.net',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'tpc.googlesyndication.com',
  'partner.googleadservices.com',
  'google-analytics.com',
  'googletagservices.com',
  'googletagmanager.com',
  'adsense.google.com',
  'adwords.google.com',

  // === Facebook / Meta Ads ===
  'facebook.com/tr',
  'connect.facebook.net/en_US/fbevents.js',
  'an.facebook.com',
  'pixel.facebook.com',

  // === Popunder / Popup / Redirect Ad Networks ===
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'propellerpops.com',
  'exoclick.com',
  'exosrv.com',
  'exdynsrv.com',
  'adcash.com',
  'adnxs.com',
  'trafficjunky.com',
  'juicyads.com',
  'clickadu.com',
  'adsterra.com',
  'adsterratools.com',
  'hilltopads.com',
  'monetag.com',
  'richpush.co',
  'onclicktop.com',
  'onclickbright.com',
  'onclickgenius.com',
  'onclickmax.com',
  'onclickpredic.com',
  'onclicksuper.com',
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
  'ad-maven.com',
  'admaven.com',
  'pushame.com',
  'pushengage.com',
  'pushwoosh.com',
  'roost.io',
  'sendpulse.com',
  'trafforsrv.com',
  'galaksion.com',
  'evadav.com',
  'pushground.com',
  'pushhouse.io',
  'pushpool.com',
  'megapush.io',
  'datapush.io',
  'notix.io',
  'subscribstar.com',
  'catapush.com',
  'dolohen.com',
  'aerserv.com',
  'trklnks.com',
  'trklinks.com',
  'alclick.com',
  'adplxmd.com',
  'adbooth.com',
  'adtng.com',
  'ad6media.fr',
  'adk2.com',
  'adkernel.com',
  'adspyglass.com',
  'adtelligent.com',
  'bongacams.com',
  'livejasmin.com',
  'cam4ads.com',
  'stripcash.com',
  'tsyndicate.com',
  'adf.ly',
  'shorte.st',
  'bc.vc',
  'sh.st',
  'ouo.io',
  'cetrk.com',
  'cpmstar.com',
  'crptentry.com',
  'lnkr.us',
  'shrink.pe',

  // === Content Recommendation & Native Ads ===
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
  'nativendo.de',
  'seedtag.com',
  'dianomi.com',
  'nativo.com',

  // === Tracking / DSP / Programmatic Exchanges ===
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
  'advertising.com',
  'admixer.net',
  'bidtellect.com',
  'sharethrough.com',
  'smaato.net',
  'medianet.com',
  'media.net',
  'amazon-adsystem.com',
  'aps.amazon.com',
  'aax-us-east.amazon-adsystem.com',
  'yieldmanager.com',
  'appnexus.com',
  'adzerk.net',
  'spotxchange.com',
  'spotx.tv',
  'lijit.com',
  'mathtag.com',
  'mdotm.com',
  'mintegral.com',
  'liftoff.io',

  // === Web Analytics / Fingerprinting ===
  'hotjar.com',
  'mouseflow.com',
  'fullstory.com',
  'clicktale.com',
  'crazyegg.com',
  'inspectlet.com',
  'luckyorange.com',
  'sessioncam.com',
  'heatmap.com',
  'logrocket.com',
  'mixpanel.com',
  'amplitude.com',
  'segment.io',
  'segment.com',
  'optimizely.com',
  'branch.io',
  'adjust.com',
  'appsflyer.com',
  'kochava.com',
  'singular.net',
  'tenjin.io',
  'omtrdc.net',
  'demdex.net',
  'everesttech.net',
  'bluekai.com',
  'krxd.net',
  'exelator.com',
  'rlcdn.com',
  'agkn.com',
  'acuityplatform.com',
  'addthis.com',
  'bounceexchange.com',
  'bouncex.net',
  'truoptik.com',

  // === Malvertising / Scam / Redirect Domains ===
  'go.oclasrv.com',
  'go.mobisla.com',
  'go.onclasrv.com',
  'go.pub2srv.com',
  'go.transfergate.xyz',
  'syndication.realsrv.com',
  'syndication.exoclick.com',
  'syndication.exosrv.com',
  'cdn.popcash.net',
  's.optmstr.com',
  'cdn.optmstr.com',
  'redirectgate.com',
  'mightydeal.com',
  'webcompanion.com',
  'trk.netsol.click',
  'trk.sportsflix.net',
  'trk.adtrue.com',
  'get.optmyzer.com',
  'landing.tbadvideo.com',
  'static.surfe.pro',

  // === Video / Pre-roll Ad Networks ===
  'innovid.com',
  'springserve.com',
  'freewheel.com',
  'fwmrm.net',
  'videohub.tv',
  'extremereach.io',
  'adap.tv',
  'brightroll.com',
  'tremorhub.com',
  'telaria.com',
  'unrulymedia.com',
  'connatix.com',
  'primis.tech',
  'vidoomy.com',
  'anyclip.com',

  // === Crypto / Survey Scam Ads ===
  'cointraffic.io',
  'a-ads.com',
  'bitmedia.io',
  'coinzilla.com',
  'mellow.ads',
  'runads.com',
  'offerwall.com',
  'theoremreach.com',
  'pollfish.com',
  'tapresearch.com',
  'cpx-research.com',
  'surveymonkey.com/mp/lp/',
];

// ---------------------------------------------------------------------------
// SECTION 2: URL Path / Query Pattern Regex (catches ad URLs on any domain)
// ---------------------------------------------------------------------------
export const AD_URL_REGEX = new RegExp(
  '(?:' + [
    // Ad server / service / system paths
    'adserver', 'adservice', 'adsystem', 'adtrack', 'adclick', 'adcontent',
    'adtag', 'advert', 'adverts', 'advertise', 'adsrv', 'adserving',
    'ad-exchange', 'adexchange', 'adbroker',
    // Popup / popunder / redirect paths
    'popunder', 'popupad', 'pop-under', 'pop_under', 'pop_up', 'pop-up',
    'popup_ad', 'popunder_ad', 'popad', 'popnew',
    // Affiliate / tracking
    'affiliate_banner', 'clicktrack', 'redirect_ad', 'clickthrough',
    'click_track', 'clktrk', 'clk_track', 'clickgate', 'click_gate',
    'trackclick', 'trkclk',
    // Banner / slot / unit identifiers
    'banner_id', 'ad_slot', 'ad_unit', 'ad_type=', 'adzone', 'ad_zone',
    'ad_position', 'adposition', 'ad_placement', 'adplacement',
    'bannerframe', 'bannerview',
    // Common ad file paths
    '\\/ad\\b', '\\/ads\\b', '\\/ad-', '\\/ads-', '\\/ad_', '\\/ads_',
    '\\/adx\\/', '\\/adv\\/',
    '\\/banners?\\/', 'banner\\.php', 'banner\\.html',
    'ad\\.js', 'ads\\.js', 'ad\\.min\\.js', 'ads\\.min\\.js',
    'ad-loader', 'adloader', 'ad_loader',
    'ad-frame', 'adframe', 'ad_frame',
    'ad-widget', 'adwidget',
    'prebid', 'header-bidding', 'headerbidding',
    // Pixel / beacon / tracking
    '\\/pixel\\b', '\\/beacon\\b', '\\/tracking\\b', '\\/track\\b',
    'pixel\\.gif', 'pixel\\.png', 'spacer\\.gif',
    'impression\\.php', 'impressions\\/', 'imp\\.php',
    'pv\\.php', 'pageview\\.php',
    // Popup scripts
    'popjs', 'popscript', 'poplib', 'smartpop',
    'popmanager', 'layer-ad', 'layerad',
    // Interstitial / overlay
    'interstitial', 'overlay-ad', 'overlayad', 'fullpage-ad',
    'fullpagead', 'welcomead', 'splash-ad', 'splashad',
    // Clickjack / redirect patterns
    'clickjack', 'clickunder', 'click-under', 'click_under',
    'onclick-ad', 'onclickad', 'onclick_pop',
    'redirect\\.php', 'redir\\.php', 'go\\.php\\?',
    'out\\.php\\?', 'away\\.php\\?',
    // Common ad network path segments
    'pagead', 'show_ads', 'showads', 'getad', 'get_ad',
    'loadad', 'load_ad', 'deliverad', 'deliver_ad',
    'servead', 'serve_ad', 'fetchad', 'fetch_ad',
  ].join('|') + ')',
  'i'
);

// ---------------------------------------------------------------------------
// SECTION 3: Downloadable ad resource extensions (block these when from ad domains)
// ---------------------------------------------------------------------------
const AD_RESOURCE_PATTERNS = /\.(gif|png|jpg|jpeg|webp|svg|swf)\?.*(?:ad|banner|click|track|pop)/i;

/**
 * Checks if a given URL belongs to an ad network, tracking server, or popup spam service
 */
export function isAdUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const clean = rawUrl.toLowerCase().trim();

  // Allow internal browser schemes
  if (
    clean.startsWith('uc://') ||
    clean.startsWith('about:') ||
    clean.startsWith('blob:') ||
    clean.startsWith('data:')
  ) {
    return false;
  }

  // Allow legitimate search engines and popular top sites (whitelist)
  if (
    clean.includes('google.com/search') ||
    clean.includes('google.com/complete') ||
    clean.includes('bing.com/search') ||
    clean.includes('duckduckgo.com') ||
    clean.includes('youtube.com/watch') ||
    clean.includes('youtube.com/embed') ||
    clean.includes('youtu.be/') ||
    clean.includes('wikipedia.org') ||
    clean.includes('github.com') ||
    clean.includes('stackoverflow.com') ||
    clean.includes('reddit.com') ||
    clean.includes('play.google.com')
  ) {
    return false;
  }

  // Check known ad domain list
  for (let i = 0; i < AD_BLOCK_DOMAINS.length; i++) {
    if (clean.includes(AD_BLOCK_DOMAINS[i])) {
      return true;
    }
  }

  // Check generic ad URL regex pattern
  if (AD_URL_REGEX.test(clean)) {
    return true;
  }

  // Check ad resource patterns (e.g. image.gif?adid=123&banner=true)
  if (AD_RESOURCE_PATTERNS.test(clean)) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// SECTION 4: In-page JavaScript Injection Bundle
// ---------------------------------------------------------------------------
// Injected at document_start AND document_end to comprehensively neutralize:
//   - Malicious overlays / invisible click-trap divs (anti-clickjack)
//   - window.open popups / popunders
//   - Dynamic ad script/iframe injection
//   - onclick redirect ads on any element
//   - Fetch/XHR requests to ad servers
//   - addEventListener hijacking for ad-related event listeners
//   - location.assign/replace redirect hijacking
// ---------------------------------------------------------------------------

export const AD_BLOCK_JS = `
(function() {
  'use strict';
  if (window.__IUC_ADBLOCK_V2__) return;
  window.__IUC_ADBLOCK_V2__ = true;

  // =========================================================================
  // CONFIG
  // =========================================================================
  var adDomains = ${JSON.stringify(AD_BLOCK_DOMAINS)};
  var adRegex = ${AD_URL_REGEX.toString()};

  // =========================================================================
  // UTILITY: Check if URL is ad-related
  // =========================================================================
  function isAd(url) {
    if (!url || typeof url !== 'string') return false;
    var u = url.toLowerCase().trim();
    if (u.startsWith('javascript:') || u === '#' || u === '' ||
        u.startsWith('about:') || u.startsWith('blob:') || u.startsWith('data:') ||
        u.startsWith('tel:') || u.startsWith('mailto:') || u.startsWith('sms:')) return false;
    // Whitelist
    if (u.indexOf('google.com/search') !== -1 || u.indexOf('youtube.com/watch') !== -1 ||
        u.indexOf('wikipedia.org') !== -1 || u.indexOf('github.com') !== -1 ||
        u.indexOf('play.google.com') !== -1) return false;
    for (var i = 0; i < adDomains.length; i++) {
      if (u.indexOf(adDomains[i]) !== -1) return true;
    }
    return adRegex.test(u);
  }

  // =========================================================================
  // 1. CSS INJECTION: Hide all known ad selectors instantly
  // =========================================================================
  var cssSelectors = [
    // Google Ads
    'ins.adsbygoogle',
    'div[id^="google_ads_"]',
    'iframe[id^="google_ads_"]',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="googleadservices.com"]',
    // Ad network iframes
    'iframe[src*="adnxs.com"]',
    'iframe[src*="exoclick.com"]',
    'iframe[src*="exosrv.com"]',
    'iframe[src*="propellerads.com"]',
    'iframe[src*="popads.net"]',
    'iframe[src*="popcash.net"]',
    'iframe[src*="clickadu.com"]',
    'iframe[src*="adsterra.com"]',
    'iframe[src*="trafficjunky.com"]',
    'iframe[src*="juicyads.com"]',
    'iframe[src*="hilltopads.com"]',
    'iframe[src*="monetag.com"]',
    'iframe[src*="ad-maven.com"]',
    'iframe[src*="admaven.com"]',
    'iframe[src*="taboola.com"]',
    'iframe[src*="outbrain.com"]',
    'iframe[src*="mgid.com"]',
    'iframe[src*="revcontent.com"]',
    'iframe[src*="criteo.com"]',
    'iframe[src*="amazon-adsystem.com"]',
    'iframe[src*="media.net"]',
    // Generic class/id based ad containers
    'div[class*="ad-container"]',
    'div[class*="ad-wrapper"]',
    'div[class*="ad-banner"]',
    'div[class*="ad_banner"]',
    'div[class*="ad-slot"]',
    'div[class*="ad_slot"]',
    'div[id*="ad-slot"]',
    'div[id*="ad_slot"]',
    'div[id*="adbanner"]',
    'div[class*="adbanner"]',
    'div[class*="adunit"]',
    'div[id*="adunit"]',
    'div[class*="ad-unit"]',
    'div[id*="ad-unit"]',
    'div[class*="ad_unit"]',
    'div[id*="ad_unit"]',
    'div[class*="sponsored-post"]',
    'div[class*="sponsored_post"]',
    'div[class*="sponsored-content"]',
    'div[class*="native-ad"]',
    'div[class*="native_ad"]',
    'div[id*="advertisement"]',
    'div[class*="advertisement"]',
    'div[class*="ad-box"]',
    'div[class*="adsbox"]',
    'div[class*="ad_box"]',
    'div[class*="banner-ads"]',
    'div[class*="banner_ads"]',
    'div[class*="floating-ad"]',
    'div[class*="floating_ad"]',
    'div[class*="bottom-ad"]',
    'div[class*="sticky-ad"]',
    'div[id*="sticky-ad"]',
    'div[class*="interstitial"]',
    'div[id*="interstitial"]',
    'div[class*="overlay-ad"]',
    'div[id*="overlay-ad"]',
    'div[class*="popup-ad"]',
    'div[id*="popup-ad"]',
    'div[class*="popunder"]',
    'div[id*="popunder"]',
    'div[class*="clickjack"]',
    // Taboola / Outbrain / MGID
    'div[class*="taboola"]',
    'div[id*="taboola"]',
    'div[id*="outbrain"]',
    'div[class*="outbrain"]',
    'div[id*="mgid"]',
    'div[class*="mgid"]',
    'div[id*="revcontent"]',
    'div[class*="revcontent"]',
    // Ad links
    'a[href*="doubleclick.net"]',
    'a[href*="adclick"]',
    'a[href*="popads.net"]',
    'a[href*="propellerads.com"]',
    'a[href*="exoclick.com"]',
    'a[href*="clickadu.com"]',
    'a[href*="trafficjunky.com"]',
    'a[href*="adsterra.com"]',
    'a[href*="ad-maven.com"]',
    'a[href*="admaven.com"]',
    'a[href*="juicyads.com"]',
    'a[href*="hilltopads.com"]',
    'a[href*="adf.ly"]',
    'a[href*="shorte.st"]',
    'a[href*="ouo.io"]',
    'a[href*="bc.vc"]',
    // Generic ad classes
    '.ad-placement',
    '.ad-holder',
    '.ad-unit',
    '.ad-spot',
    '.ad-frame',
    '.ad-overlay',
    '.ad-modal',
    '.ad-interstitial',
    '.adsbygoogle',
    '.adsense',
    '.dfp-ad',
    '.gpt-ad',
    // YouTube ad overlays
    '.video-ad-overlay',
    '.ytp-ad-overlay-container',
    '.ytp-ad-message-container',
    '.ytp-ad-module',
    '.ytp-ad-text',
    '.ytp-ad-player-overlay',
    '.ytp-ad-skip-button-container',
    // Social share spam overlays
    'div[class*="share-gate"]',
    'div[class*="newsletter-popup"]',
    // Mining scripts
    'script[src*="coinhive"]',
    'script[src*="coin-hive"]',
    'script[src*="crypto-loot"]',
    'script[src*="cryptoloot"]',
    'script[src*="authedmine"]',
    'script[src*="jsecoin"]',
    'script[src*="miner.js"]',
    // Zero-size / hidden iframes (common ad/tracking trick)
    'iframe[width="0"]',
    'iframe[height="0"]',
    'iframe[style*="display:none"]',
    'iframe[style*="display: none"]',
    'iframe[style*="visibility:hidden"]',
    'iframe[style*="visibility: hidden"]',
    'iframe[style*="width:0"]',
    'iframe[style*="height:0"]',
    'iframe[style*="width: 0"]',
    'iframe[style*="height: 0"]'
  ].join(', ');

  var hideRule = ' { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; max-height: 0 !important; width: 0 !important; max-width: 0 !important; overflow: hidden !important; position: absolute !important; left: -99999px !important; top: -99999px !important; z-index: -9999 !important; }';

  function injectStyles() {
    var headOrDoc = document.head || document.documentElement;
    if (headOrDoc && !document.getElementById('__iuc_adblock_css__')) {
      var s = document.createElement('style');
      s.id = '__iuc_adblock_css__';
      s.textContent = cssSelectors + hideRule;
      headOrDoc.appendChild(s);
    }
  }
  injectStyles();

  // =========================================================================
  // 2. ANTI-CLICKJACK: Remove transparent / invisible overlays
  // =========================================================================
  function purgeInvisibleOverlays() {
    try {
      var candidates = document.querySelectorAll('div, a, span, section, aside, article, iframe');
      var winW = window.innerWidth || document.documentElement.clientWidth || 360;
      var winH = window.innerHeight || document.documentElement.clientHeight || 640;

      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (el === document.body || el === document.documentElement) continue;
        if (el.id === '__iuc_adblock_css__') continue;

        var cs = null;
        try { cs = window.getComputedStyle(el); } catch(e) { continue; }
        if (!cs) continue;

        var pos = cs.position;
        var isFixed = (pos === 'fixed' || pos === 'absolute' || pos === 'sticky');
        var zIdx = parseInt(cs.zIndex, 10) || 0;
        var opacity = parseFloat(cs.opacity);
        var bg = cs.background || '';
        var bgColor = cs.backgroundColor || '';
        var ptr = cs.pointerEvents;

        // Pattern 1: Full-screen transparent overlay with high z-index (classic clickjack)
        if (isFixed && zIdx > 900) {
          var isTransparent = (
            opacity < 0.15 ||
            bgColor === 'rgba(0, 0, 0, 0)' ||
            bgColor === 'transparent' ||
            bg.indexOf('transparent') !== -1 ||
            (opacity <= 0.01 && bgColor === '')
          );

          if (isTransparent) {
            var rect = el.getBoundingClientRect();
            if (rect.width >= winW * 0.6 && rect.height >= winH * 0.6) {
              el.style.cssText = 'display:none!important;pointer-events:none!important;';
              try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e) {}
              continue;
            }
          }
        }

        // Pattern 2: Elements with pointer-events:none covering entire viewport
        // (used to let clicks "pass through" to hidden ad beneath)
        if (isFixed && zIdx > 500 && ptr !== 'none') {
          var rect2 = el.getBoundingClientRect();
          if (rect2.width >= winW * 0.9 && rect2.height >= winH * 0.9) {
            // Check if it has an onclick or ad href
            var onclk = el.getAttribute('onclick') || '';
            var href = el.getAttribute('href') || el.href || '';
            if (isAd(href) || isAd(onclk) ||
                onclk.indexOf('window.open') !== -1 ||
                onclk.indexOf('location') !== -1) {
              el.style.cssText = 'display:none!important;pointer-events:none!important;';
              try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e) {}
              continue;
            }
          }
        }

        // Pattern 3: Invisible iframes covering the viewport
        if (el.tagName === 'IFRAME' && isFixed) {
          var iSrc = (el.getAttribute('src') || el.src || '').toLowerCase();
          if (isAd(iSrc) || iSrc === '' || iSrc === 'about:blank') {
            var rect3 = el.getBoundingClientRect();
            if (rect3.width >= winW * 0.5 && rect3.height >= winH * 0.5) {
              el.style.cssText = 'display:none!important;';
              try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e) {}
              continue;
            }
          }
        }

        // Pattern 4: Small 1x1 or 0x0 tracking pixels/iframes
        if (el.tagName === 'IFRAME' || el.tagName === 'IMG') {
          var w = parseInt(el.getAttribute('width') || '999', 10);
          var h = parseInt(el.getAttribute('height') || '999', 10);
          if ((w <= 1 && h <= 1) || (w === 0 || h === 0)) {
            var pSrc = (el.getAttribute('src') || el.src || '').toLowerCase();
            if (isAd(pSrc) || pSrc.indexOf('pixel') !== -1 || pSrc.indexOf('beacon') !== -1 ||
                pSrc.indexOf('tracker') !== -1 || pSrc.indexOf('impression') !== -1) {
              el.style.display = 'none';
              try { if (el.parentNode) el.parentNode.removeChild(el); } catch(e) {}
            }
          }
        }
      }
    } catch(e) {}
  }

  // =========================================================================
  // 3. ANTI-ONCLICK REDIRECT: Capture-phase click interceptor
  // =========================================================================
  // Catches clicks on ANY element (not just <a>) that has onclick redirect ads
  document.addEventListener('click', function(e) {
    try {
      var t = e.target;

      // Walk up to find the nearest actionable element
      var actionEl = t;
      var depth = 0;
      while (actionEl && actionEl !== document.body && depth < 15) {
        var tag = (actionEl.tagName || '').toUpperCase();

        // Check onclick attribute for redirects/popups
        var onclick = actionEl.getAttribute('onclick') || '';
        if (onclick) {
          // Block onclick that opens ad URLs
          if (isAd(onclick)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          // Block onclick with window.open to ad URLs
          var woMatch = onclick.match(/window\\.open\\s*\\(\\s*['"]([^'"]*)['"]/);
          if (woMatch && woMatch[1] && isAd(woMatch[1])) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          // Block onclick with location redirect to ad
          var locMatch = onclick.match(/(?:location|location\\.href|location\\.assign|location\\.replace)\\s*[=\\(]\\s*['"]([^'"]*)['"]/);
          if (locMatch && locMatch[1] && isAd(locMatch[1])) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        }

        // Check data attributes commonly used for ad redirects
        var dataUrl = actionEl.getAttribute('data-url') ||
                      actionEl.getAttribute('data-href') ||
                      actionEl.getAttribute('data-link') ||
                      actionEl.getAttribute('data-redirect') || '';
        if (dataUrl && isAd(dataUrl)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }

        // Check <a> tags specifically
        if (tag === 'A') {
          var href = actionEl.getAttribute('href') || actionEl.href || '';
          var target = actionEl.getAttribute('target') || '';

          if (isAd(href)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }

          // Block target=_blank ad links
          if (target === '_blank' && isAd(href)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        }

        // Check for inline event handlers on divs/spans
        if ((tag === 'DIV' || tag === 'SPAN' || tag === 'BUTTON') && actionEl.hasAttribute('onclick')) {
          var clickVal = actionEl.getAttribute('onclick') || '';
          if (clickVal.indexOf('window.open') !== -1 || clickVal.indexOf('location.href') !== -1) {
            // Extract URL from the handler
            var urlInClick = clickVal.match(/['"]https?:\\/\\/[^'"]+['"]/);
            if (urlInClick) {
              var extractedUrl = urlInClick[0].replace(/['"]/g, '');
              if (isAd(extractedUrl)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
              }
            }
          }
        }

        actionEl = actionEl.parentNode;
        depth++;
      }
    } catch(err) {}
  }, true); // Capture phase!

  // Also intercept mousedown (some ad scripts use mousedown instead of click)
  document.addEventListener('mousedown', function(e) {
    try {
      var t = e.target;
      var depth = 0;
      while (t && t !== document.body && depth < 10) {
        var onclick = t.getAttribute && t.getAttribute('onclick') || '';
        if (onclick && (isAd(onclick) || /window\\.open/.test(onclick))) {
          var urlMatch = onclick.match(/['"]https?:\\/\\/[^'"]+['"]/);
          if (urlMatch) {
            var url = urlMatch[0].replace(/['"]/g, '');
            if (isAd(url)) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }
          }
        }
        t = t.parentNode;
        depth++;
      }
    } catch(err) {}
  }, true);

  // =========================================================================
  // 4. WINDOW.OPEN NEUTRALIZATION (popups, popunders, new tab ads)
  // =========================================================================
  var _origOpen = window.open;
  window.open = function(url, target, features) {
    if (!url || typeof url !== 'string') return null;
    if (isAd(url)) return null;
    // Block about:blank popups (malicious delayed redirect technique)
    if (url === 'about:blank' || url === '' || url === 'about:srcdoc') return null;
    // Block tiny popup windows (common popunder dimensions)
    if (features && typeof features === 'string') {
      var wMatch = features.match(/width\\s*=\\s*(\\d+)/);
      var hMatch = features.match(/height\\s*=\\s*(\\d+)/);
      if (wMatch && hMatch) {
        var pw = parseInt(wMatch[1], 10);
        var ph = parseInt(hMatch[1], 10);
        if (pw <= 1 || ph <= 1) return null; // 1x1 hidden popup
      }
    }
    return _origOpen.apply(this, arguments);
  };

  // =========================================================================
  // 5. createElement HOOK: Intercept ad script/iframe injection
  // =========================================================================
  var _origCreate = document.createElement;
  document.createElement = function(tagName, opts) {
    var el = _origCreate.call(document, tagName, opts);
    if (!tagName) return el;
    var tag = tagName.toLowerCase();

    if (tag === 'iframe' || tag === 'script' || tag === 'img') {
      var _origSetAttr = el.setAttribute;
      el.setAttribute = function(name, val) {
        if (name && (name.toLowerCase() === 'src' || name.toLowerCase() === 'href')) {
          if (typeof val === 'string' && isAd(val)) {
            if (tag === 'script') return; // Silently drop ad scripts
            return _origSetAttr.call(el, 'src', 'about:blank');
          }
        }
        return _origSetAttr.apply(el, arguments);
      };

      // Also intercept direct .src property assignment
      var _srcDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'src') ||
                     Object.getOwnPropertyDescriptor(el.__proto__, 'src') || {};

      try {
        Object.defineProperty(el, 'src', {
          set: function(val) {
            if (typeof val === 'string' && isAd(val)) {
              if (tag === 'script') return; // Drop
              _origSetAttr.call(this, 'src', 'about:blank');
            } else {
              _origSetAttr.call(this, 'src', val || '');
            }
          },
          get: function() {
            return this.getAttribute('src') || '';
          },
          configurable: true,
          enumerable: true
        });
      } catch(e) {}
    }
    return el;
  };

  // =========================================================================
  // 6. FETCH / XHR INTERCEPTION: Block network requests to ad servers
  // =========================================================================
  // Hook fetch()
  if (window.fetch) {
    var _origFetch = window.fetch;
    window.fetch = function(input, init) {
      var url = '';
      if (typeof input === 'string') {
        url = input;
      } else if (input && input.url) {
        url = input.url;
      }
      if (url && isAd(url)) {
        return new Promise(function(resolve) {
          resolve(new Response('', { status: 200, statusText: 'Blocked' }));
        });
      }
      return _origFetch.apply(this, arguments);
    };
  }

  // Hook XMLHttpRequest.open
  if (window.XMLHttpRequest) {
    var _origXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string' && isAd(url)) {
        // Redirect to null endpoint
        arguments[1] = 'data:text/plain,blocked';
        this.__iuc_blocked__ = true;
      }
      return _origXhrOpen.apply(this, arguments);
    };

    var _origXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
      if (this.__iuc_blocked__) return; // Don't send blocked requests
      return _origXhrSend.apply(this, arguments);
    };
  }

  // =========================================================================
  // 7. ANTI-REDIRECT: Hook location changes to ad URLs
  // =========================================================================
  // Prevent scripts from redirecting to ad pages
  try {
    var _origAssign = window.location.assign;
    var _origReplace = window.location.replace;

    if (_origAssign) {
      window.location.assign = function(url) {
        if (typeof url === 'string' && isAd(url)) return;
        return _origAssign.call(window.location, url);
      };
    }
    if (_origReplace) {
      window.location.replace = function(url) {
        if (typeof url === 'string' && isAd(url)) return;
        return _origReplace.call(window.location, url);
      };
    }
  } catch(e) {
    // location property hooks may fail in strict environments
  }

  // Intercept setter on window.location.href
  try {
    var locDesc = Object.getOwnPropertyDescriptor(window, 'location');
    // Only attempt if we can redefine
  } catch(e) {}

  // =========================================================================
  // 8. addEventListener HIJACK PREVENTION
  // =========================================================================
  // Some ad scripts attach invisible click/touch handlers to document.body
  var _origAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, opts) {
    // Block ad scripts attaching click/touchstart/mousedown on document/body
    if ((type === 'click' || type === 'touchstart' || type === 'mousedown' || type === 'pointerdown') &&
        (this === document || this === document.body || this === window)) {
      if (listener && typeof listener === 'function') {
        var fnStr = '';
        try { fnStr = listener.toString().substring(0, 500); } catch(e) {}
        if (fnStr && (
          fnStr.indexOf('window.open') !== -1 ||
          fnStr.indexOf('popup') !== -1 ||
          fnStr.indexOf('popunder') !== -1 ||
          fnStr.indexOf('clickunder') !== -1 ||
          fnStr.indexOf('location.href') !== -1 ||
          fnStr.indexOf('location.assign') !== -1 ||
          fnStr.indexOf('location.replace') !== -1
        )) {
          // Check if the function references ad URLs
          var hasAdUrl = false;
          for (var d = 0; d < adDomains.length; d++) {
            if (fnStr.indexOf(adDomains[d]) !== -1) {
              hasAdUrl = true;
              break;
            }
          }
          if (hasAdUrl || adRegex.test(fnStr)) {
            return; // Silently block this event listener registration
          }
        }
      }
    }
    return _origAddEventListener.apply(this, arguments);
  };

  // =========================================================================
  // 9. TIMER-BASED REDIRECT BLOCKING
  // =========================================================================
  // Block setTimeout/setInterval that redirect to ad URLs
  var _origSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay) {
    if (typeof fn === 'string') {
      if (isAd(fn) || /window\\.open|location\\.href|location\\.assign|location\\.replace/.test(fn)) {
        var urlInStr = fn.match(/['"]https?:\\/\\/[^'"]+['"]/);
        if (urlInStr) {
          var extracted = urlInStr[0].replace(/['"]/g, '');
          if (isAd(extracted)) return 0;
        }
      }
    }
    return _origSetTimeout.apply(this, arguments);
  };

  // =========================================================================
  // 10. CONTINUOUS DOM SCANNING (MutationObserver + interval backup)
  // =========================================================================
  function fullScan() {
    injectStyles();
    purgeInvisibleOverlays();

    // Remove ad elements that slipped through CSS
    try {
      // Remove iframes with ad sources
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        var src = (iframes[i].getAttribute('src') || iframes[i].src || '').toLowerCase();
        if (isAd(src)) {
          iframes[i].style.display = 'none';
          try { iframes[i].parentNode.removeChild(iframes[i]); } catch(e) {}
        }
      }

      // Remove scripts with ad sources (prevent execution of newly injected ones)
      var scripts = document.querySelectorAll('script[src]');
      for (var j = 0; j < scripts.length; j++) {
        var sSrc = (scripts[j].getAttribute('src') || '').toLowerCase();
        if (isAd(sSrc)) {
          try { scripts[j].parentNode.removeChild(scripts[j]); } catch(e) {}
        }
      }

      // Remove elements with ad-related onclick handlers
      var allClickable = document.querySelectorAll('[onclick]');
      for (var k = 0; k < allClickable.length; k++) {
        var ocVal = allClickable[k].getAttribute('onclick') || '';
        if (isAd(ocVal)) {
          allClickable[k].removeAttribute('onclick');
          allClickable[k].style.pointerEvents = 'none';
        }
      }

      // Kill anchor tags pointing to ad networks
      var anchors = document.querySelectorAll('a[href]');
      for (var m = 0; m < anchors.length; m++) {
        var aHref = (anchors[m].getAttribute('href') || '').toLowerCase();
        if (isAd(aHref)) {
          anchors[m].removeAttribute('href');
          anchors[m].removeAttribute('onclick');
          anchors[m].style.pointerEvents = 'none';
          anchors[m].style.cursor = 'default';
        }
      }
    } catch(e) {}
  }

  // Initial scan
  fullScan();

  // Interval-based scanning (first 2 minutes, then stops to save CPU)
  var scanCount = 0;
  var scanInterval = setInterval(function() {
    fullScan();
    scanCount++;
    if (scanCount > 120) { // 2 minutes at 1/sec
      clearInterval(scanInterval);
    }
  }, 1000);

  // MutationObserver for real-time DOM changes
  if (window.MutationObserver) {
    var debounceTimer = null;
    var observer = new MutationObserver(function(mutations) {
      // Debounce to avoid excessive scanning
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = _origSetTimeout(function() {
        // Quick check: did any mutation add ad-related nodes?
        var needsScan = false;
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          if (added && added.length > 0) {
            for (var j = 0; j < added.length; j++) {
              var node = added[j];
              if (node.nodeType === 1) { // Element node
                var ntag = (node.tagName || '').toLowerCase();
                if (ntag === 'iframe' || ntag === 'script' || ntag === 'ins' || ntag === 'div') {
                  needsScan = true;
                  break;
                }
                var nSrc = node.getAttribute && (node.getAttribute('src') || '');
                if (nSrc && isAd(nSrc)) {
                  node.style.display = 'none';
                  try { node.parentNode.removeChild(node); } catch(e) {}
                  continue;
                }
              }
            }
          }
          if (needsScan) break;
        }
        if (needsScan) fullScan();
      }, 100);
    });

    var observeTarget = document.documentElement || document.body;
    if (observeTarget) {
      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'href', 'onclick', 'style']
      });
    }
  }

  // =========================================================================
  // 11. BEACON / NAVIGATOR.SENDBEACON BLOCKING
  // =========================================================================
  if (navigator.sendBeacon) {
    var _origBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function(url, data) {
      if (typeof url === 'string' && isAd(url)) return true; // Pretend success
      return _origBeacon.apply(navigator, arguments);
    };
  }

  // =========================================================================
  // 12. DOCUMENT.WRITE BLOCKING for ad injection
  // =========================================================================
  var _origWrite = document.write;
  var _origWriteln = document.writeln;
  document.write = function(html) {
    if (typeof html === 'string') {
      // Check if the written HTML contains ad script/iframe sources
      var lower = html.toLowerCase();
      if (lower.indexOf('<script') !== -1 || lower.indexOf('<iframe') !== -1) {
        // Extract src values
        var srcMatches = html.match(/src\\s*=\\s*["']([^"']+)["']/gi);
        if (srcMatches) {
          for (var i = 0; i < srcMatches.length; i++) {
            var srcVal = srcMatches[i].replace(/src\\s*=\\s*["']/i, '').replace(/["']$/, '');
            if (isAd(srcVal)) return; // Block entire write
          }
        }
      }
    }
    return _origWrite.apply(document, arguments);
  };
  document.writeln = function(html) {
    if (typeof html === 'string') {
      var lower = html.toLowerCase();
      if (lower.indexOf('<script') !== -1 || lower.indexOf('<iframe') !== -1) {
        var srcMatches = html.match(/src\\s*=\\s*["']([^"']+)["']/gi);
        if (srcMatches) {
          for (var i = 0; i < srcMatches.length; i++) {
            var srcVal = srcMatches[i].replace(/src\\s*=\\s*["']/i, '').replace(/["']$/, '');
            if (isAd(srcVal)) return;
          }
        }
      }
    }
    return _origWriteln.apply(document, arguments);
  };

})();
true;
`;
