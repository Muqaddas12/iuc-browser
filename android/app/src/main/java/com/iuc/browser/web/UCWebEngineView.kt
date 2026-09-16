package com.iuc.browser.web

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.net.http.SslError
import android.os.Build
import android.view.View
import android.webkit.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

@SuppressLint("SetJavaScriptEnabled", "ViewConstructor")
class UCWebEngineView(context: Context) : WebView(context) {

    init {
        setupWebSettings()
        setupClients()
    }

    private fun setupWebSettings() {
        val s = settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.setSupportZoom(true)
        s.builtInZoomControls = true
        s.displayZoomControls = false
        s.loadWithOverviewMode = true
        s.useWideViewPort = true
        s.allowFileAccess = true
        s.allowContentAccess = true
        s.mediaPlaybackRequiresUserGesture = false
        s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        s.cacheMode = WebSettings.LOAD_DEFAULT

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.safeBrowsingEnabled = false
        }

        setLayerType(View.LAYER_TYPE_HARDWARE, null)

        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(this, true)
    }

    private fun setupClients() {
        webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                emitEvent("onEnginePageStarted", Arguments.createMap().apply {
                    putString("url", url ?: "")
                })
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                emitEvent("onEnginePageFinished", Arguments.createMap().apply {
                    putString("url", url ?: "")
                    putString("title", title ?: url ?: "")
                })
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                // Allow secure traversal without premature termination
                handler?.proceed()
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url?.toString() ?: return false
                if (uri.startsWith("market://")) {
                    val pkg = uri.substringAfter("id=", "")
                    if (pkg.isNotEmpty()) {
                        view?.loadUrl("https://play.google.com/store/apps/details?id=$pkg")
                        return true
                    }
                }
                return false
            }
        }

        webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                emitEvent("onEngineProgress", Arguments.createMap().apply {
                    putInt("progress", newProgress)
                })
            }

            override fun onReceivedTitle(view: WebView?, pageTitle: String?) {
                super.onReceivedTitle(view, pageTitle)
                emitEvent("onEngineTitle", Arguments.createMap().apply {
                    putString("title", pageTitle ?: "")
                })
            }
        }

        setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
            emitEvent("onEngineDownload", Arguments.createMap().apply {
                putString("url", url)
                putString("userAgent", userAgent)
                putString("contentDisposition", contentDisposition)
                putString("mimetype", mimetype)
                putDouble("contentLength", contentLength.toDouble())
            })
        }
    }

    private fun emitEvent(eventName: String, params: com.facebook.react.bridge.WritableMap) {
        val reactContext = context as? ReactContext ?: return
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, eventName, params)
    }
}

