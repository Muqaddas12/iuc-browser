package com.iuc.browser.web

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class UCWebEngineManager : SimpleViewManager<UCWebEngineView>() {

    companion object {
        const val REACT_CLASS = "UCWebEngineView"

        const val COMMAND_GO_BACK = 1
        const val COMMAND_GO_FORWARD = 2
        const val COMMAND_RELOAD = 3
        const val COMMAND_STOP = 4
        const val COMMAND_EVALUATE_JS = 5
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): UCWebEngineView {
        return UCWebEngineView(reactContext)
    }

    override fun onDropViewInstance(view: UCWebEngineView) {
        super.onDropViewInstance(view)
        view.onDestroy()
    }

    @ReactProp(name = "url")
    fun setUrl(view: UCWebEngineView, url: String?) {
        if (!url.isNullOrBlank()) {
            view.loadUrl(url)
        }
    }

    @ReactProp(name = "desktopMode")
    fun setDesktopMode(view: UCWebEngineView, enabled: Boolean) {
        view.setDesktopMode(enabled)
    }

    @ReactProp(name = "trackingProtection", defaultBoolean = true)
    fun setTrackingProtection(view: UCWebEngineView, enabled: Boolean) {
        view.setTrackingProtection(enabled)
    }

    @ReactProp(name = "injectedJavaScript")
    fun setInjectedJavaScript(view: UCWebEngineView, script: String?) {
        view.setInjectedJavaScript(script)
    }

    override fun getCommandsMap(): MutableMap<String, Int> {
        return mutableMapOf(
            "goBack" to COMMAND_GO_BACK,
            "goForward" to COMMAND_GO_FORWARD,
            "reload" to COMMAND_RELOAD,
            "stopLoading" to COMMAND_STOP,
            "evaluateJavascript" to COMMAND_EVALUATE_JS
        )
    }

    override fun receiveCommand(root: UCWebEngineView, commandId: String?, args: ReadableArray?) {
        when (commandId) {
            "goBack" -> root.goBack()
            "goForward" -> root.goForward()
            "reload" -> root.reload()
            "stopLoading" -> root.stopLoading()
            "evaluateJavascript" -> {
                val script = args?.getString(0) ?: ""
                root.evaluateJavascript(script)
            }
            else -> super.receiveCommand(root, commandId, args)
        }
    }

    override fun receiveCommand(root: UCWebEngineView, commandId: Int, args: ReadableArray?) {
        when (commandId) {
            COMMAND_GO_BACK -> root.goBack()
            COMMAND_GO_FORWARD -> root.goForward()
            COMMAND_RELOAD -> root.reload()
            COMMAND_STOP -> root.stopLoading()
            COMMAND_EVALUATE_JS -> {
                val script = args?.getString(0) ?: ""
                root.evaluateJavascript(script)
            }
            else -> super.receiveCommand(root, commandId, args)
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        val map = MapBuilder.builder<String, Any>()
        map.put("onEnginePageStarted", MapBuilder.of("registrationName", "onEnginePageStarted"))
        map.put("onEnginePageFinished", MapBuilder.of("registrationName", "onEnginePageFinished"))
        map.put("onEngineProgress", MapBuilder.of("registrationName", "onEngineProgress"))
        map.put("onEngineTitle", MapBuilder.of("registrationName", "onEngineTitle"))
        map.put("onAdBlocked", MapBuilder.of("registrationName", "onAdBlocked"))
        map.put("onNewWindow", MapBuilder.of("registrationName", "onNewWindow"))
        map.put("onDownloadRequested", MapBuilder.of("registrationName", "onDownloadRequested"))
        return map.build()
    }
}
