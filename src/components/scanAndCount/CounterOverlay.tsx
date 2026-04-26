import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MODEL_REGISTRY } from '../../utils/modelRegistry';

interface CounterOverlayProps {
  targetWord: string;
  found: number;
  target: number;
}

export const CounterOverlay = ({ targetWord, found, target }: CounterOverlayProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const model = MODEL_REGISTRY[targetWord];

  useEffect(() => {
    if (found === 0) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [found]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pill, { transform: [{ scale: scaleAnim }] }]}>
        <MaterialCommunityIcons name="cube-outline" size={30} color="rgba(255,255,255,0.9)" />
        <Text style={styles.counter}>{found} / {target}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 28,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  counter: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#FFFFFF' },
});
