import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tab } from '../types/browser';
import { COLORS } from '../constants/theme';

interface TabSwitcherModalProps {
  visible: boolean;
  tabs: Tab[];
  activeTabId: string;
  isIncognitoMode: boolean;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: (isIncognito?: boolean) => void;
  onCloseAllTabs: () => void;
  onToggleIncognitoView: (incognito: boolean) => void;
  onCloseModal: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

export const TabSwitcherModal: React.FC<TabSwitcherModalProps> = ({
  visible,
  tabs,
  activeTabId,
  isIncognitoMode,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onCloseAllTabs,
  onToggleIncognitoView,
  onCloseModal,
}) => {
  const filteredTabs = tabs.filter((t) => t.isIncognito === isIncognitoMode);
  const isDark = isIncognitoMode;

  const renderTabCard = ({ item }: { item: Tab }) => {
    const isActive = item.id === activeTabId;
    const isHome = item.url === 'uc://home' || item.url === 'about:blank';

    return (
      <TouchableOpacity
        style={[
          styles.tabCard,
          isDark ? styles.tabCardDark : styles.tabCardLight,
          isActive && (isDark ? styles.activeCardDark : styles.activeCardLight),
        ]}
        activeOpacity={0.8}
        onPress={() => {
          onSelectTab(item.id);
          onCloseModal();
        }}
      >
        {/* Card Header */}
        <View
          style={[
            styles.cardHeader,
            isDark ? styles.cardHeaderDark : styles.cardHeaderLight,
          ]}
        >
          <View style={styles.headerTitleWrap}>
            <Ionicons
              name={isHome ? 'home-outline' : 'globe-outline'}
              size={14}
              color={isDark ? '#DDD' : '#444'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.cardTitle,
                isDark ? styles.cardTitleDark : styles.cardTitleLight,
              ]}
              numberOfLines={1}
            >
              {isHome ? 'Home' : item.title || item.url}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeTabBtn}
            onPress={() => onCloseTab(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={isDark ? '#DDD' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* Card Preview Body */}
        <View style={styles.cardPreviewBody}>
          {isHome ? (
            <View style={styles.homePreview}>
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={34}
                color={isDark ? '#5B4775' : '#D0D0D8'}
              />
              <Text
                style={[
                  styles.previewText,
                  isDark ? styles.previewTextDark : styles.previewTextLight,
                ]}
              >
                Speed Dial
              </Text>
            </View>
          ) : (
            <View style={styles.webPreview}>
              <Text
                style={[
                  styles.previewUrl,
                  isDark ? styles.previewUrlDark : styles.previewUrlLight,
                ]}
                numberOfLines={3}
              >
                {item.url}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onCloseModal}
    >
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        {/* Top Header Mode Switcher (Standard vs Incognito) */}
        <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
          <View style={styles.modeSwitchWrapper}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                !isIncognitoMode && styles.modeButtonActiveLight,
              ]}
              onPress={() => onToggleIncognitoView(false)}
            >
              <Text
                style={[
                  styles.modeText,
                  !isIncognitoMode
                    ? styles.modeTextActiveLight
                    : { color: isDark ? '#AAA' : '#666' },
                ]}
              >
                Standard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                isIncognitoMode && styles.modeButtonActiveDark,
              ]}
              onPress={() => onToggleIncognitoView(true)}
            >
              <MaterialCommunityIcons
                name="incognito"
                size={16}
                color={isIncognitoMode ? '#FFF' : '#888'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.modeText,
                  isIncognitoMode
                    ? styles.modeTextActiveDark
                    : { color: isDark ? '#AAA' : '#666' },
                ]}
              >
                Incognito
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onCloseModal}>
            <Text style={[styles.doneBtnText, isDark && { color: COLORS.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Cards Grid */}
        <FlatList
          data={filteredTabs}
          keyExtractor={(item) => item.id}
          renderItem={renderTabCard}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, isDark && { color: '#888' }]}>
                No {isIncognitoMode ? 'Incognito' : ''} tabs open
              </Text>
            </View>
          }
        />

        {/* Bottom Actions Toolbar */}
        <View style={[styles.bottomBar, isDark ? styles.bottomBarDark : styles.bottomBarLight]}>
          <TouchableOpacity
            style={styles.bottomActionBtn}
            onPress={onCloseAllTabs}
            disabled={filteredTabs.length === 0}
          >
            <Text
              style={[
                styles.closeAllText,
                filteredTabs.length === 0 && { opacity: 0.4 },
              ]}
            >
              Close All
            </Text>
          </TouchableOpacity>

          {/* Plus (+) New Tab Button */}
          <TouchableOpacity
            style={[
              styles.newTabBtn,
              isDark ? styles.newTabBtnDark : styles.newTabBtnLight,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              onNewTab(isIncognitoMode);
              onCloseModal();
            }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.tabCountPill}>
            <Text style={[styles.tabCountPillText, isDark && { color: '#CCC' }]}>
              {filteredTabs.length} {filteredTabs.length === 1 ? 'Tab' : 'Tabs'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#EEF0F5',
  },
  containerDark: {
    backgroundColor: COLORS.incognitoBg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 10,
    borderBottomWidth: 0.8,
  },
  topBarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#DDDDE2',
  },
  topBarDark: {
    backgroundColor: '#201633',
    borderBottomColor: '#32234F',
  },
  modeSwitchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E4E5EB',
    borderRadius: 20,
    padding: 3,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 17,
  },
  modeButtonActiveLight: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modeButtonActiveDark: {
    backgroundColor: COLORS.incognitoPrimary,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActiveLight: {
    color: COLORS.primary,
  },
  modeTextActiveDark: {
    color: '#FFFFFF',
  },
  doneBtn: {
    padding: 6,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  tabCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 14,
    margin: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  tabCardLight: {
    backgroundColor: '#FFFFFF',
  },
  tabCardDark: {
    backgroundColor: '#271B3A',
  },
  activeCardLight: {
    borderColor: COLORS.primary,
  },
  activeCardDark: {
    borderColor: COLORS.incognitoPrimary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderBottomWidth: 0.5,
  },
  cardHeaderLight: {
    backgroundColor: '#F7F8FA',
    borderBottomColor: '#EAEAEE',
  },
  cardHeaderDark: {
    backgroundColor: '#32234B',
    borderBottomColor: '#3F2C5F',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardTitleLight: {
    color: '#222',
  },
  cardTitleDark: {
    color: '#FFF',
  },
  closeTabBtn: {
    padding: 2,
  },
  cardPreviewBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  homePreview: {
    alignItems: 'center',
  },
  previewText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  previewTextLight: {
    color: '#999',
  },
  previewTextDark: {
    color: '#776690',
  },
  webPreview: {
    width: '100%',
  },
  previewUrl: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  previewUrlLight: {
    color: '#777',
  },
  previewUrlDark: {
    color: '#AAA',
  },
  emptyWrap: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 0.8,
  },
  bottomBarLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E6',
  },
  bottomBarDark: {
    backgroundColor: '#1E1430',
    borderTopColor: '#2F204A',
  },
  bottomActionBtn: {
    padding: 8,
  },
  closeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  newTabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  newTabBtnLight: {
    backgroundColor: COLORS.primary,
  },
  newTabBtnDark: {
    backgroundColor: COLORS.incognitoPrimary,
  },
  tabCountPill: {
    padding: 8,
  },
  tabCountPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
});

