import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Tab } from '../types/browser';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface SwipeableTabCardProps {
  tab: Tab;
  isActive: boolean;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
}

export const SwipeableTabCard: React.FC<SwipeableTabCardProps> = ({
  tab,
  isActive,
  onSelect,
  onClose
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect vertical swipe upward
        return Math.abs(gestureState.dy) > 12 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          // Normal upward drag
          pan.setValue({ x: 0, y: gestureState.dy });
        } else {
          // Slight downward rubber-band resistance
          pan.setValue({ x: 0, y: gestureState.dy * 0.25 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped up past threshold (70px or fast velocity)
        if (gestureState.dy < -70 || gestureState.vy < -0.6) {
          Animated.parallel([
            Animated.timing(pan.y, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true
            })
          ]).start(() => {
            onClose(tab.id);
          });
        } else {
          // Snap back to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            bounciness: 6,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const getDomain = (url: string) => {
    try {
      if (!url || url === 'about:blank') return 'Home';
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url || 'New Tab';
    }
  };

  const domain = getDomain(tab.url);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity,
          transform: [{ translateY: pan.y }]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onSelect(tab.id)}
        style={[styles.card, isActive && styles.activeCard]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🌐</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {tab.title || domain}
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onClose(tab.id)}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Card Body / Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.previewHeaderBar}>
            <Text style={styles.previewUrlText} numberOfLines={1}>
              🔒 {domain}
            </Text>
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewInitial}>
              {domain.charAt(0).toUpperCase()}
            </Text>
            <Text style={styles.previewSubtitle} numberOfLines={2}>
              {tab.title || 'Start browsing'}
            </Text>
          </View>
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>↑ Slide up to close</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
    marginHorizontal: 4
  },
  card: {
    backgroundColor: '#181920',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2D3A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5
  },
  activeCard: {
    borderColor: '#6366F1',
    borderWidth: 2,
    shadowColor: '#6366F1',
    shadowOpacity: 0.45,
    shadowRadius: 8
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: '#1E202A',
    borderBottomWidth: 1,
    borderBottomColor: '#282B37'
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  iconText: {
    fontSize: 11
  },
  cardTitle: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600'
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2D3142',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  previewContainer: {
    height: 145,
    backgroundColor: '#0F1015',
    justifyContent: 'space-between',
    padding: 8
  },
  previewHeaderBar: {
    backgroundColor: '#1A1B24',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'stretch'
  },
  previewUrlText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  previewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  previewInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3B3E52',
    marginBottom: 4
  },
  previewSubtitle: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 6
  },
  swipeHint: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A1B26',
    paddingTop: 4
  },
  swipeHintText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '500'
  }
});

