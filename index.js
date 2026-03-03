/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import {ViroAnimations} from '@reactvision/react-viro';
import App from './App';
import {name as appName} from './app.json';

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
