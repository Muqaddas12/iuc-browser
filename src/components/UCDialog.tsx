import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DialogConfig {
  title: string;
  message?: string;
  icon?: 'download' | 'trash' | 'info' | 'shield' | 'moon' | 'video';
  buttons: DialogButton[];
  options?: { label: string; subLabel?: string; onSelect: () => void }[];
}

interface UCDialogProps {
  dialog: DialogConfig | null;
  isDark?: boolean;
  onClose: () => void;
}

export const UCDialog: React.FC<UCDialogProps> = ({ dialog, isDark, onClose }) => {
  if (!dialog) return null;

  const renderIcon = () => {
    const size = 28;
    switch (dialog.icon) {
      case 'download':
        return <Feather name="download" size={size} color={COLORS.primary} />;
      case 'trash':
        return <Ionicons name="trash-outline" size={size} color={COLORS.danger} />;
      case 'shield':
        return <MaterialIcons name="security" size={size} color={COLORS.primary} />;
      case 'video':
        return <Ionicons name="videocam-outline" size={size} color={COLORS.primary} />;
      case 'moon':
        return <Ionicons name="moon-outline" size={size} color={COLORS.purple} />;
      default:
        return <Ionicons name="information-circle-outline" size={size} color="#007AFF" />;
    }
  };

  return (
    <Modal visible={!!dialog} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View
          style={[styles.dialogCard, isDark ? styles.cardDark : styles.cardLight]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header Icon */}
          <View
            style={[
              styles.iconCircle,
              isDark ? styles.iconCircleDark : styles.iconCircleLight,
            ]}
          >
            {renderIcon()}
          </View>

          {/* Title & Message */}
          <Text style={[styles.title, isDark && { color: '#FFF' }]}>{dialog.title}</Text>
          {dialog.message ? (
            <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
              {dialog.message}
            </Text>
          ) : null}

          {/* Optional Resolution / Option Pickers */}
          {dialog.options && (
            <View style={styles.optionsWrapper}>
              {dialog.options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionRow,
                    isDark ? styles.optionRowDark : styles.optionRowLight,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    opt.onSelect();
                    onClose();
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons name="play-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={[styles.optionLabel, isDark && { color: '#EEE' }]}>
                      {opt.label}
                    </Text>
                  </View>
                  {opt.subLabel ? (
                    <Text style={styles.optionSub}>{opt.subLabel}</Text>
                  ) : (
                    <Feather name="download" size={16} color="#888" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            {dialog.buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isCancel
                      ? styles.cancelBtn
                      : isDestructive
                      ? styles.destructiveBtn
                      : styles.primaryBtn,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    btn.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel
                        ? isDark
                          ? { color: '#AAA' }
                          : { color: '#666' }
                        : { color: '#FFF' },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#201633',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircleLight: {
    backgroundColor: '#FFF2EB',
  },
  iconCircleDark: {
    backgroundColor: '#35214E',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  messageLight: {
    color: '#66666E',
  },
  messageDark: {
    color: '#B2ADC2',
  },
  optionsWrapper: {
    width: '100%',
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionRowLight: {
    backgroundColor: '#F4F5F8',
  },
  optionRowDark: {
    backgroundColor: '#2D1F47',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    marginLeft: 8,
    color: '#222',
  },
  optionSub: {
    fontSize: 12,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  destructiveBtn: {
    backgroundColor: COLORS.danger,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

