/**
 * @format
 */

// ── Suppress known React Navigation / Old-Architecture animation noise ────────
// "Sending 'onAnimatedValueUpdate' with no listeners registered" fires when the
// native animation driver sends a callback after the JS listener has unmounted
// (e.g. during stack screen transitions). It is harmless but fills the log.
const _origWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('onAnimatedValueUpdate')
  ) {
    return;
  }
  _origWarn(...args);
};
// ─────────────────────────────────────────────────────────────────────────────

import { AppRegistry, LogBox } from 'react-native';

// Suppress in-app log overlays (yellow/red banners) — logs still appear in Metro terminal
LogBox.ignoreAllLogs();
import { enableScreens } from 'react-native-screens';
import { ViroAnimations } from '@reactvision/react-viro';
import App from './App';
import { name as appName } from './app.json';

// Register AR animations once at startup — before any AR scene mounts
ViroAnimations.registerAnimations({
  rotate: {
    properties: { rotateY: '+=360' },
    duration: 5000,
    easing: 'Linear',
  },
});

enableScreens();
AppRegistry.registerComponent(appName, () => App);
