export interface Tab {
  id: string;
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  workspaceId: string;
  isReaderMode?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PasswordItem {
  id: string;
  site: string;
  username: string;
  password: string;
  updatedAt: number;
}

export interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  script?: string;
  author?: string;
  version?: string;
  isBuiltIn?: boolean;
}

export interface ProxySettings {
  enabled: boolean;
  type: 'tor' | 'socks5' | 'http';
  host: string;
  port: number;
}

export interface DataBrokerItem {
  id: string;
  name: string;
  category: string;
  optOutUrl: string;
  status: 'pending' | 'submitted' | 'removed';
}

export interface BreachReport {
  email: string;
  checkedAt: number;
  breachesCount: number;
  breachedSites: string[];
}

export interface ReaderArticle {
  title: string;
  byline?: string;
  content: string;
  readingTimeMinutes: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface BrowserSettings {
  searchEngine: 'duckduckgo' | 'brave' | 'startpage' | 'google' | 'bing';
  adBlockEnabled: boolean;
  desktopMode: boolean;
  antiFingerprinting: boolean;
  cookieConsentBlocker: boolean;
  youtubeAdBlocker: boolean;
  emailSpyPixelBlocker: boolean;
  vpnMode: 'off' | 'doh_cloudflare' | 'doh_quad9' | 'tor';
  torProxyEnabled: boolean;
  torProxyPort: number;
  splitScreenEnabled: boolean;
  verticalTabsEnabled: boolean;
  readerTheme: 'dark' | 'sepia' | 'light';
  activeWorkspaceId: string;
}
