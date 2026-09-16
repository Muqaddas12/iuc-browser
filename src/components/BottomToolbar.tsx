import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface BottomToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  tabCount: number;
  isIncognito: boolean;
  hasActiveDownloads?: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onOpenTabs: () => void;
  onOpenMenu: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  canGoBack,
  canGoForward,
  tabCount,
  isIncognito,
  hasActiveDownloads,
  onGoBack,
  onGoForward,
  onGoHome,
  onOpenTabs,
  onOpenMenu,
}) => {
  const isDark = isIncognito;

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* 1. Back Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onGoBack}
        disabled={!canGoBack}
        activeOpacity={0.6}
      >
        <Feather
          name="chevron-left"
          size={28}
          color={
            canGoBack
              ? isDark
                ? '#FFFFFF'
                : '#1A1A1A'
              : isDark
              ? '#554A68'
              : '#BCBCC0'
          }
        />
      </TouchableOpacity>

      {/* 2. Forward Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onGoForward}
        disabled={!canGoForward}
        activeOpacity={0.6}
      >
        <Feather
          name="chevron-right"
          size={28}
          color={
            canGoForward
              ? isDark
                ? '#FFFFFF'
                : '#1A1A1A'
              : isDark
              ? '#554A68'
              : '#BCBCC0'
          }
        />
      </TouchableOpacity>

      {/* 3. Home Button */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onGoHome}
        activeOpacity={0.6}
      >
        <Ionicons
          name="home-outline"
          size={24}
          color={isDark ? '#FFFFFF' : '#1A1A1A'}
        />
      </TouchableOpacity>

      {/* 4. Tab Counter Box */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onOpenTabs}
        activeOpacity={0.6}
      >
        <View
          style={[
            styles.tabCounterBox,
            isDark ? styles.tabCounterBoxDark : styles.tabCounterBoxLight,
          ]}
        >
          <Text
            style={[
              styles.tabCounterText,
              isDark ? styles.tabCounterTextDark : styles.tabCounterTextLight,
            ]}
          >
            {tabCount > 99 ? '99+' : tabCount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 5. UC Menu Button (Classic 3-line) */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onOpenMenu}
        activeOpacity={0.6}
      >
        <View style={styles.menuIconContainer}>
          <Feather
            name="menu"
            size={25}
            color={isDark ? '#FFFFFF' : '#1A1A1A'}
          />
          {hasActiveDownloads && <View style={styles.downloadDot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 52,
    paddingHorizontal: 8,
    borderTopWidth: 0.8,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E6E6EA',
  },
  containerDark: {
    backgroundColor: COLORS.incognitoBg,
    borderTopColor: '#2C2042',
  },
  navButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabCounterBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabCounterBoxLight: {
    borderColor: '#222224',
  },
  tabCounterBoxDark: {
    borderColor: '#FFFFFF',
  },
  tabCounterText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabCounterTextLight: {
    color: '#222224',
  },
  tabCounterTextDark: {
    color: '#FFFFFF',
  },
  menuIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});

