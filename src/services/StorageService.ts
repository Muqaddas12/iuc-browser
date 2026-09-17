import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bookmark,
  HistoryItem,
  BrowserSettings,
  Workspace,
  PasswordItem,
  ExtensionItem,
  ProxySettings,
  ChatMessage
} from '../types/browser';

const KEYS = {
  SETTINGS: '@iuc_settings_v2',
  BOOKMARKS: '@iuc_bookmarks_v2',
  HISTORY: '@iuc_history_v2',
  PASSWORDS: '@iuc_passwords_v2',
  WORKSPACES: '@iuc_workspaces_v2',
  EXTENSIONS: '@iuc_extensions_v2',
  PROXY: '@iuc_proxy_v2',
  CHAT_MESSAGES: '@iuc_chat_v2'
};

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 'ws_personal', name: 'Personal', icon: '👤', color: '#6366F1' },
  { id: 'ws_work', name: 'Work', icon: '💼', color: '#3B82F6' },
  { id: 'ws_media', name: 'Media', icon: '🎬', color: '#EC4899' },
  { id: 'ws_private', name: 'Crypto & Privacy', icon: '🛡️', color: '#10B981' }
];

const DEFAULT_EXTENSIONS: ExtensionItem[] = [
  {
    id: 'ext_yt_adblock',
    name: 'YouTube AdBlock Pro',
    description: 'Auto-skips YouTube pre-roll, mid-roll, and banner ads instantly.',
    enabled: true,
    author: 'IUC Privacy Lab',
    version: '2.4.0',
    script: `
      (function() {
        setInterval(function() {
          var video = document.querySelector('video');
          var skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
          if (skipBtn) { skipBtn.click(); }
          var ad = document.querySelector('.ad-showing, .ad-interrupting');
          if (ad && video && !isNaN(video.duration)) {
            video.muted = true;
            video.currentTime = video.duration;
          }
          var adOverlays = document.querySelectorAll('.ytp-ad-overlay-container, ytd-promoted-video-renderer, ytd-banner-promo-renderer, #player-ads');
          for (var i = 0; i < adOverlays.length; i++) {
            adOverlays[i].style.display = 'none';
          }
        }, 500);
      })();
    `
  },
  {
    id: 'ext_cookie_killer',
    name: 'Cookie Annihilator (GDPR Auto-Reject)',
    description: 'Auto-dismisses cookie consent popups and GDPR banners automatically.',
    enabled: true,
    author: 'IUC Privacy Lab',
    version: '1.9.0',
    script: `
      (function() {
        var cookieSelectors = [
          '#onetrust-banner-sdk', '.cookie-banner', '#cookie-banner',
          'div[class*="cookie-consent"]', 'div[id*="cookie-notice"]',
          '.qc-cmp2-container', '#cmpbox', '.didomi-popup-container'
        ];
        setInterval(function() {
          for (var i = 0; i < cookieSelectors.length; i++) {
            var el = document.querySelector(cookieSelectors[i]);
            if (el) { el.style.display = 'none'; }
          }
        }, 800);
      })();
    `
  },
  {
    id: 'ext_dark_reader',
    name: 'Universal Dark Reader',
    description: 'Forces high-contrast AMOLED dark mode across any website.',
    enabled: false,
    author: 'Alexander S.',
    version: '4.9.5',
    script: `
      (function() {
        if (document.getElementById('__iuc_dark_reader__')) return;
        var s = document.createElement('style');
        s.id = '__iuc_dark_reader__';
        s.textContent = 'html, body { background-color: #121216 !important; color: #E4E4EB !important; } input, textarea, select { background-color: #1E1F26 !important; color: #FFF !important; }';
        (document.head || document.documentElement).appendChild(s);
      })();
    `
  },
  {
    id: 'ext_paywall_cleaner',
    name: 'Bypass Paywalls Clean',
    description: 'Removes reading limit overlays and subscription paywall popovers.',
    enabled: true,
    author: 'Magnolia1234',
    version: '3.6.8',
    script: `
      (function() {
        var paywallSelectors = [
          'div[class*="paywall"]', 'div[id*="paywall"]',
          'div[class*="article-barrier"]', '.gate-overlay',
          '.modal-subscription', '.tp-modal', '.tp-backdrop'
        ];
        for (var i = 0; i < paywallSelectors.length; i++) {
          var els = document.querySelectorAll(paywallSelectors[i]);
          for (var j = 0; j < els.length; j++) { els[j].remove(); }
        }
        document.body.style.overflow = 'auto';
      })();
    `
  }
];

const DEFAULT_SETTINGS: BrowserSettings = {
  searchEngine: 'duckduckgo', // Private search engine default!
  adBlockEnabled: true,
  desktopMode: false,
  antiFingerprinting: true,
  cookieConsentBlocker: true,
  youtubeAdBlocker: true,
  torProxyEnabled: false,
  torProxyPort: 9050,
  splitScreenEnabled: false,
  verticalTabsEnabled: false,
  readerTheme: 'dark',
  activeWorkspaceId: 'ws_personal'
};

