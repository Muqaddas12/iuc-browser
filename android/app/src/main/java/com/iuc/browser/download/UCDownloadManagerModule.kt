package com.iuc.browser.download

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class UCDownloadManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "UCDownloadManager"
        private const val TAG = "UCDownloadManager"
    }

    override fun getName(): String = NAME

    private val downloadManager: DownloadManager by lazy {
        reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    }

    @ReactMethod
    fun startDownload(
        url: String,
        fileName: String?,
        mimeType: String?,
        userAgent: String?,
        promise: Promise
    ) {
        try {
            if (url.isBlank()) {
                promise.reject("INVALID_URL", "Download URL cannot be empty")
                return
            }

            val uri = Uri.parse(url)
            val cleanFileName = sanitizeFileName(fileName ?: uri.lastPathSegment ?: "download_${System.currentTimeMillis()}")

            val request = DownloadManager.Request(uri).apply {
                setTitle(cleanFileName)
                setDescription("Downloading with IUC Browser...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, cleanFileName)
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
                if (!mimeType.isNullOrBlank()) {
                    setMimeType(mimeType)
                }
                if (!userAgent.isNullOrBlank()) {
                    addRequestHeader("User-Agent", userAgent)
                }
            }

            val downloadId = downloadManager.enqueue(request)
            Log.i(TAG, "📥 Download enqueued: ID=$downloadId, File=$cleanFileName, URL=$url")

            val result = Arguments.createMap().apply {
                putDouble("downloadId", downloadId.toDouble())
                putString("fileName", cleanFileName)
                putString("status", "started")
            }
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start download", e)
            promise.reject("DOWNLOAD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDownloads(promise: Promise) {
        try {
            val query = DownloadManager.Query()
            val cursor: Cursor? = downloadManager.query(query)
            val list = Arguments.createArray()

            cursor?.use {
                val idCol = it.getColumnIndex(DownloadManager.COLUMN_ID)
                val titleCol = it.getColumnIndex(DownloadManager.COLUMN_TITLE)
                val uriCol = it.getColumnIndex(DownloadManager.COLUMN_URI)
                val mediaCol = it.getColumnIndex(DownloadManager.COLUMN_MEDIA_TYPE)
                val totalCol = it.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
                val downloadedCol = it.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
                val statusCol = it.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val reasonCol = it.getColumnIndex(DownloadManager.COLUMN_REASON)
                val localUriCol = it.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)

                while (it.moveToNext()) {
                    val map = Arguments.createMap()
                    val id = if (idCol >= 0) it.getLong(idCol) else -1L
                    val title = if (titleCol >= 0) it.getString(titleCol) ?: "" else ""
                    val fileUri = if (uriCol >= 0) it.getString(uriCol) ?: "" else ""
                    val mediaType = if (mediaCol >= 0) it.getString(mediaCol) ?: "" else ""
                    val totalBytes = if (totalCol >= 0) it.getLong(totalCol) else 0L
                    val downloadedBytes = if (downloadedCol >= 0) it.getLong(downloadedCol) else 0L
                    val statusCode = if (statusCol >= 0) it.getInt(statusCol) else 0
                    val reason = if (reasonCol >= 0) it.getInt(reasonCol) else 0
                    val localUri = if (localUriCol >= 0) it.getString(localUriCol) ?: "" else ""

                    val statusStr = when (statusCode) {
                        DownloadManager.STATUS_PENDING -> "pending"
                        DownloadManager.STATUS_RUNNING -> "running"
                        DownloadManager.STATUS_PAUSED -> "paused"
                        DownloadManager.STATUS_SUCCESSFUL -> "successful"
                        DownloadManager.STATUS_FAILED -> "failed"
                        else -> "unknown"
                    }

                    map.putDouble("id", id.toDouble())
                    putStringOrEmpty(map, "title", title)
                    putStringOrEmpty(map, "uri", fileUri)
                    putStringOrEmpty(map, "mediaType", mediaType)
                    map.putDouble("totalBytes", totalBytes.toDouble())
                    map.putDouble("downloadedBytes", downloadedBytes.toDouble())
                    map.putString("status", statusStr)
                    map.putInt("reason", reason)
                    putStringOrEmpty(map, "localUri", localUri)

                    list.pushMap(map)
                }
            }

            promise.resolve(list)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching downloads", e)
            promise.reject("FETCH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun cancelDownload(downloadId: Double, promise: Promise) {
        try {
            val removed = downloadManager.remove(downloadId.toLong())
            promise.resolve(removed > 0)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openDownloadedFile(downloadId: Double, promise: Promise) {
        try {
            val uri = downloadManager.getUriForDownloadedFile(downloadId.toLong())
            val mimeType = downloadManager.getMimeTypeForDownloadedFile(downloadId.toLong())

            if (uri == null) {
                promise.reject("FILE_NOT_FOUND", "Downloaded file URI not available")
                return
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType ?: "*/*")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openDownloadsFolder(promise: Promise) {
        try {
            val intent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_FOLDER_ERROR", e.message, e)
        }
    }

    private fun sanitizeFileName(name: String): String {
        return name.replace(Regex("[\\\\/:*?\"<>|]"), "_").trim()
    }

    private fun putStringOrEmpty(map: com.facebook.react.bridge.WritableMap, key: String, value: String?) {
        map.putString(key, value ?: "")
    }
}
