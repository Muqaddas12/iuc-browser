package com.iuc.browser.web

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class UCWebEngineManager : SimpleViewManager<UCWebEngineView>() {

    companion object {
        const val REACT_CLASS = "UCWebEngineView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): UCWebEngineView {
        return UCWebEngineView(reactContext)
    }

    @ReactProp(name = "url")
    fun setUrl(view: UCWebEngineView, url: String?) {
        if (!url.isNullOrBlank()) {
            view.loadUrl(url)
        }
    }

    @ReactProp(name = "userAgent")
    fun setUserAgent(view: UCWebEngineView, userAgent: String?) {
        if (!userAgent.isNullOrBlank()) {
            view.settings.userAgentString = userAgent
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        val map = MapBuilder.builder<String, Any>()
        map.put("onEnginePageStarted", MapBuilder.of("registrationName", "onEnginePageStarted"))
        map.put("onEnginePageFinished", MapBuilder.of("registrationName", "onEnginePageFinished"))
        map.put("onEngineProgress", MapBuilder.of("registrationName", "onEngineProgress"))
        map.put("onEngineTitle", MapBuilder.of("registrationName", "onEngineTitle"))
        map.put("onEngineDownload", MapBuilder.of("registrationName", "onEngineDownload"))
        return map.build()
    }
}

