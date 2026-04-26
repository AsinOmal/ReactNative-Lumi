import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useScreenTime } from '../hooks/useScreenTime';
import { ScreenTimeLimitModal } from '../components/ScreenTimeLimitModal';
import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SavedWordsScreen } from '../screens/SavedWordsScreen';
import { ARWordFindScreen } from '../screens/ARWordFindScreen';
import { ParentDashboardScreen } from '../screens/ParentDashboardScreen';
import { PackDetailScreen } from '../screens/PackDetailScreen';
import { PackARPreviewScreen } from '../screens/PackARPreviewScreen';
import { MakeAMealScreen } from '../screens/MakeAMealScreen';
import { ScanAndCountScreen } from '../screens/ScanAndCountScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { createUserIfNew } from '../services/userService';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';

const Stack = createStackNavigator();

export const AppRoutes = () => {
  const { user, initializing, setUser, setInitializing } = useAuthStore();
  const { loadSettings, isParentUnlocked } = useParentalControlsStore();
  const { isAtLimit, todayMinutes, dailyLimitMinutes } = useScreenTime();

  useEffect(() => {
    const authInstance = getAuth(getApp());
    const subscriber = onAuthStateChanged(authInstance, async (userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);

      if (userState) {
        try {
          await createUserIfNew(userState);
        } catch (e) {
          console.warn('Firestore user create failed:', e);
        }
        // Load parental settings so mergedBlocklist is ready before first OCR frame
        try {
          await loadSettings(userState.uid);
        } catch (e) {
          console.warn('Parental settings load failed:', e);
        }
      }
    });
    return subscriber;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5B2DC0" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open:  { animation: 'spring', config: { stiffness: 280, damping: 26, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
          close: { animation: 'spring', config: { stiffness: 280, damping: 26, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
        },
      }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="SavedWords" component={SavedWordsScreen} />
        <Stack.Screen name="ARWordFind" component={ARWordFindScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="PackDetail" component={PackDetailScreen} />
        <Stack.Screen name="PackARPreview" component={PackARPreviewScreen} />
        <Stack.Screen name="MakeAMeal" component={MakeAMealScreen} />
        <Stack.Screen name="ScanAndCount" component={ScanAndCountScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
      <ScreenTimeLimitModal
        visible={isAtLimit && !isParentUnlocked}
        todayMinutes={todayMinutes}
        limitMinutes={dailyLimitMinutes}
        onUnlocked={() => {}}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
