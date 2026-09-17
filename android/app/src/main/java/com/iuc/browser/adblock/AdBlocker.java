package com.iuc.browser.adblock;

import android.webkit.WebResourceResponse;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import android.util.Log;
import java.io.ByteArrayInputStream;
import java.util.HashSet;
import java.util.Arrays;
import java.util.regex.Pattern;

public class AdBlocker {
    public static boolean isEnabled = true;

    private static final HashSet<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "googlesyndication.com", "googleadservices.com", "doubleclick.net", "adservice.google.com", "pagead2.googlesyndication.com", "tpc.googlesyndication.com", "partner.googleadservices.com", "google-analytics.com", "googletagservices.com", "googletagmanager.com",
        // Monetag / Vegamovies specific (CRITICAL)
        "cathaytrash.com", "hd.cathaytrash.com", "llvpn.com", "monetag.com", "trk.monetag.com", "a.monetag.com", "ad.monetag.com", "servicer.monetag.com", "brooadgate.com", "hontomoush.com", "nothingdo.com", "yepremium.com", "zarazagorus.com", "pushance.com", "pushails.com", "embedrise.com", "betterenov.com", "webpushsdk.com", "pushfund.com", "pusherism.com", "realsrv.com", "syndication.realsrv.com", "notifpush.com", "subscribtions.com", "pushcrew.com", "onesignal.com", "gravitec.net", "cleverpush.com", "cdn.onesignal.com",
        // Popunder / Popup networks
        "popads.net", "popcash.net", "propellerads.com", "propellerpops.com", "exoclick.com", "exosrv.com", "exdynsrv.com", "adcash.com", "adnxs.com", "trafficjunky.com", "juicyads.com", "clickadu.com", "adsterra.com", "adsterratools.com", "hilltopads.com", "richpush.co", "onclicktop.com", "onclickbright.com", "directrev.com", "ad-maven.com", "admaven.com", "galaksion.com", "evadav.com", "worncalmy.cfd", "linkupwongara.cfd", "rajaaffiliates.com",
        // Content recommendation
        "taboola.com", "outbrain.com", "revcontent.com", "mgid.com", "adblade.com", "content.ad", "marketgid.com",
        // Tracking / DSP
        "criteo.com", "criteo.net", "adroll.com", "smartadserver.com", "rubiconproject.com", "openx.net", "pubmatic.com", "casalemedia.com", "bidswitch.net", "sovrn.com", "indexexchange.com", "teads.tv", "quantserve.com", "scorecardresearch.com", "adform.net", "serving-sys.com", "moatads.com", "advertising.com", "amazon-adsystem.com", "media.net",
        // Facebook
        "an.facebook.com", "pixel.facebook.com",
        // Mobile ad networks
        "adcolony.com", "inmobi.com", "vungle.com", "unityads.unity3d.com", "ironsrc.com", "applovin.com", "chartboost.com", "tapjoy.com", "flurry.com", "mopub.com", "startapp.com",
        // Analytics / fingerprinting
        "hotjar.com", "mouseflow.com", "fullstory.com", "mixpanel.com", "amplitude.com", "segment.io", "optimizely.com", "demdex.net", "bluekai.com", "krxd.net", "addthis.com",
        // Link shorteners (piracy sites)
        "adf.ly", "shorte.st", "bc.vc", "ouo.io", "linkvertise.com", "shrinkme.io",
        // Misc ad networks  
        "bidvertiser.com", "infolinks.com", "revenuehits.com", "trafficstars.com", "plugrush.com", "zergnet.com", "cpmstar.com"
    ));

    private static final HashSet<String> WHITELIST = new HashSet<>(Arrays.asList(
        "google.com", "youtube.com", "youtu.be", "googlevideo.com", "wikipedia.org", "github.com", "play.google.com", "duckduckgo.com", "brave.com",
        "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com", "cloudflare.com",
        "vcloud.fit", "nexdrive.fit", "fastdl.icu", "hubcloud.club", "hubcloud.lat", "hubcloud.one", "hubcloud.ink",
        "pixeldrain.com", "mediafire.com", "1fichier.com", "mega.nz", "gdtot.pro", "drivebuzz.org", "ayhal.com", "myvccs.com",
        "r2.dev"
    ));

    // Popunder / Spam TLDs heavily used on piracy download redirects
    private static final HashSet<String> AD_TLDS = new HashSet<>(Arrays.asList(
        "cfd", "click", "buzz", "rest", "monster", "sbs", "skin", "cam", "top"
    ));

    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(adserver|adservice|adsystem|adtrack|adclick|popunder|popupad|banner\\.php|ad\\.js|ads\\.js|/ad/|/ads/|/banners/|clicktrack|redirect_ad|ad_slot|ad_unit|interstitial|overlay-ad|tag\\.min\\.js|data-zone|cathaytrash|llvpn|pagead|show_ads|pixel|beacon|tracking|tabup|scontext_r|affid=|affExtParam|s2s\\.req_id|rajaaffiliates|affiliate).*",
        Pattern.CASE_INSENSITIVE
    );

    public static boolean isAdUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }

        if (url.startsWith("file://") || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("javascript:")) {
            return false;
        }

        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) {
                return false;
            }

            host = host.toLowerCase();

            // 1. Check Whitelist first
            for (String whitelisted : WHITELIST) {
                if (host.equals(whitelisted) || host.endsWith("." + whitelisted)) {
                    // Check if legitimate domain is being hijacked with affiliate clickjack
                    if ((host.contains("flipkart") || host.contains("amazon")) &&
                        (url.contains("affid=") || url.contains("affExtParam") || url.contains("cmpid="))) {
                        Log.i("IUC_ADBLOCK", "🛑 [AdBlocker MATCH] E-commerce Affiliate Hijack: " + url);
                        return true;
                    }
                    Log.d("IUC_ADBLOCK", "⚪ [AdBlocker Whitelist Allowed] Host: " + host + " | URL: " + url);
                    return false;
                }
            }

            // 2. Check domain blocklist
            for (String domain : AD_DOMAINS) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    Log.i("IUC_ADBLOCK", "🛑 [AdBlocker MATCH] Blocked Ad Domain: " + host + " (rule: " + domain + ") | Full URL: " + url);
                    return true;
                }
            }

            // 3. Check Popunder / Spam TLDs (.cfd, .click, .buzz, etc.)
            int dotIndex = host.lastIndexOf('.');
            if (dotIndex != -1 && dotIndex < host.length() - 1) {
                String tld = host.substring(dotIndex + 1);
                if (AD_TLDS.contains(tld)) {
                    Log.i("IUC_ADBLOCK", "🛑 [AdBlocker MATCH] Popunder TLD (." + tld + "): " + url);
                    return true;
                }
            }

            // 4. Check affiliate / gambling keywords in host
            if (host.contains("affiliate") || host.contains("rajaaffiliates") || host.contains("betway") || host.contains("1xbet") || host.contains("parimatch") || host.contains("casin")) {
                Log.i("IUC_ADBLOCK", "🛑 [AdBlocker MATCH] Affiliate/Gambling Host: " + url);
                return true;
            }

            // 5. Check URL regex pattern (catches tabup, scontext_r, tracking queries)
            if (AD_PATTERN.matcher(url).matches()) {
                Log.i("IUC_ADBLOCK", "🛑 [AdBlocker REGEX MATCH] Full URL: " + url);
                return true;
            }
        } catch (Exception e) {
            // ignore
        }

        return false;
    }

    public static WebResourceResponse createEmptyResponse() {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            200,
            "OK",
            new java.util.HashMap<String, String>(),
            new ByteArrayInputStream(new byte[0])
        );
    }
}
