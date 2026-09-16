import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { BrowserSettings } from '../types/browser';

interface UCMenuDrawerProps {
  visible: boolean;
  isIncognito: boolean;
  settings: BrowserSettings;
  activeDownloadsCount: number;
  onClose: () => void;
  onOpenDownloads: () => void;
  onOpenBookmarksHistory: () => void;
  onOpenSettings: () => void;
  onToggleNightMode: () => void;
  onToggleAdBlock: () => void;
  onToggleIncognito: () => void;
  onToggleDesktopSite: () => void;
  onToggleNoImage: () => void;
  onToggleSpeedMode: () => void;
  onToggleFullScreen: () => void;
  onRefreshPage: () => void;
  onAddBookmark: () => void;
  onExitApp: () => void;
}

export const UCMenuDrawer: React.FC<UCMenuDrawerProps> = ({
  visible,
  isIncognito,
  settings,
  activeDownloadsCount,
  onClose,
  onOpenDownloads,
  onOpenBookmarksHistory,
  onOpenSettings,
  onToggleNightMode,
  onToggleAdBlock,
  onToggleIncognito,
  onToggleDesktopSite,
  onToggleNoImage,
  onToggleSpeedMode,
  onToggleFullScreen,
  onRefreshPage,
  onAddBookmark,
  onExitApp,
}) => {
  const isDark = isIncognito || settings.nightModeEnabled;

  const menuItems = [
    {
      id: 'downloads',
      title: 'Downloads',
      icon: (color: string) => <Feather name="download" size={22} color={color} />,
      onPress: onOpenDownloads,
      badge: activeDownloadsCount > 0 ? `${activeDownloadsCount}` : undefined,
    },
    {
      id: 'bookmarks_history',
      title: 'Bookmarks',
      icon: (color: string) => <Feather name="bookmark" size={22} color={color} />,
      onPress: onOpenBookmarksHistory,
    },
    {
      id: 'night_mode',
      title: 'Night Mode',
      active: settings.nightModeEnabled,
      icon: (color: string) => <Ionicons name="moon-outline" size={22} color={color} />,
      onPress: onToggleNightMode,
    },
    {
      id: 'ad_block',
      title: 'AdBlocker',
      active: settings.adBlockEnabled,
      icon: (color: string) => <MaterialIcons name="security" size={22} color={color} />,
      onPress: onToggleAdBlock,
      badge: settings.adBlockEnabled ? 'ON' : 'OFF',
    },
    {
      id: 'incognito',
      title: 'Incognito',
      active: isIncognito,
      icon: (color: string) => <MaterialCommunityIcons name="incognito" size={22} color={color} />,
      onPress: onToggleIncognito,
      badge: isIncognito ? 'ON' : undefined,
    },
    {
      id: 'desktop_site',
      title: 'Desktop Site',
      active: settings.desktopSite,
      icon: (color: string) => <MaterialIcons name="desktop-windows" size={22} color={color} />,
      onPress: onToggleDesktopSite,
    },
    {
      id: 'speed_mode',
      title: 'Speed Mode',
      active: settings.speedMode,
      icon: (color: string) => <MaterialCommunityIcons name="lightning-bolt" size={22} color={color} />,
      onPress: onToggleSpeedMode,
    },
    {
      id: 'no_image',
      title: 'No Image',
      active: settings.noImageMode,
      icon: (color: string) => <Ionicons name="image-outline" size={22} color={color} />,
      onPress: onToggleNoImage,
    },
    {
      id: 'fullscreen',
      title: 'Full Screen',
      icon: (color: string) => <MaterialIcons name="fullscreen" size={24} color={color} />,
      onPress: onToggleFullScreen,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: (color: string) => <Ionicons name="settings-outline" size={22} color={color} />,
      onPress: onOpenSettings,
    },
    {
      id: 'exit',
      title: 'Exit',
      icon: (color: string) => <MaterialCommunityIcons name="power" size={22} color={COLORS.danger} />,
      onPress: onExitApp,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.drawerContent, isDark ? styles.drawerDark : styles.drawerLight]}
          onStartShouldSetResponder={() => true}
        >
          {/* Top Quick Actions Bar */}
          <View style={[styles.quickBar, isDark ? styles.quickBarDark : styles.quickBarLight]}>
            <TouchableOpacity style={styles.quickBtn} onPress={onRefreshPage}>
              <Ionicons name="reload" size={19} color={isDark ? '#FFF' : '#333'} />
              <Text style={[styles.quickBtnText, isDark && { color: '#CCC' }]}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn} onPress={onAddBookmark}>
              <Ionicons name="star-outline" size={19} color={isDark ? '#FFF' : '#333'} />
              <Text style={[styles.quickBtnText, isDark && { color: '#CCC' }]}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn} onPress={onToggleNightMode}>
              <Ionicons
                name={settings.nightModeEnabled ? 'moon' : 'sunny-outline'}
                size={19}
                color={settings.nightModeEnabled ? COLORS.primary : isDark ? '#FFF' : '#333'}
              />
              <Text style={[styles.quickBtnText, isDark && { color: '#CCC' }]}>Night</Text>
            </TouchableOpacity>
          </View>

          {/* Grid Menu Icons */}
          <View style={styles.grid}>
            {menuItems.map((item) => {
              const isActive = item.active;
              const iconColor = isActive
                ? COLORS.primary
                : isDark
                ? '#E4E2ED'
                : '#333338';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    item.onPress();
                    if (item.id !== 'night_mode' && item.id !== 'ad_block' && item.id !== 'no_image' && item.id !== 'speed_mode' && item.id !== 'desktop_site') {
                      onClose();
                    }
                  }}
                >
                  <View
                    style={[
                      styles.circleIcon,
                      isActive
                        ? styles.circleActive
                        : isDark
                        ? styles.circleIconDark
                        : styles.circleIconLight,
                    ]}
                  >
                    {item.icon(isActive ? '#FFF' : iconColor)}

                    {item.badge && (
                      <View
                        style={[
                          styles.badge,
                          item.badge === 'ON'
                            ? { backgroundColor: COLORS.success }
                            : item.badge === 'OFF'
                            ? { backgroundColor: '#8E8E93' }
                            : { backgroundColor: COLORS.primary },
                        ]}
                      >
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemLabel,
                      isDark ? styles.itemLabelDark : styles.itemLabelLight,
                      isActive && { color: COLORS.primary, fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Close Handle Bar */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="chevron-down" size={24} color={isDark ? '#AAA' : '#888'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  drawerLight: {
    backgroundColor: '#FFFFFF',
  },
  drawerDark: {
    backgroundColor: '#1E1430',
  },
  quickBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
  },
  quickBarLight: {
    backgroundColor: '#F3F4F8',
  },
  quickBarDark: {
    backgroundColor: '#2A1D42',
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    color: '#222',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginVertical: 10,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleIconLight: {
    backgroundColor: '#F0F1F5',
  },
  circleIconDark: {
    backgroundColor: '#2C1E46',
  },
  circleActive: {
    backgroundColor: COLORS.primary,
  },
  itemLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  itemLabelLight: {
    color: '#333338',
  },
  itemLabelDark: {
    color: '#D8D5E3',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFF',
  },
  closeBtn: {
    alignItems: 'center',
    paddingTop: 8,
  },
});

