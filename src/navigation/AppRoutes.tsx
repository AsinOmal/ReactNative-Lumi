import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useScreenTime } from '../hooks/useScreenTime';
import { useBootstrapSession } from '../hooks/useBootstrapSession';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useDevRemoteModelsSync } from '../hooks/useDevRemoteModelsSync';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { ScreenTimeLimitModal } from '../components/ScreenTimeLimitModal';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SavedWordsScreen } from '../screens/SavedWordsScreen';
import { ARWordFindScreen } from '../screens/ARWordFindScreen';
import { ParentDashboardScreen } from '../screens/ParentDashboardScreen';
import { PackDetailScreen } from '../screens/PackDetailScreen';
import { PackARPreviewScreen } from '../screens/PackARPreviewScreen';
import { PackGateScreen } from '../screens/PackGateScreen';
import { PremiumPackGateScreen } from '../screens/PremiumPackGateScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { MakeAMealScreen } from '../screens/MakeAMealScreen';
import { ScanAndCountScreen } from '../screens/ScanAndCountScreen';
import { WriteAndScanScreen } from '../screens/WriteAndScanScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppIntroScreen } from '../screens/AppIntroScreen';
import { hasSeenOnboarding } from '../utils/onboardingStore';
import { scheduleStreakReminder } from '../services/notificationService';
import { useLanguageStore } from '../store/useLanguageStore';
import { useStrings } from '../hooks/useStrings';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

const Stack = createStackNavigator();

const SPRING = { animation: 'spring' as const, config: { stiffness: 280, damping: 26, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } };

export const AppRoutes = () => {
  const { user } = useAuthStore();
  const { isParentUnlocked } = useParentalControlsStore();
  const introSeen = useLanguageStore(s => s.introSeen);
  const strings = useStrings();
  const { isAtLimit, todayMinutes, dailyLimitMinutes } = useScreenTime();
  const { initializing, suspendedError } = useBootstrapSession();
  const appConfig = useRemoteContentStore(s => s.appConfig);
  useRemoteConfig(!!user);
  useDevRemoteModelsSync();
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [showOnboarding, setShowOnboarding]   = useState(false);

  useEffect(() => {
    hasSeenOnboarding().then(seen => {
      setShowOnboarding(!seen);
      setOnboardingReady(true);
    });
    scheduleStreakReminder();
  }, []);

  if (initializing || !onboardingReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5B2DC0" />
      </View>
    );
  }

  if (suspendedError) {
    return (
      <View style={styles.suspended}>
        <Text style={styles.suspendedTitle}>Account Suspended</Text>
        <Text style={styles.suspendedBody}>
          Your account has been suspended. Please contact support if you believe this is an error.
        </Text>
      </View>
    );
  }

  if (showOnboarding && appConfig?.newUserOnboarding !== false) return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  if (!user) return <LoginScreen />;
  // Show the intro guide once after the main onboarding completes.
  if (!introSeen) return <AppIntroScreen />;

  if (appConfig?.maintenanceMode) {
    return (
      <View style={styles.suspended}>
        <Text style={styles.suspendedTitle}>{strings.maintenanceModeTitle}</Text>
        <Text style={styles.suspendedBody}>{strings.maintenanceModeBody}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, transitionSpec: { open: SPRING, close: SPRING } }}>
        <Stack.Screen name="MainTabs"      component={MainTabNavigator} />
        <Stack.Screen name="Achievements"  component={AchievementsScreen} />
        <Stack.Screen name="SavedWords"    component={SavedWordsScreen} />
        <Stack.Screen name="ARWordFind"    component={ARWordFindScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="PackDetail"    component={PackDetailScreen} />
        <Stack.Screen name="PackARPreview" component={PackARPreviewScreen} />
        <Stack.Screen name="PackGate"         component={PackGateScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="PremiumPackGate" component={PremiumPackGateScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="Checkout"         component={CheckoutScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="MakeAMeal"     component={MakeAMealScreen} />
        <Stack.Screen name="ScanAndCount"  component={ScanAndCountScreen} />
        <Stack.Screen name="WriteAndScan"  component={WriteAndScanScreen} />
        <Stack.Screen name="Scan"          component={ScanScreen} />
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
  loading: { flex: 1, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' },
  suspended: { flex: 1, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  suspendedTitle: { fontFamily: 'Fredoka-Bold', fontSize: 26, color: '#1A0A4B', textAlign: 'center' },
  suspendedBody:  { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#7B5EA7', textAlign: 'center', lineHeight: 24 },
});
