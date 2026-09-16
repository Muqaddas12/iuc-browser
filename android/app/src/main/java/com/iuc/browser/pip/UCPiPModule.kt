package com.iuc.browser.pip

import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UCPiPModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UCPiPModule"

    @ReactMethod
    fun enterPictureInPicture(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Current activity is null")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                val aspectRatio = Rational(16, 9)
                val params = PictureInPictureParams.Builder()
                    .setAspectRatio(aspectRatio)
                    .build()
                val entered = activity.enterPictureInPictureMode(params)
                promise.resolve(entered)
            } catch (e: Exception) {
                promise.reject("PIP_ERROR", e.message, e)
            }
        } else {
            promise.reject("PIP_UNSUPPORTED", "PiP requires Android 8.0 (API 26) or higher")
        }
    }

    @ReactMethod
    fun isPiPSupported(promise: Promise) {
        promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
    }
}

