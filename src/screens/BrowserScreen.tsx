import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
  SafeAreaView,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { HeaderSearchBar } from '../components/HeaderSearchBar';
import { BottomToolbar } from '../components/BottomToolbar';
import { SpeedDialGrid } from '../components/SpeedDialGrid';
import { NewsFeedSection } from '../components/NewsFeedSection';
import { UCMenuDrawer } from '../components/UCMenuDrawer';
import { TabSwitcherModal } from '../components/TabSwitcherModal';
import { VideoAssistantBar } from '../components/VideoAssistantBar';
import { DownloadManagerScreen } from './DownloadManagerScreen';
import { BookmarksHistoryScreen } from './BookmarksHistoryScreen';
import { SettingsScreen } from './SettingsScreen';
import { UCDialog, DialogConfig } from '../components/UCDialog';
import { UCToast, ToastConfig } from '../components/UCToast';
import { Tab, ShortcutItem, BrowserSettings, DetectedVideo, SearchEngine } from '../types/browser';
import { COLORS, SEARCH_ENGINES, UC_USER_AGENTS } from '../constants/theme';
import { StorageService } from '../services/StorageService';
import { DownloadService } from '../services/NativeDownloadService';
import { AD_BLOCK_JS } from '../services/AdBlockEngine';
import { AD_BLOCK_JS, isAdUrl } from '../services/AdBlockEngine';
import { MEDIA_SNIFFER_JS } from '../services/MediaSniffer';
import { getNightModeScript } from '../services/NightModeEngine';

