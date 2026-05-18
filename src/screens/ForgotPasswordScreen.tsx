// 📖 What this does:
// Card-centric "send me a reset link" screen — matches Login/Register chrome
// (background, mascot-over-cream-card, gradient CTA) so a parent moving
// through the auth flow doesn't experience layout jitter. After success the
// card switches to a confirmation state ("Check your inbox") rather than a
// transient toast, so slow networks can still verify the action fired.

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
import { WoodenSign } from '../components/home/WoodenSign';
import { AuthInput } from '../components/auth/AuthInput';
import {
  sendPasswordReset,
  FriendlyAuthError,
} from '../services/emailAuthService';
import { useStrings } from '../hooks/useStrings';
import { playUI } from '../utils/uiSound';
import { colors } from '../constants/colors';
import { styles } from './LoginScreenStyles';

const BG_IMAGE = require('../assets/backgrounds/login,reg-bg.png');

export const ForgotPasswordScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    playUI('tap');
    setError('');
    if (!email.trim()) {
      setError(strings.AUTH_ERR_INVALID_EMAIL);
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email.trim(), strings);
      setSent(true);
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

            <View style={[styles.card, styles.cardNoMascot]}>
              <View style={styles.titleRow}>
                <Ionicons name="star" size={16} color={colors.accentYellow} />
                <Text style={styles.titleText}>{strings.FORGOT_TITLE}</Text>
                <Ionicons name="star" size={16} color={colors.accentYellow} />
              </View>
              <Text style={styles.subtitle}>
                {sent ? strings.FORGOT_SENT : strings.FORGOT_BODY}
              </Text>

              {!sent && (
                <View style={styles.form}>
                  <AuthInput
                    iconName="mail-outline"
                    placeholder={strings.AUTH_EMAIL_PLACEHOLDER}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (error) {
                        setError('');
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                    error={!!error}
                  />
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      loading && styles.primaryBtnDisabled,
                    ]}
                    onPress={onSubmit}
                    disabled={loading}
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
                          {strings.FORGOT_SEND_CTA}
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
              )}

              {sent && (
                <View style={styles.form}>
                  <View style={styles.sentBadgeRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={48}
                      color={colors.successDark}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.belowCard}>
              <View style={styles.linkRow}>
                <TouchableOpacity
                  onPress={() => {
                    playUI('tap');
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.linkAction}>
                    {strings.FORGOT_BACK_TO_LOGIN}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
