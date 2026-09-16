import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, HistoryItem, ShortcutItem, DownloadItem, BrowserSettings } from '../types/browser';
import { DEFAULT_SHORTCUTS } from '../constants/defaultShortcuts';

const KEYS = {
  BOOKMARKS: '@uc_bookmarks',
  HISTORY: '@uc_history',
  SHORTCUTS: '@uc_shortcuts',
  DOWNLOADS: '@uc_downloads',
  SETTINGS: '@uc_settings',
};

const DEFAULT_SETTINGS: BrowserSettings = {
  searchEngine: 'google',
  adBlockEnabled: true,
  nightModeEnabled: false,
  noImageMode: false,
  speedMode: false,
  desktopSite: false,
  saveHistory: true,
  downloadPath: 'Downloads/UCBrowser',
  userAgentType: 'mobile',
};

export const StorageService = {
  // Settings
  async getSettings(): Promise<BrowserSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: Partial<BrowserSettings>): Promise<BrowserSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Shortcuts
  async getShortcuts(): Promise<ShortcutItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SHORTCUTS);
      return data ? JSON.parse(data) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  },

  async saveShortcuts(shortcuts: ShortcutItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SHORTCUTS, JSON.stringify(shortcuts));
    } catch (e) {
      console.error('Failed to save shortcuts', e);
    }
  },

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const list = await this.getBookmarks();
    const newItem: Bookmark = {
      ...bookmark,
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    const updated = [newItem, ...list.filter(b => b.url !== bookmark.url)];
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return newItem;
  },

  async removeBookmark(id: string): Promise<void> {
    const list = await this.getBookmarks();
    const updated = list.filter(b => b.id !== id);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
  },

  // History
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addHistory(item: { title: string; url: string }): Promise<void> {
    if (!item.url || item.url.startsWith('about:') || item.url.startsWith('uc://')) return;
    try {
      const list = await this.getHistory();
      const newItem: HistoryItem = {
        id: 'hist_' + Date.now(),
        title: item.title || item.url,
        url: item.url,
        timestamp: Date.now(),
      };
      // Keep up to 200 items, avoid consecutive duplicates
      const filtered = list.filter(h => h.url !== item.url);
      const updated = [newItem, ...filtered].slice(0, 200);
      await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add history', e);
    }
  },

  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.HISTORY);
  },

  async removeHistoryItem(id: string): Promise<void> {
    const list = await this.getHistory();
    const updated = list.filter(h => h.id !== id);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  },

  // Downloads
  async getDownloads(): Promise<DownloadItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DOWNLOADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveDownloads(downloads: DownloadItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(downloads));
    } catch (e) {
      console.error('Failed to save downloads', e);
    }
  },
};

