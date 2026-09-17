import { NativeModules } from 'react-native';

const { UCDownloadManager } = NativeModules;

export interface DownloadItem {
  id: number;
  title: string;
  uri: string;
  mediaType: string;
  totalBytes: number;
  downloadedBytes: number;
  status: 'pending' | 'running' | 'paused' | 'successful' | 'failed' | 'unknown';
  reason: number;
  localUri: string;
}

export class DownloadManagerService {
  static async startDownload(
    url: string,
    fileName?: string,
    mimeType?: string,
    userAgent?: string
  ): Promise<{ downloadId: number; fileName: string; status: string }> {
    if (!UCDownloadManager) {
      throw new Error('Native UCDownloadManager module is not linked.');
    }
    const safeName = fileName || this.guessFileName(url);
    return await UCDownloadManager.startDownload(url, safeName, mimeType || '', userAgent || '');
  }

  static async getDownloads(): Promise<DownloadItem[]> {
    if (!UCDownloadManager) return [];
    try {
      return await UCDownloadManager.getDownloads();
    } catch (e) {
      console.warn('Failed to get downloads from native module', e);
      return [];
    }
  }

  static async cancelDownload(downloadId: number): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.cancelDownload(downloadId);
    } catch {
      return false;
    }
  }

  static async openDownloadedFile(downloadId: number): Promise<boolean> {
    if (!UCDownloadManager) return false;
    try {
      return await UCDownloadManager.openDownloadedFile(downloadId);
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

