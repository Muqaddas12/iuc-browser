package com.iuc.browser.web

import android.content.Context
import android.util.Log
import org.mozilla.geckoview.ContentBlocking
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.StorageController

object GeckoRuntimeManager {
    private const val TAG = "GeckoRuntimeManager"
    private var runtime: GeckoRuntime? = null

    @Synchronized
    fun get(context: Context): GeckoRuntime {
        if (runtime == null) {
            val contentBlocking = ContentBlocking.Settings.Builder()
                .enhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.STRICT)
                .antiTracking(ContentBlocking.AntiTracking.STRICT)
                .cookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_FIRST_PARTY_AND_ISOLATE_OTHERS)
                .cookieBannerHandlingMode(ContentBlocking.CookieBannerMode.COOKIE_BANNER_MODE_REJECT_OR_ACCEPT)
                .cookieBannerGlobalRulesEnabled(true)
                .cookieBannerGlobalRulesSubFramesEnabled(true)
                .emailTrackerBlockingPrivateMode(true)
                .queryParameterStrippingEnabled(true)
                .strictSocialTrackingProtection(true)
                .cookiePurging(true)
                .build()

            val settings = GeckoRuntimeSettings.Builder()
                .consoleOutput(true)
                .javaScriptEnabled(true)
                .aboutConfigEnabled(true)
                .contentBlocking(contentBlocking)
                .loginAutofillEnabled(true)
                .globalPrivacyControlEnabled(true)
                .extensionsWebAPIEnabled(true)
                .extensionsProcessEnabled(true)
                .trustedRecursiveResolverMode(GeckoRuntimeSettings.TRR_MODE_FIRST)
                .trustedRecursiveResolverUri("https://cloudflare-dns.com/dns-query")
                .build()
            val rt = GeckoRuntime.create(context.applicationContext, settings)
            runtime = rt

            try {
                rt.webExtensionController.ensureBuiltIn(
                    "resource://android/assets/extensions/adblock/",
                    "adblock@iuc.browser"
                )
                Log.i(TAG, "IUC Shield WebExtension registered successfully")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to register built-in WebExtension", e)
            }
        }
        return runtime!!
    }

    fun clearAllBrowserData(context: Context, onComplete: (() -> Unit)? = null) {
        try {
            val rt = get(context)
            rt.storageController.clearData(StorageController.ClearFlags.ALL).then(
                {
                    Log.i(TAG, "GeckoView storage cleared successfully")
                    onComplete?.invoke()
                    GeckoResult.fromValue(null)
                },
                {
                    Log.w(TAG, "GeckoView storage clear encountered error: $it")
                    onComplete?.invoke()
                    GeckoResult.fromValue(null)
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error invoking clearData", e)
            onComplete?.invoke()
        }
    }
}

