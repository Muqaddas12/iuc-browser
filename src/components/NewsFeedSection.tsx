import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SAMPLE_NEWS, NewsItem } from '../constants/newsData';
import { COLORS } from '../constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

interface NewsFeedSectionProps {
  isIncognito: boolean;
  onOpenArticle: (url: string) => void;
}

type CategoryType = 'headlines' | 'tech' | 'cricket' | 'entertainment';

export const NewsFeedSection: React.FC<NewsFeedSectionProps> = ({
  isIncognito,
  onOpenArticle,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('headlines');

  const isDark = isIncognito;

  const categories: { key: CategoryType; label: string }[] = [
    { key: 'headlines', label: 'Headlines' },
    { key: 'cricket', label: 'Cricket' },
    { key: 'tech', label: 'Tech' },
    { key: 'entertainment', label: 'Cinema' },
  ];

  const filteredNews = SAMPLE_NEWS.filter(
    (item) => item.category === activeCategory || activeCategory === 'headlines'
  );

  return (
    <View style={styles.container}>
      {/* Category Pills Header */}
      <View style={styles.categoryHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? isDark
                      ? styles.categoryPillSelectedDark
                      : styles.categoryPillSelectedLight
                    : isDark
                    ? styles.categoryPillDark
                    : styles.categoryPillLight,
                ]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected
                      ? styles.categoryTextSelected
                      : isDark
                      ? styles.categoryTextDark
                      : styles.categoryTextLight,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* News Feed Card List */}
      <View style={styles.newsList}>
        {filteredNews.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.newsCard, isDark ? styles.newsCardDark : styles.newsCardLight]}
            activeOpacity={0.7}
            onPress={() => onOpenArticle(item.articleUrl)}
          >
            <View style={styles.cardContent}>
              <Text
                style={[styles.newsTitle, isDark ? styles.newsTitleDark : styles.newsTitleLight]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.sourceText}>{item.source}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.timeText}>{item.timeAgo}</Text>
              </View>
            </View>

            <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryPillLight: {
    backgroundColor: '#ECECF0',
  },
  categoryPillDark: {
    backgroundColor: '#271C3D',
  },
  categoryPillSelectedLight: {
    backgroundColor: COLORS.primary,
  },
  categoryPillSelectedDark: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextLight: {
    color: '#55555C',
  },
  categoryTextDark: {
    color: '#B0ADC0',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  newsList: {
    marginTop: 4,
  },
  newsCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  newsCardLight: {
    backgroundColor: '#FFFFFF',
  },
  newsCardDark: {
    backgroundColor: '#241938',
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 8,
  },
  newsTitleLight: {
    color: '#1C1C1E',
  },
  newsTitleDark: {
    color: '#F0EEF8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dotSeparator: {
    fontSize: 11,
    color: '#8E8E93',
    marginHorizontal: 5,
  },
  timeText: {
    fontSize: 11.5,
    color: '#8E8E93',
  },
  newsImage: {
    width: 78,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#DDD',
  },
});

