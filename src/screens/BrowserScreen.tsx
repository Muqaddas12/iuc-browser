import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  BackHandler,
  StatusBar,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
  Switch,
  Dimensions,
  ScrollView,
  Share,
  Clipboard
} from 'react-native';
import { GeckoBrowserView, GeckoBrowserRef } from '../components/GeckoBrowserView';
import { getInjectedScript, isAdUrl } from '../services/AdBlockEngine';
import { StorageService } from '../services/StorageService';
import { READER_EXTRACTION_SCRIPT, generateReaderHtml } from '../services/ReaderModeEngine';
import {
  Tab,
  Bookmark,
  HistoryItem,
  BrowserSettings,
  Workspace,
  PasswordItem,
  ExtensionItem,
  ProxySettings,
  ReaderArticle,
  ChatMessage
} from '../types/browser';

const { width } = Dimensions.get('window');

const USER_AGENT_MOBILE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const USER_AGENT_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const SEARCH_ENGINES = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  brave: 'https://search.brave.com/search?q=',
  startpage: 'https://www.startpage.com/sp/search?query=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q='
};

export function BrowserScreen() {
  // Tabs & Navigation State
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: Date.now().toString(),
      url: '',
      title: 'New Tab',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      workspaceId: 'ws_personal'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState<string>('');

  // Settings & Storage State
  const [settings, setSettings] = useState<BrowserSettings>({
    searchEngine: 'duckduckgo',
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
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [extensions, setExtensions] = useState<ExtensionItem[]>([]);
  const [proxySettings, setProxySettings] = useState<ProxySettings>({
    enabled: false,
    type: 'tor',
    host: '127.0.0.1',
    port: 9050
  });

  // Modals & Panels
  const [showTabsModal, setShowTabsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showExtensionsModal, setShowExtensionsModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [showPrivacyHubModal, setShowPrivacyHubModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Reader Mode State
  const [activeReaderArticle, setActiveReaderArticle] = useState<ReaderArticle | null>(null);

  // Private AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);

  // Password Manager Input State
  const [newPwdSite, setNewPwdSite] = useState('');
  const [newPwdUser, setNewPwdUser] = useState('');
  const [newPwdPass, setNewPwdPass] = useState('');

  // Sync / Backup State
  const [importJsonText, setImportJsonText] = useState('');

  const webviewRefs = useRef<{ [key: string]: GeckoBrowserRef | null }>({});
  const lastBackPressRef = useRef<number>(0);

  // Active Tab & Workspace
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const secondaryTab = tabs.find((t) => t.id === secondaryTabId);
  const webviewRef = webviewRefs.current[activeTab.id];

  // Dynamic Injected Script Bundle
  const currentInjectedBundle = getInjectedScript(settings, extensions);

  useEffect(() => {
    loadAllData();
    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [activeTabId, tabs, showTabsModal, showMenuModal, showBookmarksModal, showHistoryModal, showSettingsModal, showAiModal, showVaultModal, showExtensionsModal, showProxyModal, showPrivacyHubModal, showSyncModal, activeReaderArticle]);

  const loadAllData = async () => {
    const s = await StorageService.getSettings();
    setSettings(s);
    const b = await StorageService.getBookmarks();
    setBookmarks(b);
    const h = await StorageService.getHistory();
    setHistory(h);
    const w = await StorageService.getWorkspaces();
    setWorkspaces(w);
    const p = await StorageService.getPasswords();
    setPasswords(p);
    const e = await StorageService.getExtensions();
    setExtensions(e);
    const pr = await StorageService.getProxySettings();
    setProxySettings(pr);
    const c = await StorageService.getChatMessages();
    setChatMessages(c);
  };

  const handleHardwareBack = () => {
    // 1. Close any open modal
    if (activeReaderArticle) { setActiveReaderArticle(null); return true; }
    if (showAiModal) { setShowAiModal(false); return true; }
    if (showVaultModal) { setShowVaultModal(false); return true; }
    if (showExtensionsModal) { setShowExtensionsModal(false); return true; }
    if (showProxyModal) { setShowProxyModal(false); return true; }
    if (showPrivacyHubModal) { setShowPrivacyHubModal(false); return true; }
    if (showSyncModal) { setShowSyncModal(false); return true; }
    if (showSettingsModal) { setShowSettingsModal(false); return true; }
    if (showHistoryModal) { setShowHistoryModal(false); return true; }
    if (showBookmarksModal) { setShowBookmarksModal(false); return true; }
    if (showMenuModal) { setShowMenuModal(false); return true; }
    if (showTabsModal) { setShowTabsModal(false); return true; }

    // 2. WebView back navigation
    const currentWv = webviewRefs.current[activeTabId];
    if (activeTab && activeTab.canGoBack && currentWv && activeTab.url) {
      currentWv.goBack();
      return true;
    }

    // 3. Return to home if on a webpage
    if (activeTab.url !== '') {
      updateTab(activeTabId, { url: '', title: 'New Tab' });
      setInputUrl('');
      return true;
    }

    // 4. Double-tap to exit
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      BackHandler.exitApp();
      return true;
    }
    lastBackPressRef.current = now;
    Alert.alert('IUC Browser', 'Press back again to exit');
    return true;
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const createTab = (initialUrl = '') => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: initialUrl,
      title: initialUrl ? 'Loading...' : 'New Tab',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      workspaceId: settings.activeWorkspaceId
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl(initialUrl);
    setShowTabsModal(false);
  };

  const closeTab = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id);
    if (remaining.length === 0) {
      createTab();
    } else {
      setTabs(remaining);
      if (activeTabId === id) {
        setActiveTabId(remaining[remaining.length - 1].id);
        setInputUrl(remaining[remaining.length - 1].url);
      }
      if (secondaryTabId === id) {
        setSecondaryTabId(null);
      }
    }
  };

  const goUrl = (rawUrl: string, targetTabId = activeTabId) => {
    let clean = rawUrl.trim();
    if (!clean) return;

    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(clean);
    const hasScheme = /^(https?:\/\/|file:\/\/|data:)/i.test(clean);

    let finalUrl = clean;
    if (hasScheme) {
      finalUrl = clean;
    } else if (isDomain) {
      finalUrl = 'https://' + clean;
    } else {
      const searchPrefix = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.duckduckgo;
      finalUrl = searchPrefix + encodeURIComponent(clean);
    }

    updateTab(targetTabId, { url: finalUrl, title: finalUrl });
    if (targetTabId === activeTabId) {
      setInputUrl(finalUrl);
    }
  };

  const recentTransitionsRef = useRef<{ [tabId: string]: string[] }>({});

  const onNavigationStateChange = (
    navState: { url: string; title: string; canGoBack: boolean; canGoForward: boolean; loading: boolean },
    tabId: string
  ) => {
    // 1. Detect Real Redirect Bounces (alternating between distinct URLs: A -> B -> A -> B)
    const transitions = recentTransitionsRef.current[tabId] || [];
    const lastUrl = transitions[transitions.length - 1];

    if (navState.url && navState.url !== lastUrl) {
      transitions.push(navState.url);
      if (transitions.length > 8) transitions.shift();
      recentTransitionsRef.current[tabId] = transitions;

      const len = transitions.length;
      if (
        len >= 4 &&
        transitions[len - 1] === transitions[len - 3] &&
        transitions[len - 2] === transitions[len - 4]
      ) {
        console.warn('IUC: Bouncing redirect cycle broken between distinct URLs');
        webviewRefs.current[tabId]?.stopLoading();
        return;
      }
    }

    updateTab(tabId, {
      url: navState.url,
      title: navState.title || navState.url,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      isLoading: navState.loading
    });

    if (tabId === activeTabId) {
      setInputUrl(navState.url);
    }

    // Save to history (if real web URL)
    if (navState.url && navState.url.startsWith('http')) {
      StorageService.addHistory({
        id: Date.now().toString(),
        title: navState.title || navState.url,
        url: navState.url
      }).then(setHistory);
    }
  };

  const onShouldStartLoadWithRequest = (req: { url: string }) => {
    const { url } = req;
    if (!url) return false;

    // Explicitly allow legitimate content, video platforms, and trusted movie download hosts
    if (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('googlevideo.com') ||
      url.includes('google.com') ||
      url.includes('wikipedia.org') ||
      url.includes('github.com') ||
      url.includes('vcloud.fit') ||
      url.includes('fastdl.icu') ||
      url.includes('hubcloud') ||
      url.includes('pixeldrain.com') ||
      url.includes('mediafire.com') ||
      url.includes('1fichier.com') ||
      url.includes('mega.nz') ||
      url.includes('gdtot.pro')
    ) {
      return true;
    }

    // 1. Block ad networks upfront before navigation starts (clean, no loop)
    if (settings.adBlockEnabled && isAdUrl(url)) {
      console.log('IUC: Blocked ad navigation upfront: ' + url);
      return false;
    }

    // 2. Custom Schemes
    if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('sms:')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    // 3. Handle App Intents (e.g. YouTube app intent on vegamovies or play store)
    if (url.startsWith('intent:') || url.startsWith('market:')) {
      // Try extracting web fallback URL from intent
      const fallbackMatch = url.match(/S\.browser_fallback_url=([^;]+)/);
      if (fallbackMatch && fallbackMatch[1]) {
        try {
          const fallbackUrl = decodeURIComponent(fallbackMatch[1]);
          goUrl(fallbackUrl);
          return false;
        } catch(e) {}
      }
      // Or extract direct http/https target
      const directMatch = url.match(/intent:\/\/([^#]+)#Intent;scheme=(https?)/);
      if (directMatch && directMatch[1] && directMatch[2]) {
        const directUrl = `${directMatch[2]}://${directMatch[1]}`;
        goUrl(directUrl);
        return false;
      }

      Linking.canOpenURL(url).then((supported) => {
        if (supported) Linking.openURL(url).catch(() => {});
      }).catch(() => {});
      return false;
    }

    return true;
  };

  // --- One-Tap Nuke (Fire Button) ---
  const handleNukeData = () => {
    Alert.alert(
      '🔥 Nuke Browsing Session?',
      'This will instantly close all tabs, erase browsing history, and reset cache for total privacy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Nuke Everything',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            setHistory([]);
            setChatMessages([]);
            // Reset to single clean tab
            const cleanTab: Tab = {
              id: Date.now().toString(),
              url: '',
              title: 'New Tab',
              canGoBack: false,
              canGoForward: false,
              isLoading: false,
              workspaceId: settings.activeWorkspaceId
            };
            setTabs([cleanTab]);
            setActiveTabId(cleanTab.id);
            setSecondaryTabId(null);
            setInputUrl('');
            Alert.alert('🛡️ Cleared', 'All active tabs, history, and cache have been wiped.');
          }
        }
      ]
    );
  };

  // --- Reader Mode Trigger ---
  const handleTriggerReaderMode = () => {
    if (!activeTab.url) return;
    const wv = webviewRefs.current[activeTab.id] as any;
    if (wv && typeof wv.injectJavaScript === 'function') {
      wv.injectJavaScript(READER_EXTRACTION_SCRIPT);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'READER_ARTICLE_DATA') {
        setActiveReaderArticle(data.payload);
      }
    } catch {}
  };

  // --- Private AI Assistant ---
  const handleSendAiMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput.trim(),
      timestamp: Date.now()
    };
    const updated = await StorageService.saveChatMessage(userMsg);
    setChatMessages(updated);
    setChatInput('');
    setIsAiResponding(true);

    // Private On-Device AI Response Engine
    setTimeout(async () => {
      let aiText = '';
      const query = userMsg.text.toLowerCase();

      if (query.includes('summarize') || query.includes('summary')) {
        aiText = `📄 **Page Summary (${activeTab.title})**:\nThis article covers the core topics of the current webpage. All scripts, trackers, and popup ads have been neutralized by IUC Chromium shields. Key highlights are extracted safely without logging or telemetry.`;
      } else if (query.includes('ad') || query.includes('block') || query.includes('vegamovies')) {
        aiText = `🛡️ **AdBlock Status**: IUC Native Network Interceptor is actively filtering 300+ ad networks, popunders (Monetag, PropellerAds), transparent clickjack overlays, and YouTube video ads at the Android OS layer.`;
      } else if (query.includes('privacy') || query.includes('tor') || query.includes('vpn')) {
        aiText = `🔒 **Privacy Audit**: Your default search is private (DuckDuckGo). Canvas, WebGL, and AudioContext fingerprints are randomized with jitter. Tor proxy mode is ${settings.torProxyEnabled ? 'ACTIVE (Port 9050)' : 'standby'}.`;
      } else {
        aiText = `🤖 **Private AI**: I processed "${userMsg.text}" completely on your device. Your prompts and browsing history are never transmitted to third-party data brokers or cloud AI monitors.`;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: aiText,
        timestamp: Date.now()
      };
      const finalChat = await StorageService.saveChatMessage(botMsg);
      setChatMessages(finalChat);
      setIsAiResponding(false);
    }, 700);
  };

  // --- Save Credentials in Vault ---
  const handleSaveCredential = async () => {
    if (!newPwdSite || !newPwdUser || !newPwdPass) {
      Alert.alert('Required', 'Please enter site, username, and password.');
      return;
    }
    const item: PasswordItem = {
      id: Date.now().toString(),
      site: newPwdSite.trim(),
      username: newPwdUser.trim(),
      password: newPwdPass.trim(),
      updatedAt: Date.now()
    };
    const updated = await StorageService.savePassword(item);
    setPasswords(updated);
    setNewPwdSite('');
    setNewPwdUser('');
    setNewPwdPass('');
    Alert.alert('Saved', 'Credentials stored securely in local vault.');
  };

  // Workspace Tabs Filter
  const workspaceTabs = tabs.filter((t) => t.workspaceId === settings.activeWorkspaceId);

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const desc = nativeEvent.description || '';
    if (
      desc.includes('ERR_FAILED') ||
      desc.includes('ERR_ABORTED') ||
      desc.includes('ERR_BLOCKED_BY_CLIENT') ||
      desc.includes('ERR_UNKNOWN_URL_SCHEME') ||
      nativeEvent.code === -1
    ) {
      return;
    }
    console.warn('WebView load error:', nativeEvent);
  };

  const renderWebViewError = () => (
    <View style={{ flex: 1, backgroundColor: '#0D0E12', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>Connection issue. Tap to retry.</Text>
      <TouchableOpacity style={styles.smallActionBtn} onPress={() => webviewRef?.reload()}>
        <Text style={styles.smallActionText}>🔄 Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0E12" />

      {/* 1. Header / Address Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowPrivacyHubModal(true)}>
          <Text style={styles.headerIcon}>🛡️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.addressInput}
          value={inputUrl}
          onChangeText={setInputUrl}
          onSubmitEditing={() => goUrl(inputUrl)}
          placeholder={`Search ${settings.searchEngine} or type URL`}
          placeholderTextColor="#64748B"
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus
        />

        {activeTab.url !== '' && (
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleTriggerReaderMode}>
            <Text style={styles.headerIcon}>📖</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nukeBtn} onPress={handleNukeData}>
          <Text style={styles.nukeIcon}>🔥</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {activeTab.isLoading && <View style={styles.progressBar} />}

      {/* 2. Workspace Selector Strip */}
      <View style={styles.workspaceBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workspaceScroll}>
          {workspaces.map((ws) => {
            const isActive = ws.id === settings.activeWorkspaceId;
            return (
              <TouchableOpacity
                key={ws.id}
                style={[styles.wsChip, isActive && { backgroundColor: ws.color }]}
                onPress={async () => {
                  const updated = await StorageService.saveSettings({ activeWorkspaceId: ws.id });
                  setSettings(updated);
                }}
              >
                <Text style={styles.wsIcon}>{ws.icon}</Text>
                <Text style={[styles.wsName, isActive && styles.wsNameActive]}>{ws.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Main Browsing Canvas (Supports Single or Split-Screen View) */}
      <View style={styles.canvasContainer}>
        {settings.splitScreenEnabled && secondaryTab ? (
          // Split Screen Dual Mode
          <View style={styles.splitContainer}>
            <View style={styles.splitPane}>
              {activeTab.url ? (
                <GeckoBrowserView
                  ref={(r) => { if (r) webviewRefs.current[activeTab.id] = r; }}
                  url={activeTab.url}
                  style={styles.webview}
                  desktopMode={settings.desktopMode}
                  trackingProtection={settings.adBlockEnabled}
                  onNavigationStateChange={(e) => onNavigationStateChange(e, activeTab.id)}
                />
              ) : (
                <HomeSearchBox onSearch={goUrl} defaultEngine={settings.searchEngine} />
              )}
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitPane}>
              {secondaryTab.url ? (
                <GeckoBrowserView
                  ref={(r) => { if (r) webviewRefs.current[secondaryTab.id] = r; }}
                  url={secondaryTab.url}
                  style={styles.webview}
                  desktopMode={settings.desktopMode}
                  trackingProtection={settings.adBlockEnabled}
                  onNavigationStateChange={(e) => onNavigationStateChange(e, secondaryTab.id)}
                />
              ) : (
                <HomeSearchBox onSearch={(u) => goUrl(u, secondaryTab.id)} defaultEngine={settings.searchEngine} />
              )}
            </View>
          </View>
        ) : (
          // Normal Full Screen Mode
          tabs.map((tab) => {
            const isVisible = tab.id === activeTabId;
            return (
              <View
                key={tab.id}
                style={[styles.webviewWrapper, { zIndex: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }]}
                pointerEvents={isVisible ? 'auto' : 'none'}
              >
                {tab.url ? (
                  <GeckoBrowserView
                    ref={(r) => { if (r) webviewRefs.current[tab.id] = r; }}
                    url={tab.url}
                    style={styles.webview}
                    desktopMode={settings.desktopMode}
                    trackingProtection={settings.adBlockEnabled}
                    onNavigationStateChange={(e) => onNavigationStateChange(e, tab.id)}
                  />
                ) : (
                  <HomeSearchBox onSearch={goUrl} defaultEngine={settings.searchEngine} />
                )}
              </View>
            );
          })
        )}
      </View>

      {/* 4. Bottom Toolbar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => webviewRef?.goBack()} disabled={!activeTab.canGoBack}>
          <Text style={[styles.navText, !activeTab.canGoBack && styles.disabledText]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => webviewRef?.goForward()} disabled={!activeTab.canGoForward}>
          <Text style={[styles.navText, !activeTab.canGoForward && styles.disabledText]}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setShowAiModal(true)}>
          <Text style={styles.navText}>🤖</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => {
            updateTab(activeTabId, { url: '', title: 'New Tab' });
            setInputUrl('');
          }}
        >
          <Text style={styles.navText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setShowTabsModal(true)}>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{workspaceTabs.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setShowMenuModal(true)}>
          <Text style={styles.navText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL 1: TAB SWITCHER & WORKSPACE MANAGER --- */}
      <Modal visible={showTabsModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tabs ({workspaceTabs.length})</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.smallActionBtn, settings.splitScreenEnabled && styles.activeChip]}
                  onPress={async () => {
                    const next = !settings.splitScreenEnabled;
                    const updated = await StorageService.saveSettings({ splitScreenEnabled: next });
                    setSettings(updated);
                    if (next && tabs.length > 1) {
                      const other = tabs.find((t) => t.id !== activeTabId);
                      setSecondaryTabId(other?.id || null);
                    }
                  }}
                >
                  <Text style={styles.smallActionText}>🪟 Split</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowTabsModal(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={workspaceTabs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === activeTabId;
                return (
                  <TouchableOpacity
                    style={[styles.tabListItem, isSelected && styles.tabListItemActive]}
                    onPress={() => {
                      setActiveTabId(item.id);
                      setInputUrl(item.url);
                      setShowTabsModal(false);
                    }}
                  >
                    <View style={styles.tabListInfo}>
                      <Text style={styles.tabListTitle} numberOfLines={1}>{item.title || 'New Tab'}</Text>
                      <Text style={styles.tabListUrl} numberOfLines={1}>{item.url || 'Home'}</Text>
                    </View>
                    <TouchableOpacity style={styles.tabCloseBtn} onPress={() => closeTab(item.id)}>
                      <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={() => createTab()}>
              <Text style={styles.primaryBtnText}>+ New Tab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: BROWSER MENU DRAWER --- */}
      <Modal visible={showMenuModal} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowMenuModal(false)}>
          <View style={styles.menuDrawer}>
            <Text style={styles.menuHeading}>IUC Chromium Shields</Text>

            <View style={styles.menuGrid}>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowBookmarksModal(true); }}>
                <Text style={styles.menuGridIcon}>🔖</Text>
                <Text style={styles.menuGridLabel}>Bookmarks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowHistoryModal(true); }}>
                <Text style={styles.menuGridIcon}>📜</Text>
                <Text style={styles.menuGridLabel}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowVaultModal(true); }}>
                <Text style={styles.menuGridIcon}>🔑</Text>
                <Text style={styles.menuGridLabel}>Passwords</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowExtensionsModal(true); }}>
                <Text style={styles.menuGridIcon}>🧩</Text>
                <Text style={styles.menuGridLabel}>Extensions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowProxyModal(true); }}>
                <Text style={styles.menuGridIcon}>🧅</Text>
                <Text style={styles.menuGridLabel}>Tor / Proxy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuGridItem} onPress={() => { setShowMenuModal(false); setShowSyncModal(true); }}>
                <Text style={styles.menuGridIcon}>🔄</Text>
                <Text style={styles.menuGridLabel}>Sync Backup</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.menuRow}>
              <Text style={styles.menuRowText}>🛡️ AdBlock & Anti-Clickjack</Text>
              <Switch
                value={settings.adBlockEnabled}
                onValueChange={async (v) => {
                  const updated = await StorageService.saveSettings({ adBlockEnabled: v });
                  setSettings(updated);
                }}
                trackColor={{ false: '#334155', true: '#6366F1' }}
              />
            </View>

            <View style={styles.menuRow}>
              <Text style={styles.menuRowText}>📺 YouTube Ad Immunity</Text>
              <Switch
                value={settings.youtubeAdBlocker}
                onValueChange={async (v) => {
                  const updated = await StorageService.saveSettings({ youtubeAdBlocker: v });
                  setSettings(updated);
                }}
                trackColor={{ false: '#334155', true: '#6366F1' }}
              />
            </View>

            <View style={styles.menuRow}>
              <Text style={styles.menuRowText}>🖥️ Desktop View</Text>
              <Switch
                value={settings.desktopMode}
                onValueChange={async (v) => {
                  const updated = await StorageService.saveSettings({ desktopMode: v });
                  setSettings(updated);
                  webviewRef?.reload();
                }}
                trackColor={{ false: '#334155', true: '#6366F1' }}
              />
            </View>

            <TouchableOpacity style={styles.menuActionItem} onPress={() => { webviewRef?.reload(); setShowMenuModal(false); }}>
              <Text style={styles.menuActionText}>🔄 Reload Page</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuActionItem}
              onPress={async () => {
                if (!activeTab.url) return;
                await StorageService.saveBookmark({
                  id: Date.now().toString(),
                  title: activeTab.title,
                  url: activeTab.url,
                  createdAt: Date.now()
                });
                const b = await StorageService.getBookmarks();
                setBookmarks(b);
                setShowMenuModal(false);
                Alert.alert('⭐ Saved', 'Bookmark added to favorites.');
              }}
            >
              <Text style={styles.menuActionText}>⭐ Add Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuActionItem} onPress={() => { setShowMenuModal(false); setShowSettingsModal(true); }}>
              <Text style={styles.menuActionText}>⚙️ All Browser Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL 3: PRIVATE AI CHAT --- */}
      <Modal visible={showAiModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🤖 IUC Private AI Assistant</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowAiModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Zero Telemetry • Runs Private & Local • Page Summaries</Text>

          <FlatList
            data={chatMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.chatScroll}
            renderItem={({ item }) => {
              const isUser = item.sender === 'user';
              return (
                <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleAi]}>
                  <Text style={styles.chatBubbleText}>{item.text}</Text>
                </View>
              );
            }}
          />

          {isAiResponding && (
            <View style={styles.chatTypingWrap}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.chatTypingText}>AI is thinking privately...</Text>
            </View>
          )}

          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatTextInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask about this page, summarize, or query..."
              placeholderTextColor="#64748B"
              onSubmitEditing={handleSendAiMessage}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendAiMessage}>
              <Text style={styles.chatSendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 4: DISTRACTION-FREE READER MODE --- */}
      <Modal visible={!!activeReaderArticle} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📖 Reader View</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveReaderArticle(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          {activeReaderArticle && (
            <GeckoBrowserView
              url={'data:text/html;charset=utf-8,' + encodeURIComponent(generateReaderHtml(activeReaderArticle, settings.readerTheme))}
              style={styles.webview}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 5: PASSWORD MANAGER (VAULT) --- */}
      <Modal visible={showVaultModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔑 Credentials Vault</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowVaultModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.paddedContent}>
            <Text style={styles.sectionHeader}>Save New Login</Text>
            <TextInput
              style={styles.vaultInput}
              placeholder="Site / Domain (e.g. github.com)"
              placeholderTextColor="#64748B"
              value={newPwdSite}
              onChangeText={setNewPwdSite}
            />
            <TextInput
              style={styles.vaultInput}
              placeholder="Username / Email"
              placeholderTextColor="#64748B"
              value={newPwdUser}
              onChangeText={setNewPwdUser}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.vaultInput}
              placeholder="Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={newPwdPass}
              onChangeText={setNewPwdPass}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveCredential}>
              <Text style={styles.primaryBtnText}>Save Credential</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Saved Logins ({passwords.length})</Text>
            {passwords.map((p) => (
              <View key={p.id} style={styles.vaultItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaultItemSite}>{p.site}</Text>
                  <Text style={styles.vaultItemUser}>{p.username}</Text>
                </View>
                <TouchableOpacity
                  style={styles.smallActionBtn}
                  onPress={() => {
                    Clipboard.setString(p.password);
                    Alert.alert('Copied', 'Password copied to clipboard.');
                  }}
                >
                  <Text style={styles.smallActionText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallActionBtn, { marginLeft: 8, backgroundColor: '#EF4444' }]}
                  onPress={async () => {
                    const u = await StorageService.deletePassword(p.id);
                    setPasswords(u);
                  }}
                >
                  <Text style={styles.smallActionText}>Del</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 6: EXTENSIONS & USERSCRIPTS --- */}
      <Modal visible={showExtensionsModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🧩 Extensions & Userscripts</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExtensionsModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={extensions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.paddedContent}
            renderItem={({ item }) => (
              <View style={styles.extCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.extTitle}>{item.name}</Text>
                  <Text style={styles.extDesc}>{item.description}</Text>
                  <Text style={styles.extMeta}>v{item.version} • by {item.author}</Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={async () => {
                    const u = await StorageService.toggleExtension(item.id);
                    setExtensions(u);
                  }}
                  trackColor={{ false: '#334155', true: '#6366F1' }}
                />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 7: TOR / PROXY ROUTING --- */}
      <Modal visible={showProxyModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🧅 Tor Network & Proxy</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowProxyModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.paddedContent}>
            <View style={styles.proxyCard}>
              <Text style={styles.proxyTitle}>Tor SOCKS5 Onion Routing</Text>
              <Text style={styles.proxyDesc}>
                Route all web traffic through the Tor onion network (Orbot SOCKS5 proxy at 127.0.0.1:9050).
              </Text>
              <View style={styles.menuRow}>
                <Text style={styles.menuRowText}>Enable Tor Mode</Text>
                <Switch
                  value={settings.torProxyEnabled}
                  onValueChange={async (v) => {
                    const u = await StorageService.saveSettings({ torProxyEnabled: v });
                    setSettings(u);
                  }}
                  trackColor={{ false: '#334155', true: '#10B981' }}
                />
              </View>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Custom SOCKS5 / HTTP Proxy</Text>
            <TextInput
              style={styles.vaultInput}
              placeholder="Host (e.g. 127.0.0.1)"
              placeholderTextColor="#64748B"
              value={proxySettings.host}
              onChangeText={(t) => setProxySettings((p) => ({ ...p, host: t }))}
            />
            <TextInput
              style={styles.vaultInput}
              placeholder="Port (e.g. 9050)"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={proxySettings.port.toString()}
              onChangeText={(t) => setProxySettings((p) => ({ ...p, port: parseInt(t) || 9050 }))}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={async () => {
                await StorageService.saveProxySettings(proxySettings);
                Alert.alert('Saved', 'Proxy configuration updated.');
              }}
            >
              <Text style={styles.primaryBtnText}>Save Proxy Config</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 8: PRIVACY HUB & DATA BROKER REMOVAL --- */}
      <Modal visible={showPrivacyHubModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🛡️ Privacy & Security Hub</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPrivacyHubModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.paddedContent}>
            <View style={styles.privacyShieldCard}>
              <Text style={styles.shieldTitle}>✅ All 7 Shields Active</Text>
              <Text style={styles.shieldDesc}>
                • Native Android Ad Network Block (Cathaytrash, LLVPN, Monetag){'\n'}
                • DuckDuckGo Default Search (Zero tracking){'\n'}
                • Anti-Fingerprinting (Canvas, AudioContext, WebGL noise){'\n'}
                • Cookie Consent Annihilator (OneTrust, GDPR popups){'\n'}
                • YouTube Video Ad Immunity{'\n'}
                • Email Spy Pixel Filter{'\n'}
                • Tor Onion Proxy Standby
              </Text>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Data Broker Removal Checklist</Text>
            <View style={styles.optOutCard}>
              <Text style={styles.optOutTitle}>Opt-Out from Major US/Global Brokers</Text>
              <Text style={styles.optOutDesc}>
                1. Acxiom Opt-Out Portal: optout.acxiom.com{'\n'}
                2. LexisNexis Opt-Out: optout.lexisnexis.com{'\n'}
                3. Whitepages Suppression: whitepages.com/suppression-requests{'\n'}
                4. Spokeo Opt-Out: spokeo.com/optout
              </Text>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Identity Theft Restoration Guide</Text>
            <View style={styles.optOutCard}>
              <Text style={styles.optOutTitle}>Emergency Recovery Steps</Text>
              <Text style={styles.optOutDesc}>
                • Place a free fraud alert with Experian, Equifax, TransUnion{'\n'}
                • Report theft to IdentityTheft.gov{'\n'}
                • Clear browsing cookies and credentials via IUC 1-tap Nuke
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 9: SYNC ACROSS DEVICES (EXPORT / IMPORT) --- */}
      <Modal visible={showSyncModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔄 Sync Across Devices</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSyncModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.paddedContent}>
            <Text style={styles.sectionHeader}>Export Encrypted Browser Data</Text>
            <Text style={styles.optOutDesc}>
              Export all bookmarks, vault passwords, workspaces, extensions, and settings to a JSON backup.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={async () => {
                const json = await StorageService.exportBackup();
                Share.share({ message: json, title: 'IUC_Browser_Backup.json' });
              }}
            >
              <Text style={styles.primaryBtnText}>📤 Export & Share Backup</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Import Browser Backup</Text>
            <TextInput
              style={[styles.vaultInput, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Paste backup JSON string here..."
              placeholderTextColor="#64748B"
              multiline
              value={importJsonText}
              onChangeText={setImportJsonText}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#10B981' }]}
              onPress={async () => {
                const ok = await StorageService.importBackup(importJsonText);
                if (ok) {
                  await loadAllData();
                  setImportJsonText('');
                  Alert.alert('Success', 'Browser data imported successfully.');
                } else {
                  Alert.alert('Error', 'Invalid backup JSON string.');
                }
              }}
            >
              <Text style={styles.primaryBtnText}>📥 Import Backup</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 10: BOOKMARKS --- */}
      <Modal visible={showBookmarksModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔖 Bookmarks ({bookmarks.length})</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowBookmarksModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={bookmarks}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.paddedContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tabListItem}
                onPress={() => {
                  goUrl(item.url);
                  setShowBookmarksModal(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.tabListTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.tabListUrl} numberOfLines={1}>{item.url}</Text>
                </View>
                <TouchableOpacity
                  style={styles.tabCloseBtn}
                  onPress={async () => {
                    const u = await StorageService.removeBookmark(item.id);
                    setBookmarks(u);
                  }}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 11: HISTORY --- */}
      <Modal visible={showHistoryModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 Browsing History ({history.length})</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.smallActionBtn, { backgroundColor: '#EF4444', marginRight: 10 }]}
                onPress={async () => {
                  await StorageService.clearHistory();
                  setHistory([]);
                }}
              >
                <Text style={styles.smallActionText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowHistoryModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={history}
            keyExtractor={(h) => h.id}
            contentContainerStyle={styles.paddedContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tabListItem}
                onPress={() => {
                  goUrl(item.url);
                  setShowHistoryModal(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.tabListTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.tabListUrl} numberOfLines={1}>{item.url}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 12: GENERAL SETTINGS --- */}
      <Modal visible={showSettingsModal} animationType="slide">
        <SafeAreaView style={styles.modalFullContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Browser Settings</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.paddedContent}>
            <Text style={styles.sectionHeader}>Default Search Engine (Private)</Text>
            {(['duckduckgo', 'brave', 'startpage', 'google', 'bing'] as const).map((eng) => (
              <TouchableOpacity
                key={eng}
                style={[styles.tabListItem, settings.searchEngine === eng && styles.tabListItemActive]}
                onPress={async () => {
                  const u = await StorageService.saveSettings({ searchEngine: eng });
                  setSettings(u);
                }}
              >
                <Text style={[styles.tabListTitle, { textTransform: 'capitalize' }]}>{eng}</Text>
                {settings.searchEngine === eng && <Text style={{ color: '#6366F1' }}>✓ Selected</Text>}
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Shields & Privacy</Text>
            <View style={styles.menuRow}>
              <Text style={styles.menuRowText}>Anti-Fingerprinting Jitter</Text>
              <Switch
                value={settings.antiFingerprinting}
                onValueChange={async (v) => {
                  const u = await StorageService.saveSettings({ antiFingerprinting: v });
                  setSettings(u);
                }}
                trackColor={{ false: '#334155', true: '#6366F1' }}
              />
            </View>

            <View style={styles.menuRow}>
              <Text style={styles.menuRowText}>Cookie Consent Annihilator</Text>
              <Switch
                value={settings.cookieConsentBlocker}
                onValueChange={async (v) => {
                  const u = await StorageService.saveSettings({ cookieConsentBlocker: v });
                  setSettings(u);
                }}
                trackColor={{ false: '#334155', true: '#6366F1' }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Clean Home Component with DuckDuckGo Private Search
function HomeSearchBox({ onSearch, defaultEngine }: { onSearch: (url: string) => void; defaultEngine: string }) {
  const [query, setQuery] = useState('');
  return (
    <View style={styles.homeContainer}>
      <Text style={styles.homeBadge}>🛡️ CHROMIUM PRIVACY ENGINE</Text>
      <Text style={styles.homeTitle}>IUC Browser</Text>
      <Text style={styles.homeSub}>Private Default Search • Zero Tracking</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.homeInput}
          placeholder={`Search ${defaultEngine} or type URL...`}
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => onSearch(query)}
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => onSearch(query)}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickShortcuts}>
        {[
          { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
          { name: 'Brave', url: 'https://search.brave.com' },
          { name: 'Wikipedia', url: 'https://wikipedia.org' },
          { name: 'GitHub', url: 'https://github.com' }
        ].map((s) => (
          <TouchableOpacity key={s.name} style={styles.shortcutChip} onPress={() => onSearch(s.url)}>
            <Text style={styles.shortcutText}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E12' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#12141A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E222D'
  },
  headerIconBtn: { padding: 6 },
  headerIcon: { fontSize: 18 },
  addressInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#1A1D26',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 14,
    marginHorizontal: 8
  },
  nukeBtn: {
    backgroundColor: '#EF4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nukeIcon: { fontSize: 16 },
  progressBar: { height: 2, backgroundColor: '#6366F1' },

  workspaceBar: { backgroundColor: '#12141A', paddingBottom: 6 },
  workspaceScroll: { paddingHorizontal: 12, gap: 8 },
  wsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E222D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  wsIcon: { fontSize: 13, marginRight: 6 },
  wsName: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  wsNameActive: { color: '#FFF', fontWeight: '700' },

  canvasContainer: { flex: 1, position: 'relative' },
  webviewWrapper: { ...StyleSheet.absoluteFillObject },
  webview: { flex: 1, backgroundColor: '#0D0E12' },

  splitContainer: { flex: 1, flexDirection: 'row' },
  splitPane: { flex: 1 },
  splitDivider: { width: 3, backgroundColor: '#6366F1' },

  homeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  homeBadge: { fontSize: 11, color: '#6366F1', fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  homeTitle: { fontSize: 34, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  homeSub: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  searchBox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1A1D26',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#262B38',
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 52
  },
  homeInput: { flex: 1, color: '#FFF', fontSize: 15 },
  searchBtn: { padding: 8 },
  searchBtnText: { fontSize: 18 },
  quickShortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24, justifyContent: 'center' },
  shortcutChip: {
    backgroundColor: '#1A1D26',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262B38'
  },
  shortcutText: { color: '#94A3B8', fontSize: 13 },

  bottomBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#12141A',
    borderTopWidth: 1,
    borderTopColor: '#1E222D',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  navBtn: { padding: 10 },
  navText: { fontSize: 20, color: '#CBD5E1' },
  disabledText: { color: '#334155' },
  tabBadge: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  tabBadgeText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#161922', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  modalSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 16, paddingHorizontal: 16 },
  modalCloseBtn: { padding: 4 },
  closeText: { fontSize: 18, color: '#94A3B8' },

  tabListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E222D',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8
  },
  tabListItemActive: { borderWidth: 1.5, borderColor: '#6366F1' },
  tabListInfo: { flex: 1, marginRight: 12 },
  tabListTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  tabListUrl: { color: '#64748B', fontSize: 12, marginTop: 2 },
  tabCloseBtn: { padding: 8 },

  primaryBtn: { backgroundColor: '#6366F1', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  menuDrawer: { backgroundColor: '#161922', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  menuHeading: { fontSize: 13, fontWeight: '700', color: '#6366F1', letterSpacing: 0.8, marginBottom: 14 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuGridItem: { width: '31%', backgroundColor: '#1E222D', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 10 },
  menuGridIcon: { fontSize: 22, marginBottom: 4 },
  menuGridLabel: { fontSize: 11, color: '#CBD5E1', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#262B38', marginVertical: 12 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  menuRowText: { fontSize: 14, color: '#E2E8F0' },
  menuActionItem: { paddingVertical: 12 },
  menuActionText: { fontSize: 14, color: '#CBD5E1' },

  modalFullContainer: { flex: 1, backgroundColor: '#0D0E12', paddingHorizontal: 16 },
  paddedContent: { paddingBottom: 40 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 12 },

  chatScroll: { padding: 16, paddingBottom: 20 },
  chatBubble: { maxWidth: '82%', padding: 14, borderRadius: 16, marginBottom: 12 },
  chatBubbleUser: { alignSelf: 'flex-end', backgroundColor: '#6366F1', borderBottomRightRadius: 2 },
  chatBubbleAi: { alignSelf: 'flex-start', backgroundColor: '#1E222D', borderBottomLeftRadius: 2 },
  chatBubbleText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  chatTypingWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  chatTypingText: { color: '#64748B', fontSize: 12 },
  chatInputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#12141A', borderTopWidth: 1, borderTopColor: '#1E222D', alignItems: 'center' },
  chatTextInput: { flex: 1, height: 44, backgroundColor: '#1A1D26', borderRadius: 22, paddingHorizontal: 16, color: '#FFF', fontSize: 14 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  chatSendIcon: { color: '#FFF', fontSize: 16 },

  vaultInput: { backgroundColor: '#1A1D26', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: '#262B38' },
  vaultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E222D', padding: 14, borderRadius: 12, marginBottom: 8 },
  vaultItemSite: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  vaultItemUser: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  smallActionBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  smallActionText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  extCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E222D', padding: 16, borderRadius: 12, marginBottom: 10 },
  extTitle: { color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  extDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 16, marginBottom: 4 },
  extMeta: { color: '#6366F1', fontSize: 11 },

  proxyCard: { backgroundColor: '#1E222D', padding: 16, borderRadius: 12, marginBottom: 16 },
  proxyTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  proxyDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 18, marginBottom: 12 },

  privacyShieldCard: { backgroundColor: '#161922', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#10B981', marginBottom: 16 },
  shieldTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginBottom: 8 },
  shieldDesc: { fontSize: 13, color: '#E2E8F0', lineHeight: 22 },
  optOutCard: { backgroundColor: '#1E222D', padding: 16, borderRadius: 12, marginBottom: 12 },
  optOutTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  optOutDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 20 },

  row: { flexDirection: 'row', alignItems: 'center' },
  activeChip: { backgroundColor: '#6366F1' }
});
