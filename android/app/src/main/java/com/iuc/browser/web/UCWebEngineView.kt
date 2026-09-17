package com.iuc.browser.web

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.iuc.browser.adblock.AdBlocker
import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.ContentBlocking
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoSessionSettings
import org.mozilla.geckoview.GeckoView
import org.mozilla.geckoview.WebResponse

@SuppressLint("ViewConstructor")
class UCWebEngineView(context: Context) : FrameLayout(context) {

    companion object {
        private const val TAG = "IUC_ADBLOCK"
    }

    private val geckoView: GeckoView = GeckoView(context)
    private val session: GeckoSession = GeckoSession()

    private var currentUrl: String = ""
    private var currentTitle: String = ""
    private var canGoBack: Boolean = false
    private var canGoForward: Boolean = false
    private var injectedJavaScript: String = ""

    init {
        val params = LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        addView(geckoView, params)

        // Configure Session Settings
        session.settings.useTrackingProtection = true
        session.settings.viewportMode = GeckoSessionSettings.VIEWPORT_MODE_MOBILE

        setupDelegates()

        // Attach Session to Runtime and View
        val runtime = GeckoRuntimeManager.get(context)
        session.open(runtime)
        geckoView.setSession(session)
    }

    private fun setupDelegates() {
        // 1. Navigation Delegate
        session.navigationDelegate = object : GeckoSession.NavigationDelegate {
            override fun onCanGoBack(session: GeckoSession, canGoBackValue: Boolean) {
                canGoBack = canGoBackValue
            }

            override fun onCanGoForward(session: GeckoSession, canGoForwardValue: Boolean) {
                canGoForward = canGoForwardValue
            }

            override fun onLoadRequest(
                session: GeckoSession,
                request: GeckoSession.NavigationDelegate.LoadRequest
            ): GeckoResult<AllowOrDeny>? {
                val targetUrl = request.uri
                if (AdBlocker.isEnabled && AdBlocker.isAdUrl(targetUrl)) {
                    Log.i(TAG, "🛑 [NavigationDelegate BLOCKED] Ad URL: $targetUrl")
                    val event = Arguments.createMap().apply {
                        putString("url", targetUrl)
                        putString("reason", "Network Domain Intercept")
                        putString("source", "NavigationDelegate")
                    }
                    emitEvent("onAdBlocked", event)
                    return GeckoResult.deny()
                }

                // If link requested to open in a new window, route to a new tab in React Native
                if (request.target == GeckoSession.NavigationDelegate.TARGET_WINDOW_NEW) {
                    Log.i(TAG, "🪟 [Target Window New - Emitting onNewWindow]: $targetUrl")
                    val event = Arguments.createMap().apply {
                        putString("url", targetUrl)
                    }
                    emitEvent("onNewWindow", event)
                    return GeckoResult.deny()
                }

                Log.d(TAG, "🌐 [NavigationDelegate ALLOW] URL: $targetUrl")
                return GeckoResult.allow()
            }

            override fun onNewSession(session: GeckoSession, uri: String): GeckoResult<GeckoSession>? {
                Log.i(TAG, "🔀 [onNewSession received]: $uri")
                if (uri.isBlank() || uri == "about:blank" || uri == "about:srcdoc") {
                    return GeckoResult.fromValue(null)
                }

                if (AdBlocker.isEnabled && AdBlocker.isAdUrl(uri)) {
                    Log.i(TAG, "🛑 [New Window BLOCKED] Ad URL: $uri")
                    val event = Arguments.createMap().apply {
                        putString("url", uri)
                        putString("reason", "Popup Ad Blocked")
                        putString("source", "onNewSession")
                    }
                    emitEvent("onAdBlocked", event)
                    return GeckoResult.fromValue(null)
                }

                Log.i(TAG, "🪟 [New Window / Redirect - Emitting onNewWindow]: $uri")
                val event = Arguments.createMap().apply {
                    putString("url", uri)
                }
                emitEvent("onNewWindow", event)
                return GeckoResult.fromValue(null)
            }
        }

        // 2. Native GeckoView Content Blocking Delegate
        session.contentBlockingDelegate = object : ContentBlocking.Delegate {
            override fun onContentBlocked(session: GeckoSession, event: ContentBlocking.BlockEvent) {
                val blockedUri = event.uri
                Log.i(TAG, "🛡️ [Gecko ContentBlocking BLOCKED] URL: $blockedUri")
                val map = Arguments.createMap().apply {
                    putString("url", blockedUri)
                    putString("reason", "Gecko Tracking Protection")
                    putString("source", "ContentBlocking")
                }
                emitEvent("onAdBlocked", map)
            }
        }

        // 3. Progress Delegate
        session.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onPageStart(session: GeckoSession, url: String) {
                if (url == "about:blank" && currentUrl.isNotBlank() && currentUrl != "about:blank") {
                    return
                }
                currentUrl = url
                Log.i(TAG, "🚀 [Page Started Loading] URL: $url")
                val event = Arguments.createMap().apply {
                    putString("url", url)
                }
                emitEvent("onEnginePageStarted", event)
            }

            override fun onPageStop(session: GeckoSession, success: Boolean) {
                if (currentUrl == "about:blank") return
                Log.i(TAG, "🏁 [Page Finished Loading] URL: $currentUrl (Success: $success)")
                val event = Arguments.createMap().apply {
                    putString("url", currentUrl)
                    putString("title", currentTitle)
                    putBoolean("canGoBack", canGoBack)
                    putBoolean("canGoForward", canGoForward)
                }
                emitEvent("onEnginePageFinished", event)
            }

            override fun onProgressChange(session: GeckoSession, progress: Int) {
                val event = Arguments.createMap().apply {
                    putDouble("progress", progress / 100.0)
                }
                emitEvent("onEngineProgress", event)
            }
        }

