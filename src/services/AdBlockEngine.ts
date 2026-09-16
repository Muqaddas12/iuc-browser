// AdBlock injection script for blocking ad networks, popup scripts, and banner overlays

export const AD_BLOCK_JS = `
(function() {
  const adSelectors = [
    'ins.adsbygoogle',
    'div[id^="google_ads_"]',
    'iframe[id^="google_ads_"]',
    'div[class*="ad-container"]',
    'div[class*="ad-banner"]',
    'div[class*="ad_banner"]',
    'div[id*="ad-slot"]',
    'div[id*="ad_slot"]',
    'div[class*="sponsored-post"]',
    'div[class*="taboola"]',
    'div[id*="outbrain"]',
    'div[class*="native-ad"]',
    'div[id*="advertisement"]',
    'div[class*="advertisement"]',
    'a[href*="doubleclick.net"]',
    'a[href*="adclick"]',
    '.ad-wrapper',
    '.adsbox',
    '.banner-ads'
  ];

  function removeAds() {
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
          }
        }
      });
    } catch(e) {}
  }

  // Run immediately and observe DOM mutations
  removeAds();
  setInterval(removeAds, 1500);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function() {
      removeAds();
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  // Neutralize window.open popups that are not user initiated
  var origOpen = window.open;
  window.open = function(url, target, features) {
    if (url && (url.includes('ad') || url.includes('pop') || url.includes('banner') || url.includes('click'))) {
      console.log('Blocked popup:', url);
      return null;
    }
    return origOpen.apply(this, arguments);
  };
})();
true;
`;

