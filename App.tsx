/// <reference types="nativewind/types" />
import React from 'react';
import { NativeRouter } from 'react-router-native';
import { AppRoutes } from './src/navigation/AppRoutes';
import { View } from 'react-native';

const App = () => {
  return (
    <NativeRouter>
      <View className="flex-1 bg-white">
        <AppRoutes />
      </View>
    </NativeRouter>
  );
};

export default App;