        // 4. Content Delegate (Title and External Download Capture)
        session.contentDelegate = object : GeckoSession.ContentDelegate {
            override fun onTitleChange(session: GeckoSession, title: String?) {
                currentTitle = title ?: ""
                val event = Arguments.createMap().apply {
                    putString("title", currentTitle)
                    putString("url", currentUrl)
                }
                emitEvent("onEngineTitle", event)
            }

            override fun onExternalResponse(session: GeckoSession, response: WebResponse) {
                val downloadUrl = response.uri
                Log.i(TAG, "📥 [Gecko ContentDelegate External Download]: $downloadUrl")
                val event = Arguments.createMap().apply {
                    putString("url", downloadUrl)
                }
                emitEvent("onDownloadRequested", event)
            }
        }
    }

    fun loadUrl(url: String) {
        if (url.isNotBlank() && url != currentUrl) {
            Log.i(TAG, "🧭 [Loading URL]: $url")
            currentUrl = url
            session.loadUri(url)
        }
    }

    fun goBack() {
        session.goBack()
    }

    fun goForward() {
        session.goForward()
    }

    fun reload() {
        session.reload()
    }

    fun stopLoading() {
        session.stop()
    }

    fun setInjectedJavaScript(script: String?) {
        this.injectedJavaScript = script ?: ""
    }

    fun evaluateJavascript(script: String) {
        if (script.isBlank()) return
        post {
            try {
                session.load(
                    GeckoSession.Loader()
                        .uri("javascript:(function(){" + script + "})();")
                        .flags(GeckoSession.LOAD_FLAGS_BYPASS_LOAD_URI_DELEGATE)
                )
            } catch (e: Exception) {
                Log.w(TAG, "evaluateJavascript error", e)
            }
        }
    }

    fun setDesktopMode(enabled: Boolean) {
        session.settings.userAgentMode = if (enabled) {
            GeckoSessionSettings.USER_AGENT_MODE_DESKTOP
        } else {
            GeckoSessionSettings.USER_AGENT_MODE_MOBILE
        }
        session.settings.viewportMode = if (enabled) {
            GeckoSessionSettings.VIEWPORT_MODE_DESKTOP
        } else {
            GeckoSessionSettings.VIEWPORT_MODE_MOBILE
        }
    }

    fun setTrackingProtection(enabled: Boolean) {
        session.settings.useTrackingProtection = enabled
    }

    private fun emitEvent(eventName: String, eventData: com.facebook.react.bridge.WritableMap) {
        val reactContext = context as? ReactContext ?: return
        reactContext.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(id, eventName, eventData)
    }

    fun onDestroy() {
        session.close()
        geckoView.releaseSession()
    }
}
