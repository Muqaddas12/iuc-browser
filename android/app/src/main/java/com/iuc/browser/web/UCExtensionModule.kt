package com.iuc.browser.web

import android.util.Log
import com.facebook.react.bridge.*
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.WebExtension
import org.mozilla.geckoview.WebExtensionController

class UCExtensionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "UCExtensionModule"
        private const val TAG = "UCExtensionModule"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun listExtensions(promise: Promise) {
        try {
            val rt = GeckoRuntimeManager.get(reactContext)
            rt.webExtensionController.list().then({ extensions ->
                val list = Arguments.createArray()
                extensions?.forEach { ext ->
                    val map = Arguments.createMap().apply {
                        putString("id", ext.id)
                        putString("name", ext.metaData.name ?: ext.id)
                        putString("description", ext.metaData.description ?: "")
                        putString("version", ext.metaData.version ?: "1.0.0")
                        putBoolean("enabled", ext.metaData.enabled)
                        putBoolean("isBuiltIn", ext.isBuiltIn)
                    }
                    list.pushMap(map)
                }
                promise.resolve(list)
                GeckoResult.fromValue(null)
            }, { error ->
                promise.reject("LIST_ERROR", error?.message ?: "Failed to list extensions")
                GeckoResult.fromValue(null)
            })
        } catch (e: Exception) {
            promise.reject("LIST_EXCEPTION", e.message, e)
        }
    }

    @ReactMethod
    fun installExtension(uri: String, promise: Promise) {
        try {
            val rt = GeckoRuntimeManager.get(reactContext)
            rt.webExtensionController.install(uri).then({ ext ->
                val map = Arguments.createMap().apply {
                    putString("id", ext?.id)
                    putString("name", ext?.metaData?.name ?: ext?.id)
                    putString("description", ext?.metaData?.description ?: "")
                    putString("version", ext?.metaData?.version ?: "1.0.0")
                    putBoolean("enabled", true)
                }
                promise.resolve(map)
                GeckoResult.fromValue(null)
            }, { error ->
                promise.reject("INSTALL_ERROR", error?.message ?: "Failed to install extension")
                GeckoResult.fromValue(null)
            })
        } catch (e: Exception) {
            promise.reject("INSTALL_EXCEPTION", e.message, e)
        }
    }

    @ReactMethod
    fun uninstallExtension(extensionId: String, promise: Promise) {
        try {
            val rt = GeckoRuntimeManager.get(reactContext)
            rt.webExtensionController.list().then({ extensions ->
                val target = extensions?.find { it.id == extensionId }
                if (target != null) {
                    rt.webExtensionController.uninstall(target).then({
                        promise.resolve(true)
                        GeckoResult.fromValue(null)
                    }, { error ->
                        promise.reject("UNINSTALL_ERROR", error?.message ?: "Failed to uninstall")
                        GeckoResult.fromValue(null)
                    })
                } else {
                    promise.reject("NOT_FOUND", "Extension not found: $extensionId")
                }
                GeckoResult.fromValue(null)
            }, { error ->
                promise.reject("LIST_ERROR", error?.message)
                GeckoResult.fromValue(null)
            })
        } catch (e: Exception) {
            promise.reject("UNINSTALL_EXCEPTION", e.message, e)
        }
    }

    @ReactMethod
    fun toggleExtension(extensionId: String, enable: Boolean, promise: Promise) {
        try {
            val rt = GeckoRuntimeManager.get(reactContext)
            rt.webExtensionController.list().then({ extensions ->
                val target = extensions?.find { it.id == extensionId }
                if (target != null) {
                    val result = if (enable) {
                        rt.webExtensionController.enable(target, WebExtensionController.EnableSource.USER)
                    } else {
                        rt.webExtensionController.disable(target, WebExtensionController.EnableSource.USER)
                    }
                    result.then({
                        promise.resolve(true)
                        GeckoResult.fromValue(null)
                    }, { error ->
                        promise.reject("TOGGLE_ERROR", error?.message)
                        GeckoResult.fromValue(null)
                    })
                } else {
                    promise.reject("NOT_FOUND", "Extension not found: $extensionId")
                }
                GeckoResult.fromValue(null)
            }, { error ->
                promise.reject("LIST_ERROR", error?.message)
                GeckoResult.fromValue(null)
            })
        } catch (e: Exception) {
            promise.reject("TOGGLE_EXCEPTION", e.message, e)
        }
    }

    @ReactMethod
    fun clearBrowserData(promise: Promise) {
        try {
            GeckoRuntimeManager.clearAllBrowserData(reactContext) {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("CLEAR_EXCEPTION", e.message, e)
        }
    }
}

