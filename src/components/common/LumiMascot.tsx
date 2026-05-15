// 📖 What this does:
// Renders the Lumi mascot in one of 7 emotional states using Lottie.
// Why a single component: keeps state-to-asset mapping centralised so screens
// only think in terms of mood ("excited") instead of file paths.
// Loop policy: only ambient/idle moods loop (idle, wave, sleep). Reactive
// moods (excited/happy/sad/celebrate) play once so they read as a beat,
// not a vibe — caller can re-mount or swap state to replay.

import React from "react";
import LottieView from "lottie-react-native";

export type MascotState =
  | "idle"
  | "wave"
  | "sleep"
  | "excited"
  | "sad"
  | "happy"
  | "celebrate";

interface Props {
  state?: MascotState;
  size?: number;
}

const ANIMATIONS: Record<MascotState, ReturnType<typeof require>> = {
  idle: require("../../assets/lottie/mascot_idle2.json"),
  wave: require("../../assets/lottie/mascot_idle2.json"),
  sleep: require("../../assets/lottie/sleep-mascot.json"),
  excited: require("../../assets/lottie/excited-mascot.json"),
  sad: require("../../assets/lottie/sad-mascot.json"),
  happy: require("../../assets/lottie/happy-mascot.json"),
  celebrate: require("../../assets/lottie/mascot_celebration.json"),
};

const LOOPING_STATES: ReadonlyArray<MascotState> = ["idle", "wave", "sleep"];

export const LumiMascot: React.FC<Props> = ({ state = "idle", size = 80 }) => (
  <LottieView
    source={ANIMATIONS[state]}
    autoPlay
    loop={LOOPING_STATES.includes(state)}
    style={{ width: size, height: size, backgroundColor: 'transparent' }}
  />
);
