package com.iuc.browser.download

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.app.NotificationCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class UCDownloadManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newFixedThreadPool(4)
    private val activeTasks = ConcurrentHashMap<String, DownloadTask>()
    private val notificationManager =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val NAME = "UCDownloadManager"
        const val CHANNEL_ID = "uc_download_channel"
        const val CHANNEL_NAME = "UC Browser Downloads"
    }

    init {
        createNotificationChannel()
    }

    override fun getName(): String = NAME

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "UC Browser download notifications and progress"
                enableVibration(false)
                setSound(null, null)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private data class DownloadTask(
        val id: String,
        val url: String,
        val fileName: String,
        val destinationPath: String,
        @Volatile var isPaused: Boolean = false,
        @Volatile var isCancelled: Boolean = false,
        @Volatile var downloadedBytes: Long = 0,
        @Volatile var totalBytes: Long = 0
    )

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun startDownload(
        id: String,
        url: String,
        fileName: String,
        mimeType: String?,
        promise: Promise
    ) {
        try {
            val downloadDir = File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "UCBrowser"
            )
            if (!downloadDir.exists()) {
                downloadDir.mkdirs()
            }

            var cleanName = fileName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")
            if (cleanName.isBlank()) {
                cleanName = "uc_download_" + System.currentTimeMillis()
            }
            val destinationFile = File(downloadDir, cleanName)

            val task = DownloadTask(
                id = id,
                url = url,
                fileName = cleanName,
                destinationPath = destinationFile.absolutePath,
                downloadedBytes = 0,
                totalBytes = -1
            )
            activeTasks[id] = task

            executor.execute {
                runDownload(task)
            }

            val result = Arguments.createMap().apply {
                putString("id", id)
                putString("fileName", cleanName)
                putString("filePath", destinationFile.absolutePath)
                putString("status", "started")
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", e.message, e)
        }
    }

    private fun runDownload(task: DownloadTask) {
        var connection: HttpURLConnection? = null
        var inputStream: InputStream? = null
        var outputStream: FileOutputStream? = null
        val notifId = task.id.hashCode()

        try {
            val file = File(task.destinationPath)
            var existingBytes = 0L
            if (file.exists() && task.downloadedBytes > 0) {
                existingBytes = file.length()
            }

            val downloadUrl = URL(task.url)
            connection = downloadUrl.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 15000
            connection.readTimeout = 20000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13; Mobile) UCBrowser/13.4.0")

            if (existingBytes > 0) {
                connection.setRequestProperty("Range", "bytes=$existingBytes-")
            }

            connection.connect()
            val responseCode = connection.responseCode

            if (responseCode !in 200..299 && responseCode != 206) {
                throw Exception("Server returned HTTP response code: $responseCode")
            }

            val contentLength = connection.contentLengthLong
            task.totalBytes = if (responseCode == 206) {
                existingBytes + contentLength
            } else {
                contentLength
            }
            task.downloadedBytes = existingBytes

            inputStream = connection.inputStream
            outputStream = FileOutputStream(file, existingBytes > 0)

            val buffer = ByteArray(32 * 1024)
            var bytesRead: Int
            var lastUpdateTime = System.currentTimeMillis()
            var bytesSinceLastUpdate = 0L

            val notifBuilder = NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setContentTitle(task.fileName)
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setOngoing(true)
                .setOnlyAlertOnce(true)

            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                if (task.isCancelled) {
                    file.delete()
                    activeTasks.remove(task.id)
                    notificationManager.cancel(notifId)
                    val event = Arguments.createMap().apply {
                        putString("id", task.id)
                        putString("status", "cancelled")
                    }
                    sendEvent("onDownloadCancelled", event)
                    return
                }

                if (task.isPaused) {
                    val event = Arguments.createMap().apply {
                        putString("id", task.id)
                        putString("status", "paused")
                        putDouble("downloadedBytes", task.downloadedBytes.toDouble())
                        putDouble("totalBytes", task.totalBytes.toDouble())
                    }
                    sendEvent("onDownloadPaused", event)

                    notifBuilder.setContentText("Paused")
                        .setSmallIcon(android.R.drawable.ic_media_pause)
                        .setOngoing(false)
                    notificationManager.notify(notifId, notifBuilder.build())
                    return
                }

                outputStream.write(buffer, 0, bytesRead)
                task.downloadedBytes += bytesRead
                bytesSinceLastUpdate += bytesRead

                val now = System.currentTimeMillis()
                val delta = now - lastUpdateTime
                if (delta >= 500) {
                    val speedBps = (bytesSinceLastUpdate * 1000) / delta
                    val progress = if (task.totalBytes > 0) {
                        ((task.downloadedBytes * 100) / task.totalBytes).toInt()
                    } else {
                        0
                    }

                    val event = Arguments.createMap().apply {
                        putString("id", task.id)
                        putString("status", "downloading")
                        putDouble("downloadedBytes", task.downloadedBytes.toDouble())
                        putDouble("totalBytes", task.totalBytes.toDouble())
                        putInt("progress", progress)
                        putDouble("speedBps", speedBps.toDouble())
                    }
                    sendEvent("onDownloadProgress", event)

                    val speedStr = formatSpeed(speedBps)
                    notifBuilder.setProgress(100, progress, task.totalBytes <= 0)
                        .setContentText("$progress% • $speedStr")
                    notificationManager.notify(notifId, notifBuilder.build())

                    lastUpdateTime = now
                    bytesSinceLastUpdate = 0
                }
            }

            outputStream.flush()
            activeTasks.remove(task.id)

            // Complete Notification
            val completeNotif = NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setContentTitle("Download Completed")
                .setContentText(task.fileName)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setAutoCancel(true)
                .build()
            notificationManager.notify(notifId, completeNotif)

            val event = Arguments.createMap().apply {
                putString("id", task.id)
                putString("status", "completed")
                putString("filePath", task.destinationPath)
                putString("fileName", task.fileName)
                putDouble("fileSize", file.length().toDouble())
            }
            sendEvent("onDownloadCompleted", event)

        } catch (e: Exception) {
            activeTasks.remove(task.id)
            notificationManager.cancel(notifId)

            val event = Arguments.createMap().apply {
                putString("id", task.id)
                putString("status", "error")
                putString("error", e.message ?: "Unknown download error")
            }
            sendEvent("onDownloadError", event)
        } finally {
            try {
                inputStream?.close()
                outputStream?.close()
                connection?.disconnect()
            } catch (_: Exception) {}
        }
    }

    private fun formatSpeed(bytesPerSec: Long): String {
        return when {
            bytesPerSec >= 1024 * 1024 -> String.format("%.2f MB/s", bytesPerSec / (1024.0 * 1024.0))
            bytesPerSec >= 1024 -> String.format("%.1f KB/s", bytesPerSec / 1024.0)
            else -> "$bytesPerSec B/s"
        }
    }

    @ReactMethod
    fun pauseDownload(id: String, promise: Promise) {
        val task = activeTasks[id]
        if (task != null) {
            task.isPaused = true
            promise.resolve(true)
        } else {
            promise.reject("NOT_FOUND", "Download task not found")
        }
    }

    @ReactMethod
    fun resumeDownload(id: String, promise: Promise) {
        val task = activeTasks[id]
        if (task != null) {
            task.isPaused = false
            executor.execute {
                runDownload(task)
            }
            promise.resolve(true)
        } else {
            promise.reject("NOT_FOUND", "Download task not found")
        }
    }

    @ReactMethod
    fun cancelDownload(id: String, promise: Promise) {
        val task = activeTasks[id]
        if (task != null) {
            task.isCancelled = true
            promise.resolve(true)
        } else {
            promise.reject("NOT_FOUND", "Download task not found")
        }
    }

    @ReactMethod
    fun openFile(filePath: String, mimeType: String?, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File does not exist: $filePath")
                return
            }

            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(
                    reactContext,
                    "${reactContext.packageName}.provider",
                    file
                )
            } else {
                Uri.fromFile(file)
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType ?: "*/*")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_FILE_ERROR", e.message, e)
        }
    }
}

