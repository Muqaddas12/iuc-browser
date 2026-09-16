import { ShortcutItem } from '../types/browser';

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: 'google',
    title: 'Google',
    url: 'https://www.google.com',
    iconName: 'google',
    iconColor: '#4285F4',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    url: 'https://m.youtube.com',
    iconName: 'youtube',
    iconColor: '#FF0000',
    badge: 'HOT',
  },
  {
    id: 'facebook',
    title: 'Facebook',
    url: 'https://m.facebook.com',
    iconName: 'facebook',
    iconColor: '#1877F2',
  },
  {
    id: 'amazon',
    title: 'Amazon',
    url: 'https://www.amazon.com',
    iconName: 'shopping-cart',
    iconColor: '#FF9900',
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    url: 'https://en.m.wikipedia.org',
    iconName: 'book-open',
    iconColor: '#555555',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    url: 'https://www.instagram.com',
    iconName: 'instagram',
    iconColor: '#E1306C',
  },
  {
    id: 'cricbuzz',
    title: 'Cricket',
    url: 'https://m.cricbuzz.com',
    iconName: 'activity',
    iconColor: '#009270',
    badge: 'LIVE',
  },
  {
    id: 'twitter',
    title: 'X (Twitter)',
    url: 'https://mobile.twitter.com',
    iconName: 'twitter',
    iconColor: '#1DA1F2',
  },
];

