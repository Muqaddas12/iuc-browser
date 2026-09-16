import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'download' | 'shield';
  duration?: number;
}

interface UCToastProps {
  toast: ToastConfig | null;
  onDismiss: () => void;
}

export const UCToast: React.FC<UCToastProps> = ({ toast, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onDismiss());
      }, toast.duration || 2600);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={19} color="#34C759" />;
      case 'download':
        return <Feather name="download" size={18} color={COLORS.primary} />;
      case 'shield':
        return <MaterialIcons name="security" size={19} color={COLORS.primary} />;
      case 'warning':
        return <Ionicons name="warning" size={19} color="#FF9500" />;
      case 'error':
        return <Ionicons name="alert-circle" size={19} color="#FF3B30" />;
      default:
        return <Ionicons name="information-circle" size={19} color="#007AFF" />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.toastCard}>
        <View style={styles.iconBox}>{renderIcon()}</View>
        <Text style={styles.toastText} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 74,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 34, 0.95)',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    maxWidth: '90%',
  },
  iconBox: {
    marginRight: 9,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    flexShrink: 1,
  },
});
