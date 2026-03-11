/// <reference types="nativewind/types" />
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppRoutes } from './src/navigation/AppRoutes';

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <AppRoutes />
  </GestureHandlerRootView>
);

export default App;
