import React, { useEffect, useRef } from 'react';
import { colors } from '../constants/colors';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  word: string;
  visible: boolean;
  onClose: () => void;
}

export const WishConfirmModal = ({ word, visible, onClose }: Props) => {
  const scale      = useRef(new Animated.Value(0.85)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const lottieRef  = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => lottieRef.current?.play());

      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);

  const displayWord = word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} accessibilityLabel="Dismiss" accessibilityRole="button">
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>

          {/* Decorative corner stars */}
          <Ionicons name="star" size={16} color="rgba(196,181,253,0.4)" style={styles.decoTL} />
          <Ionicons name="star" size={10} color="rgba(196,181,253,0.3)" style={styles.decoTR} />
          <Ionicons name="star" size={12} color="rgba(196,181,253,0.35)" style={styles.decoBR} />

          {/* Celebration Lottie mascot */}
          <LottieView
            ref={lottieRef}
            source={require('../assets/lottie/mascot_celebration.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />

          {/* Word pill */}
          <View style={styles.wordPill}>
            <Ionicons name="star" size={16} color={colors.primaryLight} />
            <Text style={styles.wordPillText}>{displayWord}</Text>
          </View>

          <Text style={styles.title}>Added to Wishlist!</Text>
          <Text style={styles.subtitle}>
            We'll let you know when{' '}
            <Text style={styles.wordHighlight}>{displayWord}</Text>
            {' '}lands in Lumi!
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85} accessibilityLabel="Got it, close" accessibilityRole="button">
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.doneBtnText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: 36,
    paddingTop: 8, paddingBottom: 36, paddingHorizontal: 32,
    alignItems: 'center', gap: 14,
    width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.35)',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6, shadowRadius: 40, elevation: 20,
    overflow: 'hidden',
  },
  decoTL: { position: 'absolute', top: 18, left: 22 },
  decoTR: { position: 'absolute', top: 30, right: 28 },
  decoBR: { position: 'absolute', bottom: 24, right: 36 },

  lottie: { width: 160, height: 160 },

  wordPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2D1B69',
    borderRadius: 24, paddingHorizontal: 22, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  wordPillText: { fontFamily: 'Fredoka-Bold', fontSize: 26, color: '#C4B5FD' },

  title:    { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 17, color: colors.primaryLight, textAlign: 'center', lineHeight: 26 },
  wordHighlight: { fontFamily: 'Fredoka-Bold', color: '#FFFFFF' },

  doneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 6, backgroundColor: colors.primary,
    borderRadius: 28, paddingHorizontal: 44, paddingVertical: 16,
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  doneBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFF' },
});
