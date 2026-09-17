package com.iuc.browser.download

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.IOException
import java.io.RandomAccessFile
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

class UCDownloadManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "UCDownloadManager"
        private const val TAG = "UCDownloadManager"
        private val ID_GEN = AtomicInteger(1)
    }

    override fun getName(): String = NAME

    data class DownloadTask(
        val id: String,
        var url: String,
        val fileName: String,
        val filePath: String,
        var totalBytes: Long = -1L,
        var downloadedBytes: Long = 0L,
        var speed: Long = 0L, // bytes per second
        var status: String = "queued", // downloading, paused, queued, completed, failed
        var error: String? = null,
        var mimeType: String? = null,
        var userAgent: String? = null,
        val createdAt: Long = System.currentTimeMillis(),
        var updatedAt: Long = System.currentTimeMillis()
    )

    private val tasks = ConcurrentHashMap<String, DownloadTask>()
    private val threadPool = Executors.newCachedThreadPool()
    private val queueLock = Any()

    // Configurable simultaneous limit: user selects 1 to 6 (default 3)
    private var simultaneousLimit = 3

    @ReactMethod
    fun setSimultaneousLimit(limit: Int) {
        val clamped = limit.coerceIn(1, 6)
        Log.i(TAG, "Setting simultaneous download limit to: $clamped")
        simultaneousLimit = clamped
        scheduleNextQueue()
    }

    @ReactMethod
    fun getSimultaneousLimit(promise: Promise) {
        promise.resolve(simultaneousLimit)
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

            val cleanFileName = sanitizeFileName(fileName ?: guessFileNameFromUrl(url))
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs()
            }

            val destFile = resolveUniqueFile(downloadsDir, cleanFileName)
            val taskId = "task_${System.currentTimeMillis()}_${ID_GEN.getAndIncrement()}"

            val task = DownloadTask(
                id = taskId,
                url = url,
                fileName = destFile.name,
                filePath = destFile.absolutePath,
                mimeType = mimeType,
                userAgent = userAgent ?: "Mozilla/5.0 (Linux; Android 14; Mobile) IUCBrowser/2.0",
                status = "queued"
            )

            tasks[taskId] = task
            Log.i(TAG, "📥 Enqueued new download: ID=$taskId, File=${destFile.name}, URL=$url")

            scheduleNextQueue()

            val result = Arguments.createMap().apply {
                putString("id", taskId)
                putString("fileName", destFile.name)
                putString("status", task.status)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start download", e)
            promise.reject("DOWNLOAD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun updateDownloadUrl(taskId: String, newUrl: String, promise: Promise) {
        val task = tasks[taskId]
        if (task == null) {
            promise.reject("TASK_NOT_FOUND", "No download task with ID: $taskId")
            return
        }

        if (newUrl.isBlank()) {
            promise.reject("INVALID_URL", "New download URL cannot be empty")
            return
        }

        Log.i(TAG, "🔗 Updating download URL for task $taskId: ${task.url} -> $newUrl (Resuming from ${task.downloadedBytes} bytes)")
        task.url = newUrl
        task.error = null
        task.updatedAt = System.currentTimeMillis()

        if (task.status == "failed" || task.status == "paused") {
            task.status = "queued"
            scheduleNextQueue()
        }

        emitProgress()

        val map = Arguments.createMap().apply {
            putBoolean("success", true)
            putString("taskId", taskId)
            putDouble("downloadedBytes", task.downloadedBytes.toDouble())
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun pauseDownload(taskId: String, promise: Promise) {
        val task = tasks[taskId]
        if (task == null) {
            promise.reject("TASK_NOT_FOUND", "No download task with ID: $taskId")
            return
        }

        Log.i(TAG, "⏸️ Pausing download task: $taskId")
        task.status = "paused"
        task.speed = 0L
        task.updatedAt = System.currentTimeMillis()

        emitProgress()
        scheduleNextQueue()
        promise.resolve(true)
    }

    @ReactMethod
    fun resumeDownload(taskId: String, promise: Promise) {
        val task = tasks[taskId]
        if (task == null) {
            promise.reject("TASK_NOT_FOUND", "No download task with ID: $taskId")
            return
        }

        Log.i(TAG, "▶️ Resuming download task: $taskId")
        task.error = null
        task.status = "queued"
        task.updatedAt = System.currentTimeMillis()

        scheduleNextQueue()
        emitProgress()
        promise.resolve(true)
    }

    @ReactMethod
    fun cancelDownload(taskId: String, deleteFile: Boolean, promise: Promise) {
        val task = tasks.remove(taskId)
        if (task == null) {
            promise.resolve(false)
            return
        }

        Log.i(TAG, "🗑️ Cancelling download task: $taskId (deleteFile=$deleteFile)")
        task.status = "cancelled"
        task.speed = 0L

        if (deleteFile) {
            try {
                val f = File(task.filePath)
                if (f.exists()) f.delete()
            } catch (e: Exception) {
                Log.w(TAG, "Could not delete file: ${task.filePath}", e)
            }
        }

        scheduleNextQueue()
        emitProgress()
        promise.resolve(true)
    }

    @ReactMethod
    fun getDownloads(promise: Promise) {
        try {
            val list = Arguments.createArray()
            val sorted = tasks.values.sortedByDescending { it.createdAt }

            for (task in sorted) {
                list.pushMap(taskToWritableMap(task))
            }

            promise.resolve(list)
        } catch (e: Exception) {
            promise.reject("FETCH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openDownloadedFile(taskId: String, promise: Promise) {
        try {
            val task = tasks[taskId]
            val file = if (task != null) File(task.filePath) else null

            if (file == null || !file.exists()) {
                promise.reject("FILE_NOT_FOUND", "Downloaded file does not exist on disk")
                return
            }

            val uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.provider",
                file
            )

            val mimeType = task?.mimeType ?: guessMimeType(file.name)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open file", e)
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
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    val uri = Uri.parse(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).absolutePath)
                    setDataAndType(uri, "*/*")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject("OPEN_FOLDER_ERROR", ex.message, ex)
            }
        }
    }

    private fun scheduleNextQueue() {
        synchronized(queueLock) {
            val activeCount = tasks.values.count { it.status == "downloading" }
            val availableSlots = simultaneousLimit - activeCount

            if (availableSlots > 0) {
                val nextTasks = tasks.values
                    .filter { it.status == "queued" }
                    .sortedBy { it.createdAt }
                    .take(availableSlots)

                for (t in nextTasks) {
                    t.status = "downloading"
                    t.updatedAt = System.currentTimeMillis()
                    threadPool.execute { runDownloadWorker(t) }
                }
            }
        }
        emitProgress()
    }

    private fun runDownloadWorker(task: DownloadTask) {
        Log.i(TAG, "🚀 Starting worker for task ${task.id} (${task.fileName}) from ${task.downloadedBytes} bytes")
        var connection: HttpURLConnection? = null
        var raf: RandomAccessFile? = null

        try {
            var currentUrl = task.url
            var redirects = 0
            var connected = false

            while (redirects < 5 && !connected) {
                val u = URL(currentUrl)
                connection = (u.openConnection() as HttpURLConnection).apply {
                    instanceFollowRedirects = true
                    connectTimeout = 15000
                    readTimeout = 25000
                    setRequestProperty("User-Agent", task.userAgent ?: "IUCBrowser/2.0")
                    if (task.downloadedBytes > 0) {
                        setRequestProperty("Range", "bytes=${task.downloadedBytes}-")
                    }
                }

                connection.connect()
                val code = connection.responseCode

                if (code == HttpURLConnection.HTTP_MOVED_PERM ||
                    code == HttpURLConnection.HTTP_MOVED_TEMP ||
                    code == 307 || code == 308) {
                    val location = connection.getHeaderField("Location")
                    if (!location.isNullOrBlank()) {
                        currentUrl = location
                        redirects++
                        connection.disconnect()
                        continue
                    }
                }

                connected = true
            }

            val conn = connection ?: throw IOException("Could not establish connection")
            val code = conn.responseCode

            if (code == 403 || code == 410) {
                throw IOException("Link Expired (HTTP $code). Tap 'Update Link' to renew.")
            } else if (code != HttpURLConnection.HTTP_OK && code != HttpURLConnection.HTTP_PARTIAL) {
                throw IOException("Server returned HTTP $code ${conn.responseMessage}")
            }

            val isPartial = (code == HttpURLConnection.HTTP_PARTIAL)
            if (task.downloadedBytes > 0 && !isPartial) {
                // Server does not support range requests; reset to 0
                Log.w(TAG, "Server did not return 206 Partial Content. Restarting download from 0.")
                task.downloadedBytes = 0L
            }

            val contentLen = conn.contentLengthLong
            if (task.totalBytes <= 0 && contentLen > 0) {
                task.totalBytes = if (isPartial) task.downloadedBytes + contentLen else contentLen
            }

            val destFile = File(task.filePath)
            raf = RandomAccessFile(destFile, "rw")
            raf.seek(task.downloadedBytes)

            val inputStream = conn.inputStream
            val buffer = ByteArray(32 * 1024)
            var bytesRead = 0
            var bytesInInterval = 0L
            var lastIntervalTime = System.currentTimeMillis()

            while (task.status == "downloading" && inputStream.read(buffer).also { bytesRead = it } != -1) {
                raf.write(buffer, 0, bytesRead)
                task.downloadedBytes += bytesRead
                bytesInInterval += bytesRead

                val now = System.currentTimeMillis()
                if (now - lastIntervalTime >= 800) {
                    val elapsedSec = (now - lastIntervalTime) / 1000.0
                    task.speed = (bytesInInterval / elapsedSec).toLong()
                    bytesInInterval = 0L
                    lastIntervalTime = now
                    emitProgress()
                }
            }

            inputStream.close()
            raf.close()
            raf = null

            if (task.status == "downloading") {
                task.speed = 0L
                task.status = "completed"
                task.updatedAt = System.currentTimeMillis()
                Log.i(TAG, "✅ Task ${task.id} (${task.fileName}) completed successfully! Total bytes: ${task.downloadedBytes}")

                // Scan file into media store so user sees it in Files / Gallery
                MediaScannerConnection.scanFile(
                    reactContext,
                    arrayOf(destFile.absolutePath),
                    arrayOf(task.mimeType ?: guessMimeType(destFile.name)),
                    null
                )

                scheduleNextQueue()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading task ${task.id}: ${e.message}")
            if (task.status == "downloading") {
                task.speed = 0L
                task.status = "failed"
                task.error = e.message ?: "Network error"
                task.updatedAt = System.currentTimeMillis()
                scheduleNextQueue()
            }
        } finally {
            try { raf?.close() } catch (_: Exception) {}
            try { connection?.disconnect() } catch (_: Exception) {}
            emitProgress()
        }
    }

    private fun emitProgress() {
        try {
            val totalSpeed = tasks.values.filter { it.status == "downloading" }.sumOf { it.speed }
            val activeCount = tasks.values.count { it.status == "downloading" }
            val queuedCount = tasks.values.count { it.status == "queued" }

            val list = Arguments.createArray()
            val sorted = tasks.values.sortedByDescending { it.createdAt }
            for (t in sorted) {
                list.pushMap(taskToWritableMap(t))
            }

            val payload = Arguments.createMap().apply {
                putDouble("totalSpeed", totalSpeed.toDouble())
                putInt("activeCount", activeCount)
                putInt("queuedCount", queuedCount)
                putInt("simultaneousLimit", simultaneousLimit)
                putArray("tasks", list)
            }

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onDownloadProgress", payload)
        } catch (e: Exception) {
            // Context might not be ready yet
        }
    }

    private fun taskToWritableMap(task: DownloadTask): WritableMap {
        return Arguments.createMap().apply {
            putString("id", task.id)
            putString("url", task.url)
            putString("fileName", task.fileName)
            putString("filePath", task.filePath)
            putDouble("totalBytes", task.totalBytes.toDouble())
            putDouble("downloadedBytes", task.downloadedBytes.toDouble())
            putDouble("speed", task.speed.toDouble())
            putString("status", task.status)
            putString("error", task.error ?: "")
            putString("mimeType", task.mimeType ?: "")
            putDouble("createdAt", task.createdAt.toDouble())
            putDouble("updatedAt", task.updatedAt.toDouble())
        }
    }

    private fun sanitizeFileName(name: String): String {
        return name.replace("[\\\\/:*?\"<>|]".toRegex(), "_")
    }

    private fun guessFileNameFromUrl(url: String): String {
        try {
            val clean = url.split("?")[0].split("#")[0]
            val last = clean.substringAfterLast('/')
            if (last.isNotBlank() && last.contains('.')) {
                return Uri.decode(last)
            }
        } catch (_: Exception) {}
        return "download_${System.currentTimeMillis()}"
    }

    private fun resolveUniqueFile(directory: File, fileName: String): File {
        var file = File(directory, fileName)
        if (!file.exists()) return file

        val name = fileName.substringBeforeLast('.')
        val ext = fileName.substringAfterLast('.', "")
        val dotExt = if (ext.isNotBlank()) ".$ext" else ""

        var counter = 1
        while (file.exists()) {
            file = File(directory, "${name}_$counter$dotExt")
            counter++
        }
        return file
    }

    private fun guessMimeType(fileName: String): String {
        val ext = fileName.substringAfterLast('.', "").lowercase()
        return when (ext) {
            "mp4", "m4v" -> "video/mp4"
            "mkv" -> "video/x-matroska"
            "avi" -> "video/x-msvideo"
            "webm" -> "video/webm"
            "mp3" -> "audio/mpeg"
            "wav" -> "audio/wav"
            "flac" -> "audio/flac"
            "zip" -> "application/zip"
            "rar" -> "application/x-rar-compressed"
            "7z" -> "application/x-7z-compressed"
            "apk" -> "application/vnd.android.package-archive"
            "pdf" -> "application/pdf"
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "webp" -> "image/webp"
            else -> "*/*"
        }
    }
}
