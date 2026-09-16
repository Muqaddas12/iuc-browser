export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  progress: number;
  isIncognito: boolean;
  screenshot?: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  iconName?: string;
  iconColor?: string;
  customIcon?: string;
  badge?: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  downloadedBytes: number;
  totalBytes: number;
  progress: number;
  speedBps: number;
  status: 'downloading' | 'paused' | 'completed' | 'cancelled' | 'error';
  mimeType?: string;
  category: 'all' | 'video' | 'music' | 'image' | 'apk' | 'doc' | 'other';
  createdAt: number;
}

export type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'yahoo';

export interface DetectedVideo {
  src: string;
  title?: string;
  duration?: number;
  poster?: string;
  type?: string;
}

export interface BrowserSettings {
  searchEngine: SearchEngine;
  adBlockEnabled: boolean;
  nightModeEnabled: boolean;
  noImageMode: boolean;
  speedMode: boolean;
  desktopSite: boolean;
  saveHistory: boolean;
  downloadPath: string;
  userAgentType: 'mobile' | 'desktop' | 'custom';
}

