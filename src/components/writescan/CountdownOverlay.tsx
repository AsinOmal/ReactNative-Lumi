// 📖 3-2-1-Go countdown shown before the AR reveal mounts.
// Uses a setInterval ticking from 3 down to 0; when it hits 0 we call
// onDone() so the parent screen can swap to the reveal phase. Each tick
// pulses a scale animation so the number lands with a beat.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { styles } from '../../screens/WriteAndScanScreenStyles';

interface Props {
  onDone: () => void;
}

export const CountdownOverlay = ({ onDone }: Props) => {
  const [n, setN] = useState(3);
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const id = setInterval(() => {
      setN(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeout(onDone, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
    return () => clearInterval(id);
  }, [onDone]);

  useEffect(() => {
    scale.setValue(0.4);
    Animated.timing(scale, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    }).start();
  }, [n, scale]);

  return (
    <View style={styles.countdownWrap}>
      <Text style={styles.countdownHeading}>Get ready!</Text>
      <Animated.Text style={[styles.countdownNumber, { transform: [{ scale }] }]}>
        {n === 0 ? 'GO!' : n}
      </Animated.Text>
      <Text style={styles.countdownTip}>Watch carefully — you&apos;ll need to spell it</Text>
    </View>
  );
};
