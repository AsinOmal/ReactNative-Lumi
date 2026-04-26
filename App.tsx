/// <reference types="nativewind/types" />
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppRoutes } from './src/navigation/AppRoutes';
import { useScreenTime } from './src/hooks/useScreenTime';

// Mount useScreenTime at the root so session tracking starts immediately after
// app launch and flushes reliably on background/foreground transitions.
const AppInner = () => {
  useScreenTime();
  return <AppRoutes />;
};

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
