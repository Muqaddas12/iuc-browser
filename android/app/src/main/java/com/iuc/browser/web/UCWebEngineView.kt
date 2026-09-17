package com.iuc.browser.web

import android.annotation.SuppressLint
import android.content.Context
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.iuc.browser.adblock.AdBlocker
import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoSessionSettings
import org.mozilla.geckoview.GeckoView

@SuppressLint("ViewConstructor")
class UCWebEngineView(context: Context) : FrameLayout(context) {

    private val geckoView: GeckoView = GeckoView(context)
    private val session: GeckoSession = GeckoSession()

    private var currentUrl: String = ""
    private var currentTitle: String = ""
    private var canGoBack: Boolean = false
    private var canGoForward: Boolean = false

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
        // Navigation Delegate
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
                    return GeckoResult.deny()
                }
                return GeckoResult.allow()
            }

            override fun onNewSession(session: GeckoSession, uri: String): GeckoResult<GeckoSession>? {
                if (uri.isNotBlank()) {
                    loadUrl(uri)
                }
                return GeckoResult.fromValue(null)
            }
        }

        // Progress Delegate
        session.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onPageStart(session: GeckoSession, url: String) {
                currentUrl = url
                val event = Arguments.createMap().apply {
                    putString("url", url)
                }
                emitEvent("onEnginePageStarted", event)
            }

            override fun onPageStop(session: GeckoSession, success: Boolean) {
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

        // Content Delegate
        session.contentDelegate = object : GeckoSession.ContentDelegate {
            override fun onTitleChange(session: GeckoSession, title: String?) {
                currentTitle = title ?: ""
                val event = Arguments.createMap().apply {
                    putString("title", currentTitle)
                    putString("url", currentUrl)
                }
                emitEvent("onEngineTitle", event)
            }
        }
    }

    fun loadUrl(url: String) {
        if (url.isNotBlank() && url != currentUrl) {
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
