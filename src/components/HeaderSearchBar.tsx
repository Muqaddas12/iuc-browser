import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SEARCH_ENGINES } from '../constants/theme';
import { SearchEngine } from '../types/browser';

interface HeaderSearchBarProps {
  url: string;
  isLoading: boolean;
  progress: number;
  isIncognito: boolean;
  searchEngine: SearchEngine;
  onSearch: (input: string) => void;
  onReload: () => void;
  onStop: () => void;
  onChangeEngine: (engine: SearchEngine) => void;
  onOpenQRScanner?: () => void;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  url,
  isLoading,
  progress,
  isIncognito,
  searchEngine,
  onSearch,
  onReload,
  onStop,
  onChangeEngine,
  onOpenQRScanner,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(url);
  const [showEnginePicker, setShowEnginePicker] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!isEditing) {
      setInputText(url);
    }
  }, [url, isEditing]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isLoading ? Math.max(progress, 0.1) : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [progress, isLoading]);

  const handleSubmit = () => {
    setIsEditing(false);
    if (inputText.trim()) {
      onSearch(inputText.trim());
    }
  };

  const currentEngine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google;
  const isDark = isIncognito;

  // Format display url (e.g. google.com instead of https://www.google.com/...)
  const getDisplayDomain = (rawUrl: string) => {
    if (!rawUrl || rawUrl === 'about:blank' || rawUrl === 'uc://home') return '';
    try {
      const u = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return rawUrl;
    }
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View style={[styles.barWrapper, isDark ? styles.barWrapperDark : styles.barWrapperLight]}>
        {/* Search Engine Selector Icon */}
        <TouchableOpacity
          style={styles.engineButton}
          onPress={() => setShowEnginePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.engineIconCircle}>
            {searchEngine === 'google' && <FontAwesome5 name="google" size={14} color="#4285F4" />}
            {searchEngine === 'bing' && <FontAwesome5 name="microsoft" size={14} color="#00A4EF" />}
            {searchEngine === 'duckduckgo' && <MaterialIcons name="security" size={15} color="#DE5833" />}
            {searchEngine === 'yahoo' && <FontAwesome5 name="yahoo" size={14} color="#6001D2" />}
          </View>
          <Feather name="chevron-down" size={12} color={isDark ? '#AAA' : '#888'} style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        {/* SSL Lock indicator when not editing and on secure page */}
        {!isEditing && url.startsWith('https://') && (
          <Ionicons
            name="lock-closed"
            size={13}
            color={COLORS.success}
            style={{ marginRight: 6 }}
          />
        )}

        {/* Omnibox Input */}
        <TextInput
          style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
          value={isEditing ? inputText : (getDisplayDomain(inputText) || inputText)}
          placeholder="Search or enter URL"
          placeholderTextColor={isDark ? '#7E7B92' : '#9E9EA7'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
          onFocus={() => {
            setIsEditing(true);
            setInputText(url === 'uc://home' || url === 'about:blank' ? '' : url);
          }}
          onBlur={() => setIsEditing(false)}
          onChangeText={setInputText}
          onSubmitEditing={handleSubmit}
        />

        {/* Action Buttons: Clear / Reload / Voice / QR */}
        {isEditing ? (
          inputText.length > 0 ? (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setInputText('')}>
              <Ionicons name="close-circle" size={18} color={isDark ? '#AAA' : '#999'} />
            </TouchableOpacity>
          ) : null
        ) : isLoading ? (
          <TouchableOpacity style={styles.actionBtn} onPress={onStop}>
            <Ionicons name="close" size={18} color={isDark ? '#FFF' : '#333'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={onReload}>
            <Ionicons name="reload" size={16} color={isDark ? '#BBB' : '#555'} />
          </TouchableOpacity>
        )}

        {/* QR Scanner Icon */}
        {onOpenQRScanner && (
          <TouchableOpacity style={styles.actionBtn} onPress={onOpenQRScanner}>
            <MaterialIcons name="qr-code-scanner" size={18} color={isDark ? '#BBB' : '#666'} />
          </TouchableOpacity>
        )}
      </View>

      {/* UC Signature Loading Progress Bar */}
      {isLoading && (
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}

      {/* Search Engine Modal Picker */}
      <Modal
        visible={showEnginePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEnginePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEnginePicker(false)}
        >
          <View style={[styles.engineModalCard, isDark ? styles.engineModalDark : styles.engineModalLight]}>
            <Text style={[styles.modalTitle, isDark && { color: '#FFF' }]}>Select Search Engine</Text>
            {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.engineRow,
                  searchEngine === key && (isDark ? styles.selectedEngineRowDark : styles.selectedEngineRowLight),
                ]}
                onPress={() => {
                  onChangeEngine(key as SearchEngine);
                  setShowEnginePicker(false);
                }}
              >
                <View style={styles.engineNameWrap}>
                  <Text style={[styles.engineText, isDark && { color: '#EEE' }]}>{engine.name}</Text>
                </View>
                {searchEngine === key && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    paddingBottom: 8,
    position: 'relative',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },
  containerDark: {
    backgroundColor: COLORS.incognitoBg,
    borderBottomWidth: 1,
    borderBottomColor: '#2B1F3F',
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    height: 44,
    paddingHorizontal: 12,
  },
  barWrapperLight: {
    backgroundColor: '#F1F2F6',
  },
  barWrapperDark: {
    backgroundColor: '#271B3A',
  },
  engineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingRight: 4,
  },
  engineIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    height: 44,
    paddingVertical: 0,
  },
  inputLight: {
    color: '#1C1C1E',
  },
  inputDark: {
    color: '#F4F4F6',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 2,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  engineModalCard: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  engineModalLight: {
    backgroundColor: '#FFFFFF',
  },
  engineModalDark: {
    backgroundColor: '#241738',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  selectedEngineRowLight: {
    backgroundColor: '#FFF1E8',
  },
  selectedEngineRowDark: {
    backgroundColor: '#382255',
  },
  engineNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engineText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});

