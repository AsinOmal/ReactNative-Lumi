// 📖 What this does:
// Card-centric register layout — same chrome as LoginScreen (background image,
// mascot-over-cream-card, gradient CTA, Google option) so a parent moving
// between sign-in and sign-up doesn't experience layout jitter. After register
// the user lands on EmailVerificationScreen via AppRoutes' verified-gate.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LumiMascot } from '../components/common/LumiMascot';
import { WoodenSign } from '../components/home/WoodenSign';
import { AuthInput } from '../components/auth/AuthInput';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import {
  registerWithEmail,
  FriendlyAuthError,
} from '../services/emailAuthService';
import { useStrings } from '../hooks/useStrings';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { colors } from '../constants/colors';
import { playUI } from '../utils/uiSound';
import { styles } from './LoginScreenStyles';

const BG_IMAGE = require('../assets/backgrounds/login,reg-bg.png');

export const RegisterScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInGoogle, loading: googleLoading } = useGoogleSignIn(
    setError,
    strings.AUTH_ERR_GENERIC
  );
  const anyLoading = loading || googleLoading;
  const clearErr = () => error && setError('');

  const onSubmit = async () => {
    playUI('tap');
    setError('');
    if (!email.trim() || !password || !confirm) {
      setError(strings.AUTH_ERR_GENERIC);
      return;
    }
    if (password !== confirm) {
      setError(strings.AUTH_ERR_PASSWORDS_MISMATCH);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, displayName, strings);
    } catch (e) {
      setError(
        e instanceof FriendlyAuthError ? e.message : strings.AUTH_ERR_GENERIC
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 4 }]}
        onPress={() => {
          playUI('tap');
          navigation.goBack();
        }}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={28} color={colors.textDark} />
      </TouchableOpacity>
      <KeyboardAvoidingView
        style={styles.bg}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 12 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.content}>
            <View style={styles.logoWrap}>
              <WoodenSign />
            </View>
            <View style={styles.mascotOverlap}>
              <LumiMascot state="happy" size={120} repeat={4} />
            </View>

            <View style={styles.card}>
              <View style={styles.titleRow}>
                <Ionicons name="star" size={16} color={colors.accentYellow} />
                <Text style={styles.titleText}>
                  {strings.AUTH_REGISTER_TITLE}
                </Text>
                <Ionicons name="star" size={16} color={colors.accentYellow} />
              </View>
              <Text style={styles.subtitle}>
                {strings.AUTH_REGISTER_SUBTITLE}
              </Text>

              <View style={styles.form}>
                <AuthInput
                  iconName="person-outline"
                  placeholder={strings.AUTH_DISPLAY_NAME_PLACEHOLDER}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <AuthInput
                  iconName="mail-outline"
                  placeholder={strings.AUTH_EMAIL_PLACEHOLDER}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    clearErr();
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  error={!!error}
                />
                <AuthInput
                  iconName="lock-closed-outline"
                  isPassword
                  placeholder={strings.AUTH_PASSWORD_PLACEHOLDER}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    clearErr();
                  }}
                  autoCapitalize="none"
                  returnKeyType="next"
                  error={!!error}
                />
                <AuthInput
                  iconName="shield-checkmark-outline"
                  isPassword
                  placeholder={strings.AUTH_PASSWORD_CONFIRM_PLACEHOLDER}
                  value={confirm}
                  onChangeText={(v) => {
                    setConfirm(v);
                    clearErr();
                  }}
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  error={!!error}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    anyLoading && styles.primaryBtnDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={anyLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FFB347', '#FF9A2E', '#E07B00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.primaryBtnGradient}
                  >
                    <Ionicons
                      name="star"
                      size={11}
                      color="rgba(255,255,255,0.55)"
                      style={styles.primaryStarLeft}
                    />
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        {strings.AUTH_CREATE_ACCOUNT_CTA}
                      </Text>
                    )}
                    <Ionicons
                      name="star"
                      size={9}
                      color="rgba(255,255,255,0.45)"
                      style={styles.primaryStarRight}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{strings.AUTH_OR}</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleSignInButton
                onPress={signInGoogle}
                loading={googleLoading}
                disabled={anyLoading}
              />
            </View>

            <View style={styles.belowCard}>
              <View style={styles.linkRow}>
                <Text style={styles.linkText}>{strings.AUTH_HAS_ACCOUNT}</Text>
                <TouchableOpacity
                  onPress={() => {
                    playUI('tap');
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.linkAction}>
                    {strings.AUTH_SIGN_IN_LINK}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.termsRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={12}
                  color={colors.textMid}
                />
                <Text style={styles.termsText}>
                  {strings.AUTH_TERMS_FOOTER}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
