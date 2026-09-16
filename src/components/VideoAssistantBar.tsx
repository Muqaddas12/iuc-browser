import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DetectedVideo } from '../types/browser';

interface VideoAssistantBarProps {
  video: DetectedVideo;
  onDownload: (video: DetectedVideo) => void;
  onFloatingPlay: (video: DetectedVideo) => void;
  onDismiss: () => void;
}

export const VideoAssistantBar: React.FC<VideoAssistantBarProps> = ({
  video,
  onDownload,
  onFloatingPlay,
  onDismiss,
}) => {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.bar}>
        <View style={styles.badge}>
          <Ionicons name="videocam" size={16} color="#FFFFFF" />
          <Text style={styles.badgeText}>Video Detected</Text>
        </View>

        <View style={styles.actions}>
          {/* Download Video */}
          <TouchableOpacity
            style={[styles.btn, styles.downloadBtn]}
            onPress={() => onDownload(video)}
            activeOpacity={0.8}
          >
            <Feather name="download" size={15} color="#FFFFFF" />
            <Text style={styles.btnText}>Download</Text>
          </TouchableOpacity>

          {/* Floating Player (PiP) */}
          <TouchableOpacity
            style={[styles.btn, styles.pipBtn]}
            onPress={() => onFloatingPlay(video)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="picture-in-picture-alt" size={16} color="#333" />
            <Text style={[styles.btnText, { color: '#333' }]}>PiP</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    zIndex: 999,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E24',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 8,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
  },
  pipBtn: {
    backgroundColor: '#EEEEF2',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 4,
  },
});

