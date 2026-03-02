import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// ── Custom Tab Bar ─────────────────────────────────────
const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Home',    iconActive: 'home',           iconInactive: 'home-outline',    label: 'Home' },
    { name: 'Scan',    iconActive: 'camera',         iconInactive: 'camera',          label: '' },   // center
    { name: 'Profile', iconActive: 'person',         iconInactive: 'person-outline',  label: 'Profile' },
  ];

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.tabBarPill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = route.name === 'Scan';
          const tab = tabs.find(t => t.name === route.name)!;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // ── Center Scan Button ──
          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.85}
                style={styles.centerButtonWrapper}
              >
                {/* Outer glow ring */}
                <View style={styles.centerGlow} />
                <View style={styles.centerButtonCircle}>
                  <Ionicons name="camera" size={26} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          // ── Side Tabs ──
          const iconColor = isFocused ? '#5B2DC0' : '#B0A8D0';
          const iconName = isFocused ? tab.iconActive : tab.iconInactive;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <Ionicons name={iconName} size={24} color={iconColor} />
              <Text style={[styles.tabLabel, { color: iconColor }]}>{tab.label}</Text>
              {/* Active dot indicator */}
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Navigator ──────────────────────────────────────────
const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  tabBarPill: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#5B2DC0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 11,
    marginTop: 2,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#5B2DC0',
    marginTop: 2,
  },
  // Center Scan button
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  centerGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5B2DC0',
    opacity: 0.2,
    top: -4,
  },
  centerButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5B2DC0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#5B2DC0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 14,
      },
      android: { elevation: 14 },
    }),
  },
});
