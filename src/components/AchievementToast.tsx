/**
 * AchievementToast.tsx
 *
 * Slides up from the bottom when a new achievement is earned.
 * Auto-dismisses after 3 seconds. Queues multiple achievements.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import type { Achievement } from '../utils/achievementRegistry';

interface Props {
  queue: Achievement[];
  onDismissed: () => void; // called when the front of the queue is done
}

export const AchievementToast: React.FC<Props> = ({ queue, onDismissed }) => {
  const slideAnim = useRef(new Animated.Value(120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [current, setCurrent] = useState<Achievement | null>(null);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (queue.length === 0) return;
    setCurrent(queue[0]);
    lottieRef.current?.reset();
    lottieRef.current?.play();

    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 3s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        slideAnim.setValue(120);
        opacityAnim.setValue(0);
        setCurrent(null);
        onDismissed();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [queue]);

  if (!current) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <LottieView
        ref={lottieRef}
        source={require('../assets/lottie/trophy.json')}
        loop={false}
        style={styles.lottie}
      />
      <View style={styles.textBlock}>
        <Text style={styles.label}>Achievement Unlocked!</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E0A42',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.6)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  lottie: {
    width: 56,
    height: 56,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 11,
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  description: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});
