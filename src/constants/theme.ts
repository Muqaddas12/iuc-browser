export const COLORS = {
  primary: '#FF5B00', // Signature UC Browser Orange
  primaryDark: '#E04E00',
  primaryLight: '#FFF0E6',
  accent: '#FF8A3D',

  backgroundLight: '#F5F6F8',
  cardLight: '#FFFFFF',
  textLight: '#1C1C1E',
  textSecondaryLight: '#7C7C80',
  borderLight: '#E8E8EC',

  backgroundDark: '#121212',
  cardDark: '#1E1E1E',
  textDark: '#F2F2F7',
  textSecondaryDark: '#98989E',
  borderDark: '#2C2C2E',

  incognitoBg: '#1A1325',
  incognitoCard: '#261C36',
  incognitoPrimary: '#9D4EDD',
  incognitoAccent: '#C77DFF',

  bottomBarBgLight: '#FFFFFF',
  bottomBarBgDark: '#18181A',
  bottomBarBorderLight: '#E2E2E6',
  bottomBarBorderDark: '#28282B',

  menuIconBgLight: '#F4F4F6',
  menuIconBgDark: '#262629',

  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  blue: '#007AFF',
  purple: '#5856D6',
};

export const UC_USER_AGENTS = {
  mobile: 'Mozilla/5.0 (Linux; U; Android 13; en-US; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 UCBrowser/13.4.0.1306 Mobile Safari/537.36',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

export const SEARCH_ENGINES: Record<string, { name: string; url: string; suggestUrl: string; icon: string }> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&q=',
    icon: 'search',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    suggestUrl: 'https://api.bing.com/osjson.aspx?query=',
    icon: 'globe',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    suggestUrl: 'https://duckduckgo.com/ac/?q=',
    icon: 'shield',
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    suggestUrl: 'https://search.yahoo.com/sugg/gfls?output=json&command=',
    icon: 'compass',
  },
};

