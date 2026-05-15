import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import { LumiButton } from '../components/common/LumiButton';
import { LumiMascot } from '../components/common/LumiMascot';
import { WoodenSign } from '../components/home/WoodenSign';
import { SkyScene } from '../components/scenes/SkyScene';
import { styles } from './LoginScreenStyles';

const WEB_CLIENT_ID =
  '991654335767-idkk7nq7qa6f4a5nspj5da0va1s26dnd.apps.googleusercontent.com';

export const LoginScreen = () => {
  useEffect(() => {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { data } = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(
        data?.idToken || ''
      );
      return signInWithCredential(getAuth(getApp()), googleCredential);
    } catch (error) {
      console.error('[LoginScreen] Google sign-in failed:', error);
    }
  };

  return (
    <SkyScene>
      <View style={styles.content}>
        <WoodenSign />
        <View style={styles.mascotWrap}>
          <LumiMascot state="wave" size={200} />
        </View>
        <Text style={styles.tagline}>Bring words to life.</Text>
        <View style={styles.btnWrap}>
          <LumiButton
            title="Sign in with Google"
            icon="logo-google"
            onPress={onGoogleButtonPress}
          />
        </View>
      </View>
    </SkyScene>
  );
};
