// 📖 What this does:
// Renders the Lumi mascot in one of 7 emotional states using Lottie.
// Why a single component: keeps state-to-asset mapping centralised so screens
// only think in terms of mood ("excited") instead of file paths.
// Loop policy: only ambient/idle moods loop (idle, wave, sleep). Reactive
// moods (excited/happy/sad/celebrate) play once so they read as a beat,
// not a vibe — caller can re-mount or swap state to replay.
//
// `repeat` overrides the default loop policy with a finite play count. Used
// on auth screens where an endlessly-looping mascot is distracting but a
// dead-frozen one feels lifeless — 3–5 plays gives motion without churn.

import React, { useCallback, useRef } from 'react';
import LottieView from 'lottie-react-native';

export type MascotState =
  | 'idle'
  | 'wave'
  | 'sleep'
  | 'excited'
  | 'sad'
  | 'happy'
  | 'celebrate';

interface Props {
  state?: MascotState;
  size?: number;
  repeat?: number; // finite play count; overrides the default loop policy
}

const ANIMATIONS: Record<MascotState, ReturnType<typeof require>> = {
  idle: require('../../assets/lottie/mascot_idle2.json'),
  wave: require('../../assets/lottie/mascot_idle2.json'),
  sleep: require('../../assets/lottie/sleep-mascot.json'),
  excited: require('../../assets/lottie/excited-mascot.json'),
  sad: require('../../assets/lottie/sad-mascot.json'),
  happy: require('../../assets/lottie/happy-mascot.json'),
  celebrate: require('../../assets/lottie/mascot_celebration.json'),
};

const LOOPING_STATES: ReadonlyArray<MascotState> = ['idle', 'wave', 'sleep'];

export const LumiMascot: React.FC<Props> = ({
  state = 'idle',
  size = 80,
  repeat,
}) => {
  const ref = useRef<LottieView | null>(null);
  const playCount = useRef(0);

  // When repeat is set we drive playback ourselves via onAnimationFinish so
  // we can stop after N plays. autoPlay + loop={false} + manual replay keeps
  // the first play uninterrupted (no setTimeout dance, no perceptible pause
  // between loops on devices that schedule slowly).
  const onFinish = useCallback(() => {
    if (!repeat) {
      return;
    }
    playCount.current += 1;
    if (playCount.current < repeat) {
      ref.current?.play();
    }
  }, [repeat]);

  return (
    <LottieView
      ref={ref}
      source={ANIMATIONS[state]}
      autoPlay
      loop={repeat ? false : LOOPING_STATES.includes(state)}
      onAnimationFinish={onFinish}
      style={{ width: size, height: size, backgroundColor: 'transparent' }}
    />
  );
};
