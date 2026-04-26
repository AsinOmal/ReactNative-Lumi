// 📖 What this does:
// Shrinking animated bar that counts down the round timer.
// Uses the JS Animated driver (not native) because width interpolation cannot
// run on the native thread — this is fine since it's a simple UI-only animation.
// Remounts via key={sceneKey} in the parent so the animation resets each round.

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { config } from '../../constants/config';

interface TimerBarProps {
  onTimeout: () => void;
}

export const TimerBar = ({ onTimeout }: TimerBarProps) => {
  const anim = useRef(new Animated.Value(1)).current;
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  useEffect(() => {
    anim.setValue(1);
    const animation = Animated.timing(anim, {
      toValue: 0,
      duration: config.SCAN_AND_COUNT_TIMER_MS,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => { if (finished) onTimeoutRef.current(); });
    return () => animation.stop();
  }, []);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const backgroundColor = anim.interpolate({
    inputRange: [0, 0.25, 0.6, 1.0],
    outputRange: ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E'],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.bar, { width, backgroundColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, marginHorizontal: 16, marginTop: 6, overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 4 },
});
