import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';

interface Props {
  word: string;
  visible: boolean;
  onClose: () => void;
}

export const WishConfirmModal = ({ word, visible, onClose }: Props) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  const displayWord = word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          {/* Big star */}
          <Text style={styles.starEmoji}>⭐</Text>

          {/* Word pill */}
          <View style={styles.wordPill}>
            <Text style={styles.wordPillText}>{displayWord}</Text>
          </View>

          <Text style={styles.title}>Added to Wishlist!</Text>
          <Text style={styles.subtitle}>
            Keep an eye out for future updates.{'\n'}We'll let you know when{' '}
            <Text style={styles.wordHighlight}>{displayWord}</Text> lands in Lumi!
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#1A1050',
    borderRadius: 32,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(196, 181, 253, 0.3)',
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 16,
  },
  starEmoji: {
    fontSize: 64,
    marginBottom: 4,
  },
  wordPill: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#5B2DC0',
  },
  wordPillText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#C4B5FD',
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 24,
  },
  wordHighlight: {
    fontFamily: 'Fredoka-Bold',
    color: '#FFFFFF',
  },
  doneBtn: {
    marginTop: 8,
    backgroundColor: '#5B2DC0',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  doneBtnText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: '#FFF',
  },
});