export const BrowserScreen: React.FC = () => {
  // State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab_default_1',
      url: 'uc://home',
      initialUrl: 'uc://home',
      title: 'Home',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      progress: 0,
      isIncognito: false,
      createdAt: Date.now(),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_default_1');
  const [isIncognitoView, setIsIncognitoView] = useState<boolean>(false);
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);
  const [settings, setSettings] = useState<BrowserSettings>({
    searchEngine: 'google',
    adBlockEnabled: true,
    nightModeEnabled: false,
    noImageMode: false,
    speedMode: false,
    desktopSite: false,
    saveHistory: true,
    downloadPath: 'Downloads/UCBrowser',
    userAgentType: 'mobile',
  });

  // Overlays / Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isBookmarksHistoryOpen, setIsBookmarksHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Custom Dialog & Toast System
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  // Video Sniffer State
  const [detectedVideo, setDetectedVideo] = useState<DetectedVideo | null>(null);

  const webViewRefs = useRef<{ [key: string]: WebView | null }>({});
  const lastBackPressedRef = useRef<number>(0);

  // Active Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isHomePage = !activeTab || activeTab.url === 'uc://home' || activeTab.url === 'about:blank';
  const isDark = activeTab?.isIncognito || settings.nightModeEnabled;

  // Load initial persistence
  useEffect(() => {
    (async () => {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
      const loadedShortcuts = await StorageService.getShortcuts();
      setShortcuts(loadedShortcuts);
    })();

    DownloadService.init();
  }, []);

  // Hardware Back Button Handler (Android)
  useEffect(() => {
    const onBackPress = () => {
      // 1. Close active dialogs
      if (dialog) {
        setDialog(null);
        return true;
      }

      // 2. Close any open modals/drawers
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return true;
      }
      if (isTabSwitcherOpen) {
        setIsTabSwitcherOpen(false);
        return true;
      }
      if (isDownloadsOpen) {
        setIsDownloadsOpen(false);
        return true;
      }
      if (isBookmarksHistoryOpen) {
        setIsBookmarksHistoryOpen(false);
        return true;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      }

      // 3. Handle WebView internal back navigation if webpage has history
      const currentRef = webViewRefs.current[activeTabId];
      if (currentRef && activeTab && activeTab.canGoBack) {
        currentRef.goBack();
        return true;
      }

      // 4. Return to home screen if browsing a webpage
      if (!isHomePage) {
        handleGoHome();
        return true;
      }

      // 5. Close active tab if more than 1 tab exists
      if (tabs.length > 1) {
        handleCloseTab(activeTabId);
        return true;
      }

      // 6. Double-tap back button to safely exit app
      const now = Date.now();
      if (now - lastBackPressedRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressedRef.current = now;
      setToast({ message: 'Press back again to exit', type: 'info' });
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    dialog,
    isMenuOpen,
    isTabSwitcherOpen,
    isDownloadsOpen,
    isBookmarksHistoryOpen,
    isSettingsOpen,
    activeTabId,
    activeTab,
    isHomePage,
    tabs.length,
  ]);

  // Tab Helpers
  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  };

  const handleNewTab = (incognito = false, initialUrl = 'uc://home') => {
    const newId = 'tab_' + Date.now();
    const newTabItem: Tab = {
      id: newId,
      url: initialUrl,
      initialUrl: initialUrl,
      title: initialUrl === 'uc://home' ? 'Home' : initialUrl,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      progress: 0,
      isIncognito: incognito,
      createdAt: Date.now(),
    };
    setTabs((prev) => [...prev, newTabItem]);
    setActiveTabId(newId);
    setIsIncognitoView(incognito);
    setDetectedVideo(null);
    setToast({
      message: incognito ? 'Opened new Incognito Tab' : 'Opened new Tab',
      type: 'info',
    });
  };

  const handleCloseTab = (tabId: string) => {
    const remaining = tabs.filter((t) => t.id !== tabId);
    if (remaining.length === 0) {
      const fallbackId = 'tab_' + Date.now();
      setTabs([
        {
          id: fallbackId,
          url: 'uc://home',
          initialUrl: 'uc://home',
          title: 'Home',
          canGoBack: false,
          canGoForward: false,
          isLoading: false,
          progress: 0,
          isIncognito: isIncognitoView,
          createdAt: Date.now(),
        },
      ]);
      setActiveTabId(fallbackId);
    } else {
      setTabs(remaining);
      if (activeTabId === tabId) {
        const nextActive = remaining[remaining.length - 1];
        setActiveTabId(nextActive.id);
        setIsIncognitoView(nextActive.isIncognito);
      }
    }
  };

  const handleCloseAllTabs = () => {
    const fallbackId = 'tab_' + Date.now();
    setTabs([
      {
        id: fallbackId,
        url: 'uc://home',
        initialUrl: 'uc://home',
        title: 'Home',
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
        progress: 0,
        isIncognito: isIncognitoView,
        createdAt: Date.now(),
      },
    ]);
    setActiveTabId(fallbackId);
    setIsTabSwitcherOpen(false);
    setToast({ message: 'Closed all tabs', type: 'info' });
  };

  // Navigation Handlers
  const handleSearchOrNavigate = (input: string) => {
    let finalUrl = input.trim();
    if (!finalUrl) return;

    // Check if valid URL or domain
    const isUrl =
      /^(https?:\/\/)/i.test(finalUrl) ||
      /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(finalUrl);

    if (isUrl) {
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
    } else {
      const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.google;
      finalUrl = engine.url + encodeURIComponent(finalUrl);
    }

    setDetectedVideo(null);
    updateTab(activeTabId, { url: finalUrl, initialUrl: finalUrl, title: finalUrl });
  };

  const handleGoHome = () => {
    setDetectedVideo(null);
    updateTab(activeTabId, {
      url: 'uc://home',
      initialUrl: 'uc://home',
      title: 'Home',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      progress: 0,
    });
  };

  const handleReload = () => {
    const ref = webViewRefs.current[activeTabId];
    if (ref) ref.reload();
  };

  const handleStop = () => {
    const ref = webViewRefs.current[activeTabId];
    if (ref) ref.stopLoading();
    updateTab(activeTabId, { isLoading: false, progress: 0 });
  };

  // Shortcuts
  const handleAddShortcut = async (title: string, url: string) => {
    const newItem: ShortcutItem = {
      id: 'sc_' + Date.now(),
      title,
      url,
      iconName: 'globe',
    };
    const updated = [...shortcuts, newItem];
    setShortcuts(updated);
    await StorageService.saveShortcuts(updated);
    setToast({ message: `Added "${title}" to Speed Dial`, type: 'success' });
  };

  const handleDeleteShortcut = async (id: string) => {
    const updated = shortcuts.filter((s) => s.id !== id);
    setShortcuts(updated);
    await StorageService.saveShortcuts(updated);
    setToast({ message: 'Shortcut removed', type: 'info' });
  };

  // Settings & Toggles
  const handleUpdateSettings = async (newSettings: Partial<BrowserSettings>) => {
    const updated = await StorageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleToggleNightMode = () => {
    const newVal = !settings.nightModeEnabled;
    handleUpdateSettings({ nightModeEnabled: newVal });
    const ref = webViewRefs.current[activeTabId];
    if (ref) {
      ref.injectJavaScript(getNightModeScript(newVal));
    }
    setToast({
      message: newVal ? 'Night Mode enabled' : 'Night Mode disabled',
      type: 'info',
    });
  };

  const handleToggleAdBlock = () => {
    const newVal = !settings.adBlockEnabled;
    handleUpdateSettings({ adBlockEnabled: newVal });
    setToast({
      message: newVal ? 'AdBlocker ON' : 'AdBlocker OFF',
      type: 'info',
    });
  };

  const handleToggleDesktopSite = () => {
    const newVal = !settings.desktopSite;
    handleUpdateSettings({ desktopSite: newVal });
    setToast({
      message: newVal ? 'Desktop Site ON' : 'Mobile Site ON',
      type: 'info',
    });
    setTimeout(() => handleReload(), 150);
  };

  const handleAddBookmark = async () => {
    if (isHomePage) {
      setToast({ message: 'Cannot bookmark Home page', type: 'warning' });
      return;
    }
    await StorageService.addBookmark({
      title: activeTab.title || activeTab.url,
      url: activeTab.url,
    });
    setToast({ message: 'Saved to Bookmarks', type: 'success' });
  };

  // Video Assistant & Dialog
  const handleOpenVideoAssistant = (video: DetectedVideo) => {
    const title = video.title || 'Web Video';
    const isHls = video.isHls || video.src.includes('.m3u8');

    // Build format options
    const downloadOptions = video.formats && video.formats.length > 0
      ? video.formats.map((fmt) => ({
          label: fmt.quality,
          subLabel: fmt.subLabel || (fmt.ext ? fmt.ext.toUpperCase() : 'MP4'),
          onSelect: async () => {
            setDetectedVideo(null);
            const ext = fmt.ext || 'mp4';
            const safeName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${fmt.quality.replace(/[^a-zA-Z0-9]/g, '')}.${ext}`;
            const targetUrl = fmt.url || video.src;
            await DownloadService.startDownload(targetUrl, safeName, ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
            setToast({
              message: `Downloading ${fmt.quality}: "${title.substring(0, 20)}..."`,
              type: 'download',
            });
          },
        }))
      : [
          {
            label: '720p HD (MP4)',
            subLabel: isHls ? 'HLS Stream to MP4' : 'Direct High Quality',
            onSelect: async () => {
              setDetectedVideo(null);
              const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '_720p.mp4';
              await DownloadService.startDownload(video.src, safeName, 'video/mp4');
              setToast({
                message: `Downloading 720p HD: "${title.substring(0, 20)}..."`,
                type: 'download',
              });
            },
          },
          {
            label: '480p Standard (MP4)',
            subLabel: 'Fast Download',
            onSelect: async () => {
              setDetectedVideo(null);
              const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '_480p.mp4';
              await DownloadService.startDownload(video.src, safeName, 'video/mp4');
              setToast({
                message: `Downloading 480p: "${title.substring(0, 20)}..."`,
                type: 'download',
              });
            },
          },
        ];

    setDialog({
      title: 'Download Video',
      message: `${title}\nFormat: ${isHls ? 'HLS Stream (.m3u8 -> .mp4)' : 'MP4 Video Stream'}`,
      icon: 'video',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Download',
          style: 'default',
          onPress: async () => {
            setDetectedVideo(null);
            const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.mp4';
            await DownloadService.startDownload(video.src, safeName, 'video/mp4');
            setToast({
              message: `Download started: "${title.substring(0, 25)}..."`,
              type: 'download',
            });
          },
        },
      ],
      options: downloadOptions,
    });
  };

  const handleFloatingPlay = (video: DetectedVideo) => {
    setToast({ message: 'Picture-in-Picture mode active', type: 'info' });
  };

  // Prompt Download Dialog for any generic file link (.apk, .zip, .pdf, .mp4, etc.)
  const promptFileDownload = (url: string, suggestedName?: string, mimeType?: string) => {
    const fileName = DownloadService.extractFileName(url, suggestedName);
    const category = DownloadService.detectCategory(fileName, mimeType);

    setDialog({
      title: 'Download File',
      message: `File: ${fileName}\nCategory: ${category.toUpperCase()}`,
      icon: category === 'video' ? 'video' : category === 'apk' ? 'download' : 'file',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Download',
          style: 'default',
          onPress: async () => {
            setDialog(null);
            await DownloadService.startDownload(url, fileName, mimeType);
            setToast({
              message: `Downloading: "${fileName.substring(0, 22)}..."`,
              type: 'download',
            });
          },
        },
      ],
    });
  };

  // Extract clean in-browser Google Play Store web URL from intent/market/web links
  const extractPlayStoreWebUrl = (rawUrl: string): string | null => {
    if (!rawUrl) return null;

    // 1. Direct Web Play Store URL
    if (rawUrl.startsWith('http://play.google.com') || rawUrl.startsWith('https://play.google.com')) {
      return rawUrl;
    }

    // 2. intent://play.google.com/...
    if (rawUrl.startsWith('intent://play.google.com')) {
      return rawUrl.replace(/^intent:\/\//, 'https://').split('#Intent;')[0].split('#intent;')[0];
    }

    // 3. Fallback URL inside intent
    const fallbackMatch = rawUrl.match(/browser_fallback_url=([^;]+)/);
    if (fallbackMatch) {
      const decoded = decodeURIComponent(fallbackMatch[1]);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        return decoded;
      }
    }

    // 4. Data parameter inside intent
    const dataMatch = rawUrl.match(/data=([^;]+)/);
    if (dataMatch) {
      const decoded = decodeURIComponent(dataMatch[1]);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        return decoded;
      }
    }

    // 5. App package ID inside URL (e.g. details?id=com.google.android.youtube or market://details?id=...)
    const idMatch = rawUrl.match(/[?&]id=([^&;#]+)/) || rawUrl.match(/\/details\?id=([^&;#]+)/) || rawUrl.match(/details\?id=([^&;#]+)/);
    if (idMatch && idMatch[1] && idMatch[1] !== 'com.android.vending') {
      return `https://play.google.com/store/apps/details?id=${idMatch[1]}`;
    }

    // 6. Package name if not vending
    const packageMatch = rawUrl.match(/package=([^;]+)/);
    if (packageMatch && packageMatch[1] && packageMatch[1] !== 'com.android.vending') {
      return `https://play.google.com/store/apps/details?id=${packageMatch[1]}`;
    }

    return null;
  };

  // In-Browser Scheme Translator: Keeps all navigation inside the browser
  const handleExternalAppScheme = (url: string) => {
    try {
      const playStoreUrl = extractPlayStoreWebUrl(url);
      if (playStoreUrl) {
        updateTab(activeTabId, { url: playStoreUrl, title: 'Google Play Store' });
        return;
      }

      if (url.startsWith('intent://')) {
        const schemeMatch = url.match(/scheme=([^;]+)/);
        if (schemeMatch && (schemeMatch[1] === 'http' || schemeMatch[1] === 'https')) {
          const webUrl = schemeMatch[1] + '://' + url.replace(/^intent:\/\//, '').split('#')[0];
          updateTab(activeTabId, { url: webUrl, title: webUrl });
          return;
        }
      }

      // If it's a telephone or email link, open native handler
      if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('sms:')) {
        Linking.openURL(url).catch(() => {});
      }
    } catch (err) {
      console.warn('In-browser scheme navigation:', err);
    }
  };

  // Intercept downloads and external app schemes
  // Intercept downloads, ad networks, and external app schemes
  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    if (!url) return false;

    // 0. High-Priority AdBlock Filter
    if (settings.adBlockEnabled && isAdUrl(url)) {
      return false;
    }

    // 1. Intent / Market Schemes -> Translate to In-Browser Web URL
    if (url.startsWith('intent:') || url.startsWith('market:')) {
      const playStoreUrl = extractPlayStoreWebUrl(url);
      if (playStoreUrl) {
        updateTab(activeTabId, { url: playStoreUrl, title: 'Google Play Store' });
      } else {
        handleExternalAppScheme(url);
      }
      return false;
    }

    // 2. Direct HTTP/HTTPS Play Store URL loads directly in browser
    if (url.startsWith('https://play.google.com') || url.startsWith('http://play.google.com')) {
      return true;
    }

    // 3. Other non-web custom schemes (tel:, mailto:, sms:, etc.)
    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('sms:') ||
      (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:') && !url.startsWith('blob:') && !url.startsWith('uc://'))
    ) {
      handleExternalAppScheme(url);
      return false;
    }

    // 4. Direct downloadable file links (.apk, .zip, .pdf, .mp4, etc.)
    const lowerClean = url.toLowerCase().split('?')[0].split('#')[0];
    const downloadableExts = [
      '.apk', '.zip', '.rar', '.7z', '.tar', '.gz', '.pdf',
      '.mp4', '.mp3', '.mkv', '.avi', '.mov', '.webm', '.m4v',
      '.iso', '.exe', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
    ];
    const isDownloadFile = downloadableExts.some((ext) => lowerClean.endsWith(ext));
    if (
      isDownloadFile &&
      !url.includes('google.com/search') &&
      !url.includes('bing.com') &&
      !url.includes('duckduckgo.com')
    ) {
      promptFileDownload(url);
      return false;
    }

    return true;
  };

  // WebView message dispatcher
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MEDIA_DETECTED' && data.payload) {
        setDetectedVideo(data.payload);
      } else if (data.type === 'DOWNLOAD_REQUEST' && data.payload) {
        promptFileDownload(data.payload.url, data.payload.fileName, data.payload.mimeType);
      }
    } catch {}
  };

  // Build injected JavaScript bundle for DOM ready
  const injectedBundle = `
    ${settings.adBlockEnabled ? AD_BLOCK_JS : ''}
    ${MEDIA_SNIFFER_JS}
    ${getNightModeScript(settings.nightModeEnabled)}
    true;
  `;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isDark ? styles.safeAreaDark : styles.safeAreaLight,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? COLORS.incognitoBg : '#FFFFFF'}
      />

      {/* 1. Header Search Bar */}
      <HeaderSearchBar
        url={activeTab?.url || 'uc://home'}
        isLoading={activeTab?.isLoading || false}
        progress={activeTab?.progress || 0}
        isIncognito={activeTab?.isIncognito || false}
        searchEngine={settings.searchEngine}
        onSearch={handleSearchOrNavigate}
        onReload={handleReload}
        onStop={handleStop}
        onChangeEngine={(engine) => handleUpdateSettings({ searchEngine: engine })}
      />

      {/* 2. Floating Video Assistant Bar (when video is detected) */}
      {detectedVideo && (
        <VideoAssistantBar
          video={detectedVideo}
          onDownload={handleOpenVideoAssistant}
          onFloatingPlay={handleFloatingPlay}
          onDismiss={() => setDetectedVideo(null)}
        />
      )}

      {/* 3. Main Body Container */}
      <View style={styles.bodyContainer}>
        {isHomePage ? (
          /* Classic UC Speed Dial & News Homepage */
          <ScrollView
            style={[styles.homeScroll, isDark ? styles.homeScrollDark : styles.homeScrollLight]}
            showsVerticalScrollIndicator={false}
          >
            {/* Speed Dial Grid */}
            <SpeedDialGrid
              shortcuts={shortcuts}
              isIncognito={activeTab?.isIncognito || false}
              onSelectShortcut={handleSearchOrNavigate}
              onAddShortcut={handleAddShortcut}
              onDeleteShortcut={handleDeleteShortcut}
            />

            {/* UC News Stream */}
            <NewsFeedSection
              isIncognito={activeTab?.isIncognito || false}
              onOpenArticle={handleSearchOrNavigate}
            />
          </ScrollView>
        ) : (
          /* Web Rendering Engine */
          <WebView
            ref={(ref) => {
              webViewRefs.current[activeTabId] = ref;
            }}
            source={{ uri: activeTab.initialUrl || activeTab.url }}
            style={styles.webView}
            injectedJavaScriptBeforeContentLoaded={MEDIA_SNIFFER_JS}
            injectedJavaScriptBeforeContentLoaded={`
              ${settings.adBlockEnabled ? AD_BLOCK_JS : ''}
              ${MEDIA_SNIFFER_JS}
              true;
            `}
            injectedJavaScript={injectedBundle}
            userAgent={
              settings.desktopSite
                ? UC_USER_AGENTS.desktop
                : UC_USER_AGENTS.mobile
            }
            javaScriptEnabled={true}
            domStorageEnabled={true}
            databaseEnabled={true}
            cacheEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            allowsBackForwardNavigationGestures={true}
            mixedContentMode="always"
            androidHardwareAccelerationDisabled={false}
            androidLayerType="hardware"
            originWhitelist={['*']}
            setSupportMultipleWindows={true}
            onOpenWindow={(syntheticEvent) => {
              const { targetUrl } = syntheticEvent.nativeEvent;
              if (targetUrl && targetUrl !== 'about:blank') {
                if (settings.adBlockEnabled && isAdUrl(targetUrl)) {
                  return; // Block ad/popup window
                }
                handleNewTab(activeTab?.isIncognito || false, targetUrl);
              }
            }}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={(navState) => {
              updateTab(activeTabId, {
                canGoBack: navState.canGoBack,
                canGoForward: navState.canGoForward,
                url: navState.url,
                title: navState.title || navState.url,
                isLoading: navState.loading,
              });

              if (
                !activeTab?.isIncognito &&
                settings.saveHistory &&
                navState.url &&
                !navState.url.startsWith('about:') &&
                !navState.url.startsWith('uc://')
              ) {
                StorageService.addHistory({
                  title: navState.title || navState.url,
                  url: navState.url,
                });
              }
            }}
            onLoadEnd={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (
                !activeTab?.isIncognito &&
                settings.saveHistory &&
                nativeEvent.url &&
                !nativeEvent.url.startsWith('about:') &&
                !nativeEvent.url.startsWith('uc://')
              ) {
                StorageService.addHistory({
                  title: nativeEvent.title || nativeEvent.url,
                  url: nativeEvent.url,
                });
              }
            }}
            onLoadProgress={({ nativeEvent }) => {
              updateTab(activeTabId, { progress: nativeEvent.progress });
            }}
            onMessage={handleWebViewMessage}
            renderError={() => (
              <View style={[styles.webView, { backgroundColor: isDark ? COLORS.incognitoBg : '#FFFFFF' }]} />
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              // Ignore benign / non-fatal chunk disconnects or unknown app schemes
              if (
                nativeEvent.description &&
                (nativeEvent.description.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') ||
                 nativeEvent.description.includes('ERR_UNKNOWN_URL_SCHEME') ||
                 nativeEvent.description.includes('ERR_ABORTED') ||
                 nativeEvent.description.includes('ERR_BLOCKED_BY_CLIENT'))
              ) {
                return;
              }
              console.warn('WebView notice: ', nativeEvent.description || nativeEvent);
            }}
          />
        )}
      </View>

      {/* 4. Bottom Toolbar (5 Classic Buttons) */}
      <BottomToolbar
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        tabCount={tabs.length}
        isIncognito={activeTab?.isIncognito || false}
        onGoBack={() => {
          const ref = webViewRefs.current[activeTabId];
          if (ref) ref.goBack();
        }}
        onGoForward={() => {
          const ref = webViewRefs.current[activeTabId];
          if (ref) ref.goForward();
        }}
        onGoHome={handleGoHome}
        onOpenTabs={() => setIsTabSwitcherOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* 5. UC Menu Drawer (9/12 Grid Modal) */}
      <UCMenuDrawer
        visible={isMenuOpen}
        isIncognito={activeTab?.isIncognito || false}
        settings={settings}
        activeDownloadsCount={0}
        onClose={() => setIsMenuOpen(false)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenBookmarksHistory={() => setIsBookmarksHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleNightMode={handleToggleNightMode}
        onToggleAdBlock={handleToggleAdBlock}
        onToggleIncognito={() => {
          const nextIncognito = !activeTab.isIncognito;
          updateTab(activeTabId, { isIncognito: nextIncognito });
          setIsIncognitoView(nextIncognito);
          setToast({
            message: nextIncognito ? 'Incognito Mode enabled' : 'Switched to Normal Tab',
            type: 'info',
          });
        }}
        onToggleDesktopSite={handleToggleDesktopSite}
        onToggleNoImage={() => {
          const newVal = !settings.noImageMode;
          handleUpdateSettings({ noImageMode: newVal });
          setToast({
            message: newVal ? 'No Image Mode ON' : 'No Image Mode OFF',
            type: 'info',
          });
        }}
        onToggleSpeedMode={() => {
          const newVal = !settings.speedMode;
          handleUpdateSettings({ speedMode: newVal });
          setToast({
            message: newVal ? 'Speed Mode ON' : 'Speed Mode OFF',
            type: 'info',
          });
        }}
        onToggleFullScreen={() => {}}
        onRefreshPage={handleReload}
        onAddBookmark={handleAddBookmark}
        onExitApp={() => BackHandler.exitApp()}
      />

      {/* 6. Multi-Tab Switcher Modal */}
      <TabSwitcherModal
        visible={isTabSwitcherOpen}
        tabs={tabs}
        activeTabId={activeTabId}
        isIncognitoMode={isIncognitoView}
        onSelectTab={(id) => {
          setActiveTabId(id);
          const t = tabs.find((tab) => tab.id === id);
          if (t) setIsIncognitoView(t.isIncognito);
        }}
        onCloseTab={handleCloseTab}
        onNewTab={(incognito) => handleNewTab(incognito)}
        onCloseAllTabs={handleCloseAllTabs}
        onToggleIncognitoView={(incognito) => setIsIncognitoView(incognito)}
        onCloseModal={() => setIsTabSwitcherOpen(false)}
      />

      {/* 7. Download Manager Screen */}
      <DownloadManagerScreen
        visible={isDownloadsOpen}
        isIncognito={activeTab?.isIncognito || false}
        onClose={() => setIsDownloadsOpen(false)}
      />

      {/* 8. Bookmarks & History Screen */}
      <BookmarksHistoryScreen
        visible={isBookmarksHistoryOpen}
        isIncognito={activeTab?.isIncognito || false}
        onClose={() => setIsBookmarksHistoryOpen(false)}
        onOpenUrl={(url) => {
          handleSearchOrNavigate(url);
          setIsBookmarksHistoryOpen(false);
        }}
      />

      {/* 9. Settings Screen */}
      <SettingsScreen
        visible={isSettingsOpen}
        isIncognito={activeTab?.isIncognito || false}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 10. Professional Custom UC Dialog & Toast */}
      <UCDialog dialog={dialog} isDark={isDark} onClose={() => setDialog(null)} />
      <UCToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaLight: {
    backgroundColor: '#FFFFFF',
  },
  safeAreaDark: {
    backgroundColor: COLORS.incognitoBg,
  },
  bodyContainer: {
    flex: 1,
    position: 'relative',
  },
  homeScroll: {
    flex: 1,
  },
  homeScrollLight: {
    backgroundColor: '#F6F7FA',
  },
  homeScrollDark: {
    backgroundColor: COLORS.incognitoBg,
  },
  webView: {
    flex: 1,
  },
});
