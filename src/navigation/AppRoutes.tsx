import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router";
import { HomeScreen } from "../screens/HomeScreen";
import { ScanScreen } from "../screens/ScanScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { useAuthStore } from "../store/useAuthStore";
import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';

export const AppRoutes = () => {
  const { user, initializing, setUser, setInitializing } = useAuthStore();

  useEffect(() => {
    const authInstance = getAuth(getApp());
    const subscriber = onAuthStateChanged(authInstance, (userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 bg-[#1A1A2E] items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<LoginScreen />} />
      ) : (
        <>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};
