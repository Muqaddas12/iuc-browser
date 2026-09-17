import { NativeModules, NativeEventEmitter } from 'react-native';
import { DownloadTask } from '../types/browser';

const { UCDownloadManager } = NativeModules;
const eventEmitter = UCDownloadManager ? new NativeEventEmitter(UCDownloadManager) : null;

export interface DownloadProgressPayload {
  totalSpeed: number;
  activeCount: number;
  queuedCount: number;
  simultaneousLimit: number;
  tasks: DownloadTask[];
}

export class DownloadManagerService {
  static async startDownload(
    url: string,
    fileName?: string,
    mimeType?: string,
    userAgent?: string
  ): Promise<{ id: string; fileName: string; status: string }> {
    if (!UCDownloadManager) {
      throw new Error('Native UCDownloadManager module is not linked.');
    }
    const safeName = fileName || this.guessFileName(url);
    return await UCDownloadManager.startDownload(url, safeName, mimeType || '', userAgent || '');
  }

  static async updateDownloadUrl(taskId: string, newUrl: string): Promise<{ success: boolean; taskId: string; downloadedBytes: number }> {
    if (!UCDownloadManager) {
      throw new Error('Native UCDownloadManager module is not linked.');
    }
    return await UCDownloadManager.updateDownloadUrl(taskId, newUrl);
  }

  static async setSimultaneousLimit(limit: number): Promise<void> {
    if (!UCDownloadManager) return;
    try {
      await UCDownloadManager.setSimultaneousLimit(Math.max(1, Math.min(6, limit)));
    } catch (e) {
      console.warn('Failed to set simultaneous limit', e);
    }
  }

  static async getSimultaneousLimit(): Promise<number> {
    if (!UCDownloadManager) return 3;
    try {
      return await UCDownloadManager.getSimultaneousLimit();
    } catch {
      return 3;
    }
  }

  static async pauseDownload(taskId: string): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.pauseDownload(taskId);
    } catch {
      return false;
    }
  }

  static async resumeDownload(taskId: string): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.resumeDownload(taskId);
    } catch {
      return false;
    }
  }

  static async cancelDownload(taskId: string, deleteFile = true): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.cancelDownload(taskId, deleteFile);
    } catch {
      return false;
    }
  }

  static async getDownloads(): Promise<DownloadTask[]> {
    if (!UCDownloadManager) return [];
    try {
      return await UCDownloadManager.getDownloads();
    } catch (e) {
      console.warn('Failed to get downloads from native module', e);
      return [];
    }
  }

  static async openDownloadedFile(taskId: string): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.openDownloadedFile(taskId);
    } catch {
      return false;
    }
  }

  static async openDownloadsFolder(): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.openDownloadsFolder();
    } catch {
      return false;
    }
  }

  static addProgressListener(listener: (data: DownloadProgressPayload) => void) {
    if (!eventEmitter) return { remove: () => {} };
    return eventEmitter.addListener('onDownloadProgress', listener);
  }

  static guessFileName(url: string): string {
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/');
      const last = parts[parts.length - 1];
      if (last && last.includes('.')) {
        return decodeURIComponent(last);
      }
    } catch {}
    return `download_${Date.now()}`;
  }

  static formatBytes(bytes: number): string {
    if (bytes <= 0 || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static formatSpeed(bytesPerSec: number): string {
    if (!bytesPerSec || bytesPerSec <= 0 || isNaN(bytesPerSec)) return '0 B/s';
    if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  static isDownloadableUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0];
    const extensions = [
      '.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv', '.wmv',
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
      '.apk', '.xapk', '.apks',
      '.pdf', '.epub', '.mobi',
      '.mp3', '.wav', '.flac', '.aac', '.m4a',
      '.iso', '.img', '.dmg', '.exe'
    ];
    return extensions.some((ext) => lower.endsWith(ext));
  }
}
