import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeRouter, Route, Routes, useNavigate } from 'react-router-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroBox,
  ViroAmbientLight,
  ViroMaterials,
} from '@reactvision/react-viro';

// --- 1. Define AR Materials (So the box has color) ---
ViroMaterials.createMaterials({
  blueMaterial: {
    diffuseColor: '#4C71FF',
  },
});

// --- 2. The AR Scene (The 3D World) ---
const TestARScene = () => {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />

      {/* Floating Text */}
      <ViroText
        text="It Works!"
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0.5, -1]}
        style={styles.arTextStyle}
      />

      {/* A Blue 3D Box */}
      <ViroBox
        position={[0, -0.5, -1]}
        scale={[0.3, 0.3, 0.3]}
        materials={["blueMaterial"]}
        animation={{name: "rotate", run: true, loop: true}}
      />
    </ViroARScene>
  );
};

// --- 3. Home Screen (Tests NativeWind & Navigation) ---
const Home = () => {
  const navigate = useNavigate();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="p-6 bg-slate-100 rounded-2xl items-center shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          ViroStarterKit
        </Text>
        <Text className="text-gray-500 mb-8">
          Build: iOS | RN 0.73.3
        </Text>

        <TouchableOpacity
          onPress={() => navigate('/ar')}
          className="bg-purple-600 px-10 py-4 rounded-xl active:bg-purple-700"
        >
          <Text className="text-white font-bold text-lg">
            Start AR Camera
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- 4. AR Screen Wrapper ---
const ARScreen = () => {
  const navigate = useNavigate();

  return (
    <View className="flex-1">
      {/* The AR Camera View */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: TestARScene,
        }}
        style={{ flex: 1 }}
      />

      {/* Overlay Back Button */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() => navigate('/')}
          className="bg-red-500 px-8 py-3 rounded-full opacity-90"
        >
          <Text className="text-white font-bold text-lg">Exit AR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- 5. Main App Entry ---
const App = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ar" element={<ARScreen />} />
      </Routes>
    </NativeRouter>
  );
};

// Note: ViroText needs standard StyleSheet, NativeWind doesn't apply inside the 3D scene.
const styles = StyleSheet.create({
  arTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

export default App;
