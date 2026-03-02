import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { LumiButton } from '../components/common/LumiButton';

export const LoginScreen = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '991654335767-idkk7nq7qa6f4a5nspj5da0va1s26dnd.apps.googleusercontent.com',
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();

      const googleCredential = GoogleAuthProvider.credential(data?.idToken || '');
      const authInstance = getAuth(getApp());
      return signInWithCredential(authInstance, googleCredential);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-[#1A1A2E] items-center justify-center p-6">
      <View className="items-center mb-12">
        <Text className="text-white text-5xl font-lumi-spicy mt-4">Lumi</Text>
        <Text className="text-[#a0a0c0] font-lumi-regular text-lg mt-2 text-center">
          Bring words to life.
        </Text>
      </View>

      <View className="w-full max-w-sm space-y-4">
        <LumiButton 
          title="Sign in with Google" 
          onPress={onGoogleButtonPress}
        />
      </View>
    </View>
  );
};
