import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import {
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { ShortcutItem } from '../types/browser';

interface SpeedDialGridProps {
  shortcuts: ShortcutItem[];
  isIncognito: boolean;
  onSelectShortcut: (url: string) => void;
  onAddShortcut: (title: string, url: string) => void;
  onDeleteShortcut: (id: string) => void;
}

export const SpeedDialGrid: React.FC<SpeedDialGridProps> = ({
  shortcuts,
  isIncognito,
  onSelectShortcut,
  onAddShortcut,
  onDeleteShortcut,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

  const handleSave = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    onAddShortcut(newTitle.trim(), finalUrl);
    setNewTitle('');
    setNewUrl('');
    setModalVisible(false);
  };

  const renderIcon = (item: ShortcutItem) => {
    const isDark = isIncognito;
    const iconSize = 22;

    switch (item.iconName) {
      case 'google':
        return <FontAwesome5 name="google" size={iconSize} color="#4285F4" />;
      case 'youtube':
        return <FontAwesome5 name="youtube" size={iconSize} color="#FF0000" />;
      case 'facebook':
        return <FontAwesome5 name="facebook-f" size={iconSize} color="#1877F2" />;
      case 'shopping-cart':
        return <FontAwesome5 name="amazon" size={iconSize} color="#FF9900" />;
      case 'book-open':
        return <FontAwesome5 name="wikipedia-w" size={iconSize} color={isDark ? '#FFF' : '#333'} />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={iconSize} color="#E1306C" />;
      case 'activity':
        return <MaterialCommunityIcons name="cricket" size={iconSize + 2} color="#009270" />;
      case 'twitter':
        return <FontAwesome5 name="twitter" size={iconSize} color="#1DA1F2" />;
      default:
        return <Feather name="globe" size={iconSize} color={COLORS.primary} />;
    }
  };

  const isDark = isIncognito;

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {shortcuts.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemWrapper}
            activeOpacity={0.7}
            onPress={() => {
              if (deleteMode) {
                onDeleteShortcut(item.id);
              } else {
                onSelectShortcut(item.url);
              }
            }}
            onLongPress={() => setDeleteMode(!deleteMode)}
          >
            <View
              style={[
                styles.iconBubble,
                isDark ? styles.iconBubbleDark : styles.iconBubbleLight,
              ]}
            >
              {renderIcon(item)}

              {/* Badge (HOT, LIVE, etc.) */}
              {item.badge && !deleteMode && (
                <View
                  style={[
                    styles.badgeContainer,
                    item.badge === 'HOT' && { backgroundColor: '#FF3B30' },
                    item.badge === 'LIVE' && { backgroundColor: '#34C759' },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}

              {/* Delete button in delete mode */}
              {deleteMode && (
                <View style={styles.deleteBadge}>
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text
              style={[styles.itemTitle, isDark ? styles.itemTitleDark : styles.itemTitleLight]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add (+) Shortcut Button */}
        <TouchableOpacity
          style={styles.itemWrapper}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
        >
          <View
            style={[
              styles.iconBubble,
              styles.addBubble,
              isDark ? styles.addBubbleDark : styles.addBubbleLight,
            ]}
          >
            <Ionicons name="add" size={26} color={isDark ? '#A19CB5' : '#888890'} />
          </View>
          <Text style={[styles.itemTitle, isDark ? styles.itemTitleDark : styles.itemTitleLight]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Shortcut Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              isDark ? styles.modalCardDark : styles.modalCardLight,
            ]}
          >
            <Text style={[styles.modalHeading, isDark && { color: '#FFF' }]}>
              Add Quick Shortcut
            </Text>

            <TextInput
              style={[styles.modalInput, isDark ? styles.modalInputDark : styles.modalInputLight]}
              placeholder="Title (e.g. Reddit)"
              placeholderTextColor={isDark ? '#888' : '#AAA'}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.modalInput, isDark ? styles.modalInputDark : styles.modalInputLight]}
              placeholder="URL (e.g. reddit.com)"
              placeholderTextColor={isDark ? '#888' : '#AAA'}
              value={newUrl}
              autoCapitalize="none"
              keyboardType="url"
              onChangeText={setNewUrl}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    width: '23%',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  iconBubbleLight: {
    backgroundColor: '#FFFFFF',
  },
  iconBubbleDark: {
    backgroundColor: '#2E2244',
  },
  addBubble: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    elevation: 0,
  },
  addBubbleLight: {
    borderColor: '#D0D0D8',
    backgroundColor: '#F8F8FA',
  },
  addBubbleDark: {
    borderColor: '#4A3B66',
    backgroundColor: 'transparent',
  },
  itemTitle: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  itemTitleLight: {
    color: '#333338',
  },
  itemTitleDark: {
    color: '#E0DEE8',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 18,
    padding: 20,
    elevation: 10,
  },
  modalCardLight: {
    backgroundColor: '#FFFFFF',
  },
  modalCardDark: {
    backgroundColor: '#25193B',
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  modalInputLight: {
    backgroundColor: '#F0F1F5',
    color: '#1C1C1E',
  },
  modalInputDark: {
    backgroundColor: '#372754',
    color: '#FFFFFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: '#888',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

