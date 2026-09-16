export interface NewsItem {
  id: string;
  category: 'headlines' | 'tech' | 'cricket' | 'entertainment';
  title: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
  articleUrl: string;
}

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    category: 'headlines',
    title: 'Global Tech Breakthrough: New Next-Gen AI Models Announced',
    source: 'TechSphere',
    timeAgo: '15m ago',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    articleUrl: 'https://news.google.com',
  },
  {
    id: 'news-2',
    category: 'cricket',
    title: 'World Cup Thriller: Final Over Drama Seals Dramatic Victory',
    source: 'CricLive',
    timeAgo: '32m ago',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60',
    articleUrl: 'https://m.cricbuzz.com',
  },
  {
    id: 'news-3',
    category: 'tech',
    title: 'Smartphone Revolution: Foldable Displays and High-Density Batteries',
    source: 'GadgetDaily',
    timeAgo: '1h ago',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
    articleUrl: 'https://www.theverge.com',
  },
  {
    id: 'news-4',
    category: 'entertainment',
    title: 'Blockbuster Cinema Sets Worldwide Box Office Record on Opening Weekend',
    source: 'CinemaScope',
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60',
    articleUrl: 'https://www.imdb.com',
  },
];

