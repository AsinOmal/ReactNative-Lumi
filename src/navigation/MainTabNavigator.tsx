/**
 * MainTabNavigator.tsx
 *
 * 4-tab navigation: Home | Scan | Playground | Settings
 *
 * Scan sits at index 1 — the custom tab bar hides itself on that screen
 * so the camera view is fully immersive (no overlapping UI).
 *
 * The Scan button is kept visually elevated (floating circle) since it's
 * the primary interaction. Phase 9 will give all tabs the full bubbly treatment.
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { PlaygroundScreen } from '../screens/PlaygroundScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { styles } from './MainTabNavigatorStyles';

const TABS = [
  { name: 'Home',       iconActive: 'home',          iconInactive: 'home-outline',    label: 'Home' },
  { name: 'Scan',       iconActive: 'camera',         iconInactive: 'camera',          label: '' },
  { name: 'Playground', iconActive: 'game-controller', iconInactive: 'game-controller-outline', label: 'Play' },
  { name: 'Settings',   iconActive: 'settings',       iconInactive: 'settings-outline', label: 'Settings' },
];

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  if (state.index === 1) return null; // hide during camera scan

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.tabBarPill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TABS.find(t => t.name === route.name)!;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (route.name === 'Scan') {
            return (
              <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.85} style={styles.scanWrapper}>
                <View style={styles.scanGlow} />
                <View style={styles.scanCircle}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          const color = isFocused ? '#5B2DC0' : '#B0A8D0';
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7} style={styles.tabButton}>
              <Ionicons name={isFocused ? tab.iconActive : tab.iconInactive} size={22} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home"       component={HomeScreen} />
    <Tab.Screen name="Scan"       component={ScanScreen} />
    <Tab.Screen name="Playground" component={PlaygroundScreen} />
    <Tab.Screen name="Settings"   component={SettingsScreen} />
  </Tab.Navigator>
);
