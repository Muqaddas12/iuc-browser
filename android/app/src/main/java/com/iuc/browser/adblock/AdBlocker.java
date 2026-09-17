package com.iuc.browser.adblock;

import android.webkit.WebResourceResponse;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import android.util.Log;
import java.io.ByteArrayInputStream;
import java.util.HashSet;
import java.util.HashMap;
import java.util.regex.Pattern;
import java.util.Arrays;

public class AdBlocker {
    public static boolean isEnabled = true;

    private static final HashSet<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        // Google Ads
        "googlesyndication.com", "googleadservices.com", "doubleclick.net", "adservice.google.com", "pagead2.googlesyndication.com", "tpc.googlesyndication.com", "partner.googleadservices.com", "google-analytics.com", "googletagservices.com", "googletagmanager.com",
        // Monetag / Vegamovies specific (CRITICAL)
        "cathaytrash.com", "hd.cathaytrash.com", "llvpn.com", "monetag.com", "trk.monetag.com", "a.monetag.com", "ad.monetag.com", "servicer.monetag.com", "brooadgate.com", "hontomoush.com", "nothingdo.com", "yepremium.com", "zarazagorus.com", "pushance.com", "pushails.com", "embedrise.com", "betterenov.com", "webpushsdk.com", "pushfund.com", "pusherism.com", "realsrv.com", "syndication.realsrv.com", "notifpush.com", "subscribtions.com", "pushcrew.com", "onesignal.com", "gravitec.net", "cleverpush.com", "cdn.onesignal.com",
        // Popunder / Popup networks
        "popads.net", "popcash.net", "propellerads.com", "propellerpops.com", "exoclick.com", "exosrv.com", "exdynsrv.com", "adcash.com", "adnxs.com", "trafficjunky.com", "juicyads.com", "clickadu.com", "adsterra.com", "adsterratools.com", "hilltopads.com", "richpush.co", "onclicktop.com", "onclickbright.com", "directrev.com", "ad-maven.com", "admaven.com", "galaksion.com", "evadav.com",
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
        "vcloud.fit", "fastdl.icu", "hubcloud.club", "hubcloud.lat", "hubcloud.one", "hubcloud.ink", "pixeldrain.com", "mediafire.com", "1fichier.com", "mega.nz", "gdtot.pro", "drivebuzz.org", "ayhal.com", "myvccs.com"
    ));

    private static final Pattern AD_PATTERN = Pattern.compile(
        ".*(adserver|adservice|adsystem|adtrack|adclick|popunder|popupad|banner\\.php|ad\\.js|ads\\.js|/ad/|/ads/|/banners/|clicktrack|redirect_ad|ad_slot|ad_unit|interstitial|overlay-ad|tag\\.min\\.js|data-zone|cathaytrash|llvpn|pagead|show_ads|pixel|beacon|tracking).*",
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

            // Check whitelist first
            for (String whitelisted : WHITELIST) {
                if (host.equals(whitelisted) || host.endsWith("." + whitelisted)) {
                    Log.d("IUC_ADBLOCK", "⚪ [AdBlocker Whitelist Allowed] Host: " + host + " | URL: " + url);
                    return false;
                }
            }

            // Check domain blocklist
            for (String domain : AD_DOMAINS) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    Log.i("IUC_ADBLOCK", "🛑 [AdBlocker Native Block] Blocked Ad Domain: " + host + " (rule: " + domain + ") | Full URL: " + url);
                    return true;
                }
            }

            // Check ad regex pattern
            if (AD_PATTERN.matcher(url).matches()) {
                Log.i("IUC_ADBLOCK", "🛑 [AdBlocker Native Block] Blocked Ad Pattern Match | Full URL: " + url);
                return true;
            }

        } catch (Exception e) {
            // Ignore parse exceptions
        }

        return false;
    }

    public static WebResourceResponse createEmptyResponse() {
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            200,
            "OK",
            headers,
            new ByteArrayInputStream(new byte[0])
        );
    }
}