export const StorageService = {
  // --- Settings ---
  async getSettings(): Promise<BrowserSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('StorageService.getSettings error:', e);
    }
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: Partial<BrowserSettings>): Promise<BrowserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // --- Bookmarks ---
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveBookmark(bookmark: Bookmark): Promise<Bookmark[]> {
    const list = await this.getBookmarks();
    const filtered = list.filter((b) => b.url !== bookmark.url);
    const updated = [bookmark, ...filtered];
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  async removeBookmark(id: string): Promise<Bookmark[]> {
    const list = await this.getBookmarks();
    const updated = list.filter((b) => b.id !== id);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  // --- History ---
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addHistory(item: Omit<HistoryItem, 'timestamp'>): Promise<HistoryItem[]> {
    const list = await this.getHistory();
    const filtered = list.filter((h) => h.url !== item.url);
    const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 200);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  },

  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.HISTORY);
  },

  // --- Workspaces ---
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WORKSPACES);
      return data ? JSON.parse(data) : DEFAULT_WORKSPACES;
    } catch {
      return DEFAULT_WORKSPACES;
    }
  },

  async saveWorkspace(ws: Workspace): Promise<Workspace[]> {
    const list = await this.getWorkspaces();
    const updated = [...list.filter((w) => w.id !== ws.id), ws];
    await AsyncStorage.setItem(KEYS.WORKSPACES, JSON.stringify(updated));
    return updated;
  },

  async deleteWorkspace(id: string): Promise<Workspace[]> {
    const list = await this.getWorkspaces();
    if (list.length <= 1) return list;
    const updated = list.filter((w) => w.id !== id);
    await AsyncStorage.setItem(KEYS.WORKSPACES, JSON.stringify(updated));
    return updated;
  },

  // --- Password Manager (Vault) ---
  async getPasswords(): Promise<PasswordItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PASSWORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async savePassword(item: PasswordItem): Promise<PasswordItem[]> {
    const list = await this.getPasswords();
    const updated = [item, ...list.filter((p) => p.id !== item.id)];
    await AsyncStorage.setItem(KEYS.PASSWORDS, JSON.stringify(updated));
    return updated;
  },

  async deletePassword(id: string): Promise<PasswordItem[]> {
    const list = await this.getPasswords();
    const updated = list.filter((p) => p.id !== id);
    await AsyncStorage.setItem(KEYS.PASSWORDS, JSON.stringify(updated));
    return updated;
  },

  // --- Extensions & Userscripts ---
  async getExtensions(): Promise<ExtensionItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EXTENSIONS);
      return data ? JSON.parse(data) : DEFAULT_EXTENSIONS;
    } catch {
      return DEFAULT_EXTENSIONS;
    }
  },

  async saveExtension(ext: ExtensionItem): Promise<ExtensionItem[]> {
    const list = await this.getExtensions();
    const updated = [...list.filter((e) => e.id !== ext.id), ext];
    await AsyncStorage.setItem(KEYS.EXTENSIONS, JSON.stringify(updated));
    return updated;
  },

  async toggleExtension(id: string): Promise<ExtensionItem[]> {
    const list = await this.getExtensions();
    const updated = list.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
    await AsyncStorage.setItem(KEYS.EXTENSIONS, JSON.stringify(updated));
    return updated;
  },

  async deleteExtension(id: string): Promise<ExtensionItem[]> {
    const list = await this.getExtensions();
    const updated = list.filter((e) => e.id !== id);
    await AsyncStorage.setItem(KEYS.EXTENSIONS, JSON.stringify(updated));
    return updated;
  },

  // --- Proxy / Tor Settings ---
  async getProxySettings(): Promise<ProxySettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROXY);
      return data
        ? JSON.parse(data)
        : { enabled: false, type: 'tor', host: '127.0.0.1', port: 9050 };
    } catch {
      return { enabled: false, type: 'tor', host: '127.0.0.1', port: 9050 };
    }
  },

  async saveProxySettings(proxy: ProxySettings): Promise<ProxySettings> {
    await AsyncStorage.setItem(KEYS.PROXY, JSON.stringify(proxy));
    return proxy;
  },

  // --- Private AI Chat Messages ---
  async getChatMessages(): Promise<ChatMessage[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveChatMessage(msg: ChatMessage): Promise<ChatMessage[]> {
    const list = await this.getChatMessages();
    const updated = [...list, msg].slice(-50);
    await AsyncStorage.setItem(KEYS.CHAT_MESSAGES, JSON.stringify(updated));
    return updated;
  },

  async clearChat(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CHAT_MESSAGES);
  },

  // --- One-Tap History & Data Nuke ---
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.HISTORY, KEYS.CHAT_MESSAGES]);
  },

  // --- Sync Across Devices (Export / Import Backup) ---
  async exportBackup(): Promise<string> {
    const [settings, bookmarks, passwords, workspaces, extensions] = await Promise.all([
      this.getSettings(),
      this.getBookmarks(),
      this.getPasswords(),
      this.getWorkspaces(),
      this.getExtensions()
    ]);

    const backup = {
      version: '2.0.0',
      exportedAt: Date.now(),
      settings,
      bookmarks,
      passwords,
      workspaces,
      extensions
    };

    return JSON.stringify(backup, null, 2);
  },

  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.settings) await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(backup.settings));
      if (backup.bookmarks) await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(backup.bookmarks));
      if (backup.passwords) await AsyncStorage.setItem(KEYS.PASSWORDS, JSON.stringify(backup.passwords));
      if (backup.workspaces) await AsyncStorage.setItem(KEYS.WORKSPACES, JSON.stringify(backup.workspaces));
      if (backup.extensions) await AsyncStorage.setItem(KEYS.EXTENSIONS, JSON.stringify(backup.extensions));
      return true;
    } catch {
      return false;
    }
  }
};
