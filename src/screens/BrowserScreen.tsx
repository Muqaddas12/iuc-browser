import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
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
import { MEDIA_SNIFFER_JS } from '../services/MediaSniffer';
import { getNightModeScript } from '../services/NightModeEngine';

export const BrowserScreen: React.FC = () => {
  // State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab_default_1',
      url: 'uc://home',
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
      if (dialog) {
        setDialog(null);
        return true;
      }
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

      // Handle WebView back navigation
      const currentRef = webViewRefs.current[activeTabId];
      if (currentRef && activeTab && activeTab.canGoBack) {
        currentRef.goBack();
        return true;
      }

      if (!isHomePage) {
        handleGoHome();
        return true;
      }

      return false;
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
    updateTab(activeTabId, { url: finalUrl, title: finalUrl });
  };

  const handleGoHome = () => {
    setDetectedVideo(null);
    updateTab(activeTabId, {
      url: 'uc://home',
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
    // Inject night mode CSS immediately into active tab
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
    handleUpdateSettings({ adBlockEnabled: !settings.adBlockEnabled });
    const newVal = !settings.adBlockEnabled;
    handleUpdateSettings({ adBlockEnabled: newVal });
    setToast({
      message: newVal ? 'AdBlocker ON' : 'AdBlocker OFF',
      type: 'info',
    });
  };

  const handleToggleDesktopSite = () => {
    handleUpdateSettings({ desktopSite: !settings.desktopSite });
    setTimeout(() => handleReload(), 100);
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
      Alert.alert('Bookmark', 'Cannot bookmark the home speed dial page.');
      setToast({ message: 'Cannot bookmark Home page', type: 'warning' });
      return;
    }
    await StorageService.addBookmark({
      title: activeTab.title || activeTab.url,
      url: activeTab.url,
    });
    Alert.alert('Bookmarked', `"${activeTab.title || activeTab.url}" has been added to bookmarks.`);
    setToast({ message: 'Saved to Bookmarks', type: 'success' });
  };

  // Video Assistant
  const handleDownloadDetectedVideo = async (video: DetectedVideo) => {
    setDetectedVideo(null);
    await DownloadService.startDownload(video.src, (video.title || 'video') + '.mp4', 'video/mp4');
    Alert.alert('Download Started', `Downloading "${video.title || 'video'}" in background.`);
  // Video Assistant & Dialog
  const handleOpenVideoAssistant = (video: DetectedVideo) => {
    const title = video.title || 'Web Video';
    const isHls = video.src.includes('.m3u8');

    setDialog({
      title: 'Download Video',
      message: `${title}\nFormat: ${isHls ? 'HLS Stream (Converting to MP4)' : 'MP4 HD Video'}`,
      icon: 'video',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Download',
          style: 'default',
          onPress: async () => {
            setDetectedVideo(null);
            const safeName = (title.replace(/[^a-zA-Z0-9_-]/g, '_')) + '.mp4';
            await DownloadService.startDownload(video.src, safeName, 'video/mp4');
            setToast({
              message: `Download started: "${title.substring(0, 25)}..."`,
              type: 'download',
            });
          },
        },
      ],
      options: [
        {
          label: '720p HD (MP4)',
          subLabel: isHls ? 'HLS High' : 'Direct Stream',
          onSelect: async () => {
            setDetectedVideo(null);
            const safeName = (title.replace(/[^a-zA-Z0-9_-]/g, '_')) + '_720p.mp4';
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
            const safeName = (title.replace(/[^a-zA-Z0-9_-]/g, '_')) + '_480p.mp4';
            await DownloadService.startDownload(video.src, safeName, 'video/mp4');
            setToast({
              message: `Downloading 480p: "${title.substring(0, 20)}..."`,
              type: 'download',
            });
          },
        },
      ],
    });
  };

  const handleFloatingPlay = (video: DetectedVideo) => {
    Alert.alert('PiP Floating Mode', 'Floating Video player activated.');
    setToast({ message: 'Picture-in-Picture mode active', type: 'info' });
  };

  // WebView message dispatcher (Media Sniffer & Native Hooks)
  // WebView message dispatcher
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MEDIA_DETECTED' && data.payload) {
        setDetectedVideo(data.payload);
      }
    } catch {}
  };

  // Build injected JavaScript bundle
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
          onDownload={handleDownloadDetectedVideo}
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
            source={{ uri: activeTab.url }}
            style={styles.webView}
            injectedJavaScript={injectedBundle}
            userAgent={
              settings.desktopSite
                ? UC_USER_AGENTS.desktop
                : UC_USER_AGENTS.mobile
            }
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsBackForwardNavigationGestures={true}
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
            onLoadProgress={({ nativeEvent }) => {
              updateTab(activeTabId, { progress: nativeEvent.progress });
            }}
            onMessage={handleWebViewMessage}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
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
        onToggleNoImage={() => handleUpdateSettings({ noImageMode: !settings.noImageMode })}
        onToggleSpeedMode={() => handleUpdateSettings({ speedMode: !settings.speedMode })}
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

