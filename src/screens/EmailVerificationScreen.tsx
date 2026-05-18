// 📖 What this does:
// Card-centric "check your inbox" gate shown to email/password users until
// they tap the link Firebase sent. Matches Login/Register chrome (background
// image, mascot-over-cream-card, gradient CTA) so the auth flow feels like a
// single coherent journey.
//
// Why a 60s resend cooldown:
//   Firebase rate-limits sendEmailVerification per-user; hammering it returns
//   auth/too-many-requests. A visible client-side timer keeps users from
//   tapping repeatedly and seeing an unhelpful error.
//
// Why we poll on tap (not auto):
//   Firebase doesn't push when the user verifies — we have to call user.reload()
//   and re-check the flag. Auto-polling every few seconds wastes battery and
//   API quota; an explicit "I've verified" button gives the user agency.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { LumiMascot } from '../components/common/LumiMascot';
import { WoodenSign } from '../components/home/WoodenSign';
import {
  resendVerificationEmail,
  reloadCurrentUser,
  FriendlyAuthError,
} from '../services/emailAuthService';
import { useAuthStore } from '../store/useAuthStore';
import { useStrings } from '../hooks/useStrings';
import { playUI } from '../utils/uiSound';
import { colors } from '../constants/colors';
import { styles } from './LoginScreenStyles';

const BG_IMAGE = require('../assets/backgrounds/login,reg-bg.png');
const RESEND_COOLDOWN_S = 60;

export const EmailVerificationScreen = () => {
  const strings = useStrings();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState<'check' | 'resend' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onCheck = async () => {
    playUI('tap');
    setError('');
    setMessage('');
    setBusy('check');
    try {
      const fresh = await reloadCurrentUser();
      if (fresh?.emailVerified) {
        setUser(fresh);
      } else {
        setError(strings.VERIFY_NOT_YET);
      }
    } catch {
      setError(strings.AUTH_ERR_GENERIC);
    } finally {
      setBusy(null);
    }
  };

  const onResend = async () => {
    playUI('tap');
    if (cooldown > 0) {
      return;
    }
    setError('');
    setMessage('');
    setBusy('resend');
    try {
      await resendVerificationEmail(strings);
      setMessage(strings.VERIFY_RESENT_TOAST);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (e) {
      setError(
        e instanceof FriendlyAuthError ? e.message : strings.AUTH_ERR_GENERIC
      );
    } finally {
      setBusy(null);
    }
  };

  const onUseDifferent = async () => {
    playUI('tap');
    try {
      await signOut(getAuth(getApp()));
    } catch {
      /* ignore */
    }
  };

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <WoodenSign />
          </View>
          <View style={styles.mascotOverlap}>
            <LumiMascot state="sad" size={120} repeat={4} />
          </View>

          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Ionicons name="star" size={16} color={colors.accentYellow} />
              <Text style={styles.titleText}>{strings.VERIFY_TITLE}</Text>
              <Ionicons name="star" size={16} color={colors.accentYellow} />
            </View>
            <Text style={styles.subtitle}>
              {strings.VERIFY_BODY} {user?.email ?? ''}
            </Text>
            <Text style={styles.verifyHint}>{strings.VERIFY_HINT}</Text>

            {message ? <Text style={styles.verifyOk}>{message}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.form}>
              <TouchableOpacity
                style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
                onPress={onCheck}
                disabled={!!busy}
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
                  {busy === 'check' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {strings.VERIFY_CHECK_CTA}
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

              <TouchableOpacity
                style={[
                  styles.googleBtn,
                  (!!busy || cooldown > 0) && styles.primaryBtnDisabled,
                ]}
                onPress={onResend}
                disabled={!!busy || cooldown > 0}
                activeOpacity={0.85}
              >
                {busy === 'resend' ? (
                  <ActivityIndicator color="#222" />
                ) : (
                  <>
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={colors.textDark}
                    />
                    <Text style={styles.googleBtnText}>
                      {cooldown > 0
                        ? strings.VERIFY_RESEND_COOLDOWN(cooldown)
                        : strings.VERIFY_RESEND_CTA}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.belowCard}>
            <View style={styles.linkRow}>
              <TouchableOpacity onPress={onUseDifferent}>
                <Text style={styles.linkAction}>
                  {strings.VERIFY_USE_DIFFERENT}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};
