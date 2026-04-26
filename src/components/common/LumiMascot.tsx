import React from 'react';
import LottieView from 'lottie-react-native';

interface Props {
  state?: 'idle' | 'celebrate';
  size?: number;
}

const ANIMATIONS = {
  idle:      require('../../assets/lottie/mascot_idle2.json'),
  celebrate: require('../../assets/lottie/mascot_celebration.json'),
};

export const LumiMascot: React.FC<Props> = ({ state = 'idle', size = 80 }) => (
  <LottieView
    source={ANIMATIONS[state]}
    autoPlay
    loop={state === 'idle'}
    style={{ width: size, height: size }}
  />
);
