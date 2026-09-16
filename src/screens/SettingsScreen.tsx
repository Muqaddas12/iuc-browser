import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BrowserSettings, SearchEngine } from '../types/browser';
import { COLORS, SEARCH_ENGINES } from '../constants/theme';
import { StorageService } from '../services/StorageService';
import { UCDialog, DialogConfig } from '../components/UCDialog';
import { UCToast, ToastConfig } from '../components/UCToast';

interface SettingsScreenProps {
  visible: boolean;
  isIncognito: boolean;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  isIncognito,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const isDark = isIncognito || settings.nightModeEnabled;

  const handleClearBrowsingData = () => {
    setDialog({
      title: 'Clear Browsing Data',
      message: 'This will clear all browsing history, cache, and website data.',
      icon: 'trash',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => setDialog(null) },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearHistory();
            setToast({ message: 'Browsing history and cache cleared.', type: 'success' });
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
          <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Section: General */}
          <Text style={[styles.sectionHeading, isDark && { color: COLORS.accent }]}>GENERAL</Text>

          <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
            {/* Search Engine */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <Ionicons name="search" size={20} color={COLORS.primary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, isDark && { color: '#FFF' }]}>Default Search Engine</Text>
              </View>
              <Text style={styles.settingValue}>
                {SEARCH_ENGINES[settings.searchEngine]?.name || 'Google'}
              </Text>
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* AdBlocker */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <MaterialIcons name="security" size={20} color={COLORS.primary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, isDark && { color: '#FFF' }]}>AdBlocker</Text>
              </View>
              <Switch
                value={settings.adBlockEnabled}
                onValueChange={(val) => {
                  onUpdateSettings({ adBlockEnabled: val });
                  setToast({
                    message: val ? 'AdBlocker enabled' : 'AdBlocker disabled',
                    type: 'shield',
                  });
                }}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* Speed Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <Ionicons name="flash" size={20} color={COLORS.warning} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, isDark && { color: '#FFF' }]}>Speed Mode (Data Saver)</Text>
              </View>
              <Switch
                value={settings.speedMode}
                onValueChange={(val) => {
                  onUpdateSettings({ speedMode: val });
                  setToast({
                    message: val ? 'Speed Mode activated' : 'Speed Mode deactivated',
                    type: 'info',
                  });
                }}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            {/* No Image Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <Ionicons name="image-outline" size={20} color="#8E8E93" style={styles.settingIcon} />
                <Text style={[styles.settingLabel, isDark && { color: '#FFF' }]}>No Image Mode</Text>
              </View>
              <Switch
                value={settings.noImageMode}
                onValueChange={(val) => onUpdateSettings({ noImageMode: val })}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>
          </View>

          {/* Section: Privacy & Security */}
          <Text style={[styles.sectionHeading, isDark && { color: COLORS.accent }]}>
            PRIVACY & DATA
          </Text>

          <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
            <TouchableOpacity style={styles.settingRow} onPress={handleClearBrowsingData}>
              <View style={styles.settingLabelWrap}>
                <Ionicons name="trash-bin-outline" size={20} color={COLORS.danger} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: COLORS.danger }]}>Clear Browsing Data</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Section: About */}
          <Text style={[styles.sectionHeading, isDark && { color: COLORS.accent }]}>ABOUT</Text>
          <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <Ionicons name="information-circle-outline" size={20} color="#007AFF" style={styles.settingIcon} />
                <Text style={[styles.settingLabel, isDark && { color: '#FFF' }]}>Version</Text>
              </View>
              <Text style={styles.settingValue}>1.0.0 (UC Native Build)</Text>
            </View>
          </View>
        </ScrollView>

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
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardLight: {
    backgroundColor: '#FFF',
  },
  cardDark: {
    backgroundColor: '#25193B',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  settingValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  divider: {
    height: 0.8,
  },
  dividerLight: {
    backgroundColor: '#F0F0F4',
  },
  dividerDark: {
    backgroundColor: '#32234B',
  },
});
