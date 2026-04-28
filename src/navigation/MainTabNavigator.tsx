/**
 * MainTabNavigator.tsx
 *
 * 4 tabs + floating center Scan button:
 *   Home | Library | [● SCAN] | Playground | Settings
 *
 * The Scan button floats ABOVE the pill in a flex column — a negative
 * marginBottom equal to half its height makes it overlap the pill top edge.
 * A transparent scanSpacer inside the pill reserves the visual gap.
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlaygroundScreen } from '../screens/PlaygroundScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../constants/colors';
import { styles } from './MainTabNavigatorStyles';

const LEFT_TABS = [
  { name: 'Home',    iconActive: 'home',       iconInactive: 'home-outline',    label: 'Home' },
  { name: 'Library', iconActive: 'library',    iconInactive: 'library-outline', label: 'Library' },
];

const RIGHT_TABS = [
  { name: 'Playground', iconActive: 'game-controller',  iconInactive: 'game-controller-outline', label: 'Play' },
  { name: 'Settings',   iconActive: 'settings',         iconInactive: 'settings-outline',        label: 'Settings' },
];

const ScanButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.scanBtn} onPress={() => (navigation as any).navigate('Scan')} activeOpacity={0.85} accessibilityLabel="Open scanner" accessibilityRole="button">
      <Ionicons name="camera" size={28} color="#FFF" />
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const renderTab = (tabDef: (typeof LEFT_TABS)[0]) => {
    const route = state.routes.find(r => r.name === tabDef.name);
    if (!route) return null;
    const index = state.routes.indexOf(route);
    const isFocused = state.index === index;
    const iconColor = isFocused ? colors.primary : colors.tabInactive;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(tabDef.name);
    };

    return (
      <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7} style={styles.tabButton} accessibilityLabel={tabDef.label} accessibilityRole="tab">
        <View style={styles.tabInner}>
          <Ionicons name={isFocused ? tabDef.iconActive : tabDef.iconInactive} size={24} color={iconColor} />
          <Text style={[styles.tabLabel, { color: iconColor }]}>{tabDef.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom + 6 }]}>
      {/* Scan button sits above the pill — negative marginBottom overlaps the pill top */}
      <View style={styles.scanBtnOuter}>
        <ScanButton />
      </View>

      <View style={styles.tabBarPill}>
        {LEFT_TABS.map(renderTab)}
        {/* Transparent spacer keeps the visual gap under the scan button */}
        <View style={styles.scanSpacer} />
        {RIGHT_TABS.map(renderTab)}
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home"       component={HomeScreen} />
    <Tab.Screen name="Library"    component={LibraryScreen} />
    <Tab.Screen name="Playground" component={PlaygroundScreen} />
    <Tab.Screen name="Settings"   component={SettingsScreen} />
  </Tab.Navigator>
);
