import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DownloadItem } from '../types/browser';
import { StorageService } from './StorageService';

const { UCDownloadManager } = NativeModules;
const eventEmitter = UCDownloadManager ? new NativeEventEmitter(UCDownloadManager) : null;

export class DownloadService {
  private static listenersAttached = false;
  private static activeDownloads: Map<string, DownloadItem> = new Map();
  private static onUpdateCallback?: (item: DownloadItem) => void;

  static init(onUpdate?: (item: DownloadItem) => void) {
    if (onUpdate) {
      this.onUpdateCallback = onUpdate;
    }

    if (this.listenersAttached || !eventEmitter) return;
    this.listenersAttached = true;

    eventEmitter.addListener('onDownloadProgress', (data) => {
      const item = this.activeDownloads.get(data.id);
      if (item) {
        item.status = 'downloading';
        item.downloadedBytes = data.downloadedBytes;
        item.totalBytes = data.totalBytes;
        item.progress = data.progress;
        item.speedBps = data.speedBps;
        this.notifyUpdate(item);
      }
    });

    eventEmitter.addListener('onDownloadCompleted', async (data) => {
      const item = this.activeDownloads.get(data.id);
      if (item) {
        item.status = 'completed';
        item.progress = 100;
        item.filePath = data.filePath;
        item.fileSize = data.fileSize;
        this.notifyUpdate(item);
        await this.persistItem(item);
        this.activeDownloads.delete(data.id);
      }
    });

    eventEmitter.addListener('onDownloadPaused', (data) => {
      const item = this.activeDownloads.get(data.id);
      if (item) {
        item.status = 'paused';
        this.notifyUpdate(item);
      }
    });

    eventEmitter.addListener('onDownloadCancelled', (data) => {
      const item = this.activeDownloads.get(data.id);
      if (item) {
        item.status = 'cancelled';
        this.notifyUpdate(item);
        this.activeDownloads.delete(data.id);
      }
    });

    eventEmitter.addListener('onDownloadError', (data) => {
      const item = this.activeDownloads.get(data.id);
      if (item) {
        item.status = 'error';
        this.notifyUpdate(item);
        this.activeDownloads.delete(data.id);
      }
    });
  }

  private static notifyUpdate(item: DownloadItem) {
    if (this.onUpdateCallback) {
      this.onUpdateCallback(item);
    }
  }

  private static async persistItem(item: DownloadItem) {
    const list = await StorageService.getDownloads();
    const updated = [item, ...list.filter((d) => d.id !== item.id)];
    await StorageService.saveDownloads(updated);
  }

  static detectCategory(fileName: string, mimeType?: string): DownloadItem['category'] {
    const lower = (fileName || '').toLowerCase();
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.mkv') ||
      lower.endsWith('.avi') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.m3u8') ||
      mimeType?.includes('video') ||
      mimeType?.includes('mpegurl')
    ) {
      return 'video';
    }
    if (
      lower.endsWith('.mp3') ||
      lower.endsWith('.m4a') ||
      lower.endsWith('.wav') ||
      lower.endsWith('.aac') ||
      mimeType?.includes('audio')
    ) {
      return 'music';
    }
    if (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif') ||
      mimeType?.includes('image')
    ) {
      return 'image';
    }
    if (lower.endsWith('.apk')) {
      return 'apk';
    }
    if (
      lower.endsWith('.pdf') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.txt') ||
      lower.endsWith('.xlsx') ||
      lower.endsWith('.pptx')
    ) {
      return 'doc';
    }
    return 'other';
  }

  static extractFileName(url: string, suggestedName?: string): string {
    if (suggestedName && suggestedName.trim().length > 0) {
      return suggestedName;
    }
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/');
      const last = parts[parts.length - 1];
      if (last && last.includes('.')) {
        return decodeURIComponent(last);
      }
    } catch {}
    return 'video_' + Date.now() + '.mp4';
  }

  static async startDownload(url: string, customName?: string, mimeType?: string): Promise<DownloadItem> {
    const id = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    let fileName = this.extractFileName(url, customName);

    // Clean up extension if .m3u8
    if (fileName.toLowerCase().endsWith('.m3u8') || url.includes('.m3u8')) {
      fileName = fileName.replace(/\.m3u8$/i, '') + '.mp4';
    }

    const category = this.detectCategory(fileName, mimeType);

    const downloadItem: DownloadItem = {
      id,
      url,
      fileName,
      downloadedBytes: 0,
      totalBytes: 0,
      progress: 0,
      speedBps: 0,
      status: 'downloading',
      mimeType: mimeType || (fileName.endsWith('.mp4') ? 'video/mp4' : undefined),
      category,
      createdAt: Date.now(),
    };

    this.activeDownloads.set(id, downloadItem);
    await this.persistItem(downloadItem);

    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.startDownload(id, url, fileName, mimeType);
      } catch (e) {
        console.warn('Native download error, falling back:', e);
        this.fallbackDownload(downloadItem);
      }
    } else {
      this.fallbackDownload(downloadItem);
    }

    return downloadItem;
  }

  private static async fallbackDownload(item: DownloadItem) {
    try {
      const targetDir = FileSystem.documentDirectory + 'UCBrowser/';
      const dirInfo = await FileSystem.getInfoAsync(targetDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
      }

      const fileUri = targetDir + item.fileName;
      const downloadResumable = FileSystem.createDownloadResumable(
        item.url,
        fileUri,
        {},
        (progress) => {
          const total = progress.totalBytesExpectedToWrite;
          const current = progress.totalBytesWritten;
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          item.downloadedBytes = current;
          item.totalBytes = total;
          item.progress = pct;
          this.notifyUpdate(item);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        item.status = 'completed';
        item.progress = 100;
        item.filePath = result.uri;
        this.notifyUpdate(item);
        await this.persistItem(item);
      }
    } catch (e) {
      console.warn('Fallback download failed', e);
      item.status = 'error';
      this.notifyUpdate(item);
    }
  }

  static async pause(id: string) {
    const item = this.activeDownloads.get(id);
    if (item) {
      item.status = 'paused';
      this.notifyUpdate(item);
    }
    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.pauseDownload(id);
      } catch (_) {}
    }
  }

  static async resume(id: string) {
    const item = this.activeDownloads.get(id);
    if (item) {
      item.status = 'downloading';
      this.notifyUpdate(item);
    }
    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.resumeDownload(id);
      } catch (_) {}
    }
  }

  static async cancel(id: string) {
    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.cancelDownload(id);
      } catch (_) {}
    }
    const item = this.activeDownloads.get(id);
    if (item) {
      item.status = 'cancelled';
      this.notifyUpdate(item);
      this.activeDownloads.delete(id);
    }
  }

  static async deleteDownload(item: DownloadItem) {
    this.activeDownloads.delete(item.id);
    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.deleteDownloadFile(item.filePath);
      } catch (_) {}
    }

    if (item.filePath) {
      try {
        const info = await FileSystem.getInfoAsync(item.filePath);
        if (info.exists) {
          await FileSystem.deleteAsync(item.filePath, { idempotent: true });
        }
      } catch (_) {}
    }

    const list = await StorageService.getDownloads();
    const updated = list.filter((d) => d.id !== item.id);
    await StorageService.saveDownloads(updated);
  }

  static async openFile(item: DownloadItem) {
    if (!item.filePath) return;
    if (Platform.OS === 'android' && UCDownloadManager) {
      try {
        await UCDownloadManager.openFile(item.filePath, item.mimeType);
        return;
      } catch (e) {
        console.warn('Native open file failed, falling back to Sharing:', e);
      }
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(item.filePath);
    }
  }
}
