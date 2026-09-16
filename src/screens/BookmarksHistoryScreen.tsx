import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Bookmark, HistoryItem } from '../types/browser';
import { COLORS } from '../constants/theme';
import { StorageService } from '../services/StorageService';
import { UCDialog, DialogConfig } from '../components/UCDialog';
import { UCToast, ToastConfig } from '../components/UCToast';

interface BookmarksHistoryScreenProps {
  visible: boolean;
  isIncognito: boolean;
  onClose: () => void;
  onOpenUrl: (url: string) => void;
}

export const BookmarksHistoryScreen: React.FC<BookmarksHistoryScreenProps> = ({
  visible,
  isIncognito,
  onClose,
  onOpenUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const loadData = async () => {
    const bms = await StorageService.getBookmarks();
    const hists = await StorageService.getHistory();
    setBookmarks(bms);
    setHistory(hists);
  };

  useEffect(() => {
    if (visible) {
      loadData();
      setSearchQuery('');
    }
  }, [visible]);

  const isDark = isIncognito;

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteBookmark = async (id: string) => {
    await StorageService.removeBookmark(id);
    loadData();
    setToast({ message: 'Bookmark removed', type: 'info' });
  };

  const handleDeleteHistory = async (id: string) => {
    await StorageService.removeHistoryItem(id);
    loadData();
    setToast({ message: 'History item removed', type: 'info' });
  };

  const handleClearHistory = () => {
    setDialog({
      title: 'Clear History',
      message: 'Are you sure you want to clear all browsing history?',
      icon: 'trash',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearHistory();
            loadData();
            setToast({ message: 'Browsing history cleared', type: 'success' });
          },
        },
      ],
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Header */}
        <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={24} color={isDark ? '#FFF' : '#222'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>
            {activeTab === 'bookmarks' ? 'Bookmarks' : 'History'}
          </Text>
          {activeTab === 'history' && history.length > 0 ? (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, isDark ? styles.tabBarDark : styles.tabBarLight]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookmarks' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookmarks')}
          >
            <Text
              style={[
                styles.tabBtnText,
                isDark ? styles.tabBtnTextDark : styles.tabBtnTextLight,
                activeTab === 'bookmarks' && styles.tabBtnTextActive,
              ]}
            >
              Bookmarks ({bookmarks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabBtnText,
                isDark ? styles.tabBtnTextDark : styles.tabBtnTextLight,
                activeTab === 'history' && styles.tabBtnTextActive,
              ]}
            >
              History ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
          <Feather name="search" size={16} color={isDark ? '#888' : '#AAA'} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={isDark ? '#888' : '#AAA'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {activeTab === 'bookmarks' ? (
          <FlatList
            data={filteredBookmarks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.itemCard, isDark ? styles.itemCardDark : styles.itemCardLight]}
                activeOpacity={0.7}
                onPress={() => {
                  onOpenUrl(item.url);
                  onClose();
                }}
              >
                <View style={styles.iconCircle}>
                  <Feather name="star" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, isDark && { color: '#FFF' }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemUrl} numberOfLines={1}>
                    {item.url}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDeleteBookmark(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#888" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="bookmark" size={48} color={isDark ? '#443460' : '#C0C0C8'} />
                <Text style={[styles.emptyText, isDark && { color: '#888' }]}>No bookmarks yet</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.itemCard, isDark ? styles.itemCardDark : styles.itemCardLight]}
                activeOpacity={0.7}
                onPress={() => {
                  onOpenUrl(item.url);
                  onClose();
                }}
              >
                <View style={styles.iconCircle}>
                  <Feather name="clock" size={18} color="#007AFF" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, isDark && { color: '#FFF' }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemUrl} numberOfLines={1}>
                    {item.url}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDeleteHistory(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#888" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="clock" size={48} color={isDark ? '#443460' : '#C0C0C8'} />
                <Text style={[styles.emptyText, isDark && { color: '#888' }]}>No browsing history</Text>
              </View>
            }
          />
        )}

        <UCDialog dialog={dialog} isDark={isDark} onClose={() => setDialog(null)} />
        <UCToast toast={toast} onDismiss={() => setToast(null)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F3F4F8',
  },
  containerDark: {
    backgroundColor: COLORS.incognitoBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 12,
    borderBottomWidth: 0.8,
  },
  headerLight: {
    backgroundColor: '#FFF',
    borderBottomColor: '#E4E4EA',
  },
  headerDark: {
    backgroundColor: '#1E1430',
    borderBottomColor: '#30204C',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  tabBarLight: {
    backgroundColor: '#FFF',
    borderBottomColor: '#E4E4EA',
  },
  tabBarDark: {
    backgroundColor: '#201633',
    borderBottomColor: '#30204C',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBtnTextLight: {
    color: '#666',
  },
  tabBtnTextDark: {
    color: '#AAA',
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchBoxLight: {
    backgroundColor: '#EBEBF0',
  },
  searchBoxDark: {
    backgroundColor: '#291E3F',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  searchInputLight: {
    color: '#1C1C1E',
  },
  searchInputDark: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  itemCardLight: {
    backgroundColor: '#FFF',
  },
  itemCardDark: {
    backgroundColor: '#241938',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  itemUrl: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteAction: {
    padding: 8,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#999',
  },
});
