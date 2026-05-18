/**
 * AuthNavigator.tsx
 *
 * Self-contained pre-sign-in flow: Login → Register / ForgotPassword.
 * Owns its own NavigationContainer because AppRoutes early-returns this
 * component when there is no user, so the main NavigationContainer never
 * mounts at the same time — no nested-container conflict.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

const Stack = createStackNavigator();

export const AuthNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
