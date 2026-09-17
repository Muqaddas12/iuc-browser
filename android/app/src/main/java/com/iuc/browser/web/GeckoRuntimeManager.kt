package com.iuc.browser.web

import android.content.Context
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings

object GeckoRuntimeManager {
    private var runtime: GeckoRuntime? = null

    @Synchronized
    fun get(context: Context): GeckoRuntime {
        if (runtime == null) {
            val settings = GeckoRuntimeSettings.Builder()
                .consoleOutput(true)
                .javaScriptEnabled(true)
                .aboutConfigEnabled(true)
                .build()
            runtime = GeckoRuntime.create(context.applicationContext, settings)
        }
        return runtime!!
    }
}

