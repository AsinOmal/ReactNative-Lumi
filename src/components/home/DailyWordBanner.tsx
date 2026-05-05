import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';

interface Props {
  word: string;
  isFound: boolean;
}

export const DailyWordBanner: React.FC<Props> = ({ word, isFound }) => {
  const navigation = useNavigation();
  const display = word.charAt(0).toUpperCase() + word.slice(1);
  const [playFlip, setPlayFlip] = useState(false);

  useEffect(() => {
    if (isFound) setPlayFlip(true);
  }, [isFound]);

  const sparkleColor = isFound ? 'rgba(5,150,105,0.25)' : 'rgba(180,140,0,0.22)';

  return (
    <View style={[styles.card, isFound && styles.cardFound]}>
      {/* Scattered sparkles */}
      <MaterialCommunityIcons name="star-four-points" size={13} color={sparkleColor} style={styles.s1} />
      <MaterialCommunityIcons name="star-four-points" size={8}  color={sparkleColor} style={styles.s2} />
      <MaterialCommunityIcons name="star-four-points" size={11} color={sparkleColor} style={styles.s3} />
      <MaterialCommunityIcons name="star-four-points" size={7}  color={sparkleColor} style={styles.s4} />

      <View style={styles.left}>
        <Text style={styles.label}>{isFound ? 'Found today!' : "Today's Word"}</Text>
        <Text style={styles.word}>{display}</Text>
        {isFound && (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.successDark} />
            <Text style={styles.doneText}>Well done!</Text>
          </View>
        )}
      </View>

      {!isFound && (
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => (navigation as any).navigate('Scan')}
          activeOpacity={0.85}
          accessibilityLabel={`Find today's word: ${display}`}
          accessibilityRole="button"
        >
          <Ionicons name="camera" size={26} color="#FFF" />
          <Text style={styles.scanBtnText}>Find it</Text>
        </TouchableOpacity>
      )}

      {isFound && !playFlip && (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark-circle" size={42} color={colors.successDark} />
        </View>
      )}
      {playFlip && (
        <LottieView
          source={require('../../assets/lottie/page-flip.json')}
          autoPlay
          loop={false}
          style={styles.flipAnim}
          onAnimationFinish={() => setPlayFlip(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF9C4', borderRadius: 28, padding: 18,
    overflow: 'hidden',
    shadowColor: colors.accentAmber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
  },
  // Sparkle positions — scattered across the empty center/right of the card
  s1: { position: 'absolute', top: 14,  left: '42%' },
  s2: { position: 'absolute', top: 32,  left: '58%' },
  s3: { position: 'absolute', bottom: 16, left: '50%' },
  s4: { position: 'absolute', bottom: 10, left: '68%' },
  cardFound: { backgroundColor: '#D1FAE5' },
  left: { flex: 1, gap: 3 },
  label:    { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid },
  word:     { fontFamily: 'Fredoka-Bold', fontSize: 26, color: colors.textDark },
  doneRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  doneText: { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: colors.successDark },
  scanBtn: {
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12,
    alignItems: 'center', gap: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  scanBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 13, color: '#FFF' },
  checkCircle: { paddingLeft: 8 },
  flipAnim: { width: 64, height: 64 },
});
