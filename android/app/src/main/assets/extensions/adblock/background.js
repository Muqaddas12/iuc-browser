// IUC Shield - GeckoView Native Network Interceptor
(function() {
  'use strict';

  var WHITELIST = [
    'google.com', 'youtube.com', 'youtu.be', 'googlevideo.com',
    'wikipedia.org', 'github.com', 'play.google.com', 'duckduckgo.com', 'brave.com',
    'vcloud.fit', 'fastdl.icu', 'hubcloud.club', 'hubcloud.lat', 'hubcloud.one', 'hubcloud.ink',
    'pixeldrain.com', 'mediafire.com', '1fichier.com', 'mega.nz', 'gdtot.pro', 'drivebuzz.org',
    'ayhal.com', 'myvccs.com'
  ];

  var AD_DOMAINS = [
    'googlesyndication.com', 'googleadservices.com', 'doubleclick.net', 'adservice.google.com',
    'pagead2.googlesyndication.com', 'tpc.googlesyndication.com', 'partner.googleadservices.com',
    'google-analytics.com', 'googletagservices.com', 'googletagmanager.com',
    'cathaytrash.com', 'hd.cathaytrash.com', 'llvpn.com', 'monetag.com', 'trk.monetag.com',
    'a.monetag.com', 'ad.monetag.com', 'servicer.monetag.com', 'brooadgate.com',
    'hontomoush.com', 'nothingdo.com', 'yepremium.com', 'zarazagorus.com', 'pushance.com',
    'pushails.com', 'embedrise.com', 'betterenov.com', 'webpushsdk.com', 'pushfund.com',
    'pusherism.com', 'realsrv.com', 'syndication.realsrv.com', 'notifpush.com', 'subscribtions.com',
    'pushcrew.com', 'onesignal.com', 'gravitec.net', 'cleverpush.com', 'cdn.onesignal.com',
    'popads.net', 'popcash.net', 'propellerads.com', 'propellerpops.com', 'exoclick.com',
    'exosrv.com', 'exdynsrv.com', 'adcash.com', 'adnxs.com', 'trafficjunky.com', 'juicyads.com',
    'clickadu.com', 'adsterra.com', 'adsterratools.com', 'hilltopads.com', 'richpush.co',
    'onclicktop.com', 'onclickbright.com', 'directrev.com', 'ad-maven.com', 'admaven.com',
    'galaksion.com', 'evadav.com', 'taboola.com', 'outbrain.com', 'revcontent.com', 'mgid.com',
    'adblade.com', 'content.ad', 'marketgid.com', 'criteo.com', 'criteo.net', 'adroll.com',
    'smartadserver.com', 'rubiconproject.com', 'openx.net', 'pubmatic.com', 'casalemedia.com',
    'bidswitch.net', 'sovrn.com', 'indexexchange.com', 'teads.tv', 'quantserve.com',
    'scorecardresearch.com', 'adform.net', 'serving-sys.com', 'moatads.com', 'advertising.com',
    'amazon-adsystem.com', 'media.net', 'an.facebook.com', 'pixel.facebook.com',
    'adcolony.com', 'inmobi.com', 'vungle.com', 'unityads.unity3d.com', 'ironsrc.com',
    'applovin.com', 'chartboost.com', 'tapjoy.com', 'flurry.com', 'mopub.com', 'startapp.com',
    'hotjar.com', 'mouseflow.com', 'fullstory.com', 'mixpanel.com', 'amplitude.com',
    'segment.io', 'optimizely.com', 'demdex.net', 'bluekai.com', 'krxd.net', 'addthis.com',
    'adf.ly', 'shorte.st', 'bc.vc', 'ouo.io', 'linkvertise.com', 'shrinkme.io',
    'bidvertiser.com', 'infolinks.com', 'revenuehits.com', 'trafficstars.com', 'plugrush.com',
    'zergnet.com', 'cpmstar.com'
  ];

  var AD_PATTERN = /(?:adserver|adservice|adsystem|adtrack|adclick|popunder|popupad|banner\.php|ad\.js|ads\.js|\/ad\/|\/ads\/|\/banners\/|clicktrack|redirect_ad|ad_slot|ad_unit|interstitial|overlay-ad|tag\.min\.js|data-zone|cathaytrash|llvpn|pagead|show_ads|pixel|beacon|tracking)/i;
  var EMAIL_PIXEL_PATTERN = /(?:pixel\.gif|beacon\.gif|track\.gif|open\.gif|tracking\.php|\/email-track\/|\/mail-open\/|\/trk\/)/i;

  function isAdUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      var parsed = new URL(url);
      var hostname = parsed.hostname.toLowerCase();

      for (var i = 0; i < WHITELIST.length; i++) {
        if (hostname === WHITELIST[i] || hostname.endsWith('.' + WHITELIST[i])) {
          return false;
        }
      }

      for (var j = 0; j < AD_DOMAINS.length; j++) {
        if (hostname === AD_DOMAINS[j] || hostname.endsWith('.' + AD_DOMAINS[j])) {
          return true;
        }
      }

      if (AD_PATTERN.test(parsed.pathname) || AD_PATTERN.test(parsed.search)) {
        return true;
      }

      if (EMAIL_PIXEL_PATTERN.test(parsed.pathname) || EMAIL_PIXEL_PATTERN.test(parsed.search)) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  if (typeof browser !== 'undefined' && browser.webRequest && browser.webRequest.onBeforeRequest) {
    browser.webRequest.onBeforeRequest.addListener(
      function(details) {
        if (isAdUrl(details.url)) {
          console.log('[IUC Shield WebExtension 🛑 BLOCKED URL]:', details.url, '| Type:', details.type, '| Initiator:', details.initiator || details.originUrl || 'main-frame');
          return { cancel: true };
        }
        return { cancel: false };
      },
      { urls: ['<all_urls>'] },
      ['blocking']
    );
  }
})();

