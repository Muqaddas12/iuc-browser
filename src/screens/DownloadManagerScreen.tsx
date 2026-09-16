import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DownloadItem } from '../types/browser';
import { COLORS } from '../constants/theme';
import { DownloadService } from '../services/NativeDownloadService';
import { StorageService } from '../services/StorageService';
import { UCDialog, DialogConfig } from '../components/UCDialog';
import { UCToast, ToastConfig } from '../components/UCToast';

interface DownloadManagerScreenProps {
  visible: boolean;
  isIncognito: boolean;
  onClose: () => void;
}

export const DownloadManagerScreen: React.FC<DownloadManagerScreenProps> = ({
  visible,
  isIncognito,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'downloading' | 'completed'>('downloading');
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<DownloadItem['category']>('all');
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const loadDownloads = async () => {
    const list = await StorageService.getDownloads();
    setDownloads(list);
  };

  useEffect(() => {
    if (visible) {
      loadDownloads();
      DownloadService.init((updatedItem) => {
        setDownloads((prev) => {
          const filtered = prev.filter((d) => d.id !== updatedItem.id);
          return [updatedItem, ...filtered];
        });
      });
    }
  }, [visible]);

  const isDark = isIncognito;

  const downloadingList = downloads.filter((d) => d.status === 'downloading' || d.status === 'paused');
  const completedList = downloads.filter(
    (d) =>
      d.status === 'completed' &&
      (activeCategory === 'all' || d.category === activeCategory)
  );

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (bps: number) => {
    if (!bps || bps <= 0) return '0 KB/s';
    if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + ' MB/s';
    return (bps / 1024).toFixed(0) + ' KB/s';
  };

  const renderCategoryIcon = (category: DownloadItem['category']) => {
    switch (category) {
      case 'video':
        return <Ionicons name="videocam" size={20} color="#FF5B00" />;
      case 'music':
        return <Ionicons name="musical-notes" size={20} color="#FF2D55" />;
      case 'apk':
        return <MaterialCommunityIcons name="android" size={20} color="#34C759" />;
      case 'image':
        return <Ionicons name="image" size={20} color="#5856D6" />;
      case 'doc':
        return <Ionicons name="document-text" size={20} color="#007AFF" />;
      default:
        return <Feather name="file" size={20} color="#8E8E93" />;
    }
  };

  const confirmDelete = (item: DownloadItem) => {
    setDialog({
      title: 'Delete Download',
      message: `Are you sure you want to delete "${item.fileName}"?`,
      icon: 'trash',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DownloadService.deleteDownload(item);
            setDownloads((prev) => prev.filter((d) => d.id !== item.id));
            setToast({ message: 'File deleted successfully.', type: 'info' });
          },
        },
      ],
    });
  };

  const handlePause = async (id: string) => {
    await DownloadService.pause(id);
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'paused' } : d))
    );
    setToast({ message: 'Download paused.', type: 'info' });
  };

  const handleResume = async (id: string) => {
    await DownloadService.resume(id);
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'downloading' } : d))
    );
    setToast({ message: 'Resuming download...', type: 'download' });
  };

  const categories: { key: DownloadItem['category']; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'video', label: 'Videos' },
    { key: 'music', label: 'Music' },
    { key: 'apk', label: 'APKs' },
    { key: 'image', label: 'Images' },
    { key: 'doc', label: 'Docs' },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        {/* Top Header */}
        <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={24} color={isDark ? '#FFF' : '#222'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Downloads</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Tab Switcher: Downloading vs Completed */}
        <View style={[styles.tabBar, isDark ? styles.tabBarDark : styles.tabBarLight]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'downloading' && styles.tabBtnActive]}
            onPress={() => setActiveTab('downloading')}
          >
            <Text
              style={[
                styles.tabBtnText,
                isDark ? styles.tabBtnTextDark : styles.tabBtnTextLight,
                activeTab === 'downloading' && styles.tabBtnTextActive,
              ]}
            >
              Downloading ({downloadingList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabBtnText,
                isDark ? styles.tabBtnTextDark : styles.tabBtnTextLight,
                activeTab === 'completed' && styles.tabBtnTextActive,
              ]}
            >
              Completed ({downloads.filter((d) => d.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters for Completed Tab */}
        {activeTab === 'completed' && (
          <View style={styles.categoryBar}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => {
                const isSelected = activeCategory === item.key;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryPill,
                      isSelected ? styles.categoryPillActive : isDark ? styles.categoryPillDark : styles.categoryPillLight,
                    ]}
                    onPress={() => setActiveCategory(item.key)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected ? styles.categoryPillTextActive : isDark ? { color: '#AAA' } : { color: '#666' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Download Items List */}
        {activeTab === 'downloading' ? (
          <FlatList
            data={downloadingList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.downloadCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.iconContainer}>{renderCategoryIcon(item.category)}</View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.fileName, isDark && { color: '#FFF' }]} numberOfLines={1}>
                      {item.fileName}
                    </Text>
                    <Text style={styles.metaText}>
                      {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)} •{' '}
                      {item.status === 'paused' ? 'Paused' : formatSpeed(item.speedBps)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color="#888" />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                </View>

                {/* Controls: Pause/Resume */}
                <View style={styles.controlRow}>
                  <Text style={styles.progressPercent}>{item.progress}%</Text>
                  <View style={styles.actionsGroup}>
                    {item.status === 'downloading' ? (
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handlePause(item.id)}
                      >
                        <Ionicons name="pause" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleResume(item.id)}
                      >
                        <Ionicons name="play" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="download-cloud" size={48} color={isDark ? '#443460' : '#C0C0C8'} />
                <Text style={[styles.emptyText, isDark && { color: '#888' }]}>No active downloads</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={completedList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.downloadCard, isDark ? styles.cardDark : styles.cardLight]}
                activeOpacity={0.7}
                onPress={() => DownloadService.openFile(item)}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.iconContainer}>{renderCategoryIcon(item.category)}</View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.fileName, isDark && { color: '#FFF' }]} numberOfLines={1}>
                      {item.fileName}
                    </Text>
                    <Text style={styles.metaText}>
                      {formatBytes(item.fileSize || item.downloadedBytes)} • {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color="#888" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="check-circle" size={48} color={isDark ? '#443460' : '#C0C0C8'} />
                <Text style={[styles.emptyText, isDark && { color: '#888' }]}>No completed files</Text>
              </View>
            }
          />
        )}

        {/* Custom Dialog & Toast */}
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
  categoryBar: {
    paddingVertical: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  categoryPillLight: {
    backgroundColor: '#E8E8EE',
  },
  categoryPillDark: {
    backgroundColor: '#281C3E',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  downloadCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#25193B',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#EAEAEE',
    borderRadius: 2,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: 6,
    marginLeft: 8,
  },
  deleteBtn: {
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
