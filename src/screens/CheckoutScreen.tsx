// 📖 What this does:
// Confirmation sheet for premium pack purchases. Replaces the older card-entry
// form — since this is a simulated payment, asking the user to type a fake
// card number is friction, not security. Three states: idle → processing →
// success. On success the pack is added to usePurchaseStore (persisted) and
// the Firestore /users/{uid}/purchases/{packId} doc is written.
// Designed to be swapped for real StoreKit / Google Play IAP at publish time.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../types/pack';
import {
  simulatePurchase,
  PaymentError,
} from '../services/mockPurchaseService';
import { useStrings } from '../hooks/useStrings';
import { getPackAccent } from '../constants/packAccents';
import { colors } from '../constants/colors';
import { styles } from './CheckoutScreenStyles';

type CheckoutState = 'idle' | 'processing' | 'success' | 'error';

export const CheckoutScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { pack } = useRoute().params as { pack: Pack };
  const accent = getPackAccent(pack.id);

  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const heroUri = pack.coverImageUrl ?? pack.gateImageUrl;

  const handlePurchase = async () => {
    if (state !== 'idle' && state !== 'error') {
      return;
    }
    setState('processing');
    try {
      await simulatePurchase(pack.id);
      setState('success');
      setTimeout(() => navigation.goBack(), 1800);
    } catch (e) {
      setErrorMsg(
        e instanceof PaymentError ? e.message : strings.CHECKOUT_ERROR
      );
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="checkmark-circle" size={88} color={accent} />
        <Text style={styles.successTitle}>{strings.CHECKOUT_SUCCESS}</Text>
        <Text style={styles.successSub}>
          {strings.CHECKOUT_UNLOCK_BENEFIT(pack.wordCount)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Close checkout"
      >
        <Ionicons name="close" size={26} color={colors.textDark} />
      </TouchableOpacity>

      <View style={styles.sheet}>
        <View style={styles.heroWrap}>
          {heroUri ? (
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImg}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImg, { backgroundColor: accent }]}>
              <Ionicons
                name="cube-outline"
                size={48}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          )}
        </View>

        <Text style={styles.title}>{strings.CHECKOUT_TITLE}</Text>
        <Text style={styles.packName}>{pack.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>One-time price</Text>
          <Text style={styles.priceValue}>{strings.PACK_PRICE}</Text>
        </View>

        <View style={styles.bullets}>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color={accent} />
            <Text style={styles.bulletText}>
              {pack.wordCount} new 3D models scannable in AR
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color={accent} />
            <Text style={styles.bulletText}>
              Unlocks permanently on this account
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color={accent} />
            <Text style={styles.bulletText}>
              Works on all your signed-in devices
            </Text>
          </View>
        </View>

        <Text style={styles.simNotice}>
          {strings.CHECKOUT_SIMULATED_NOTICE}
        </Text>

        {state === 'error' && <Text style={styles.errorText}>{errorMsg}</Text>}

        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: accent },
            state === 'processing' && styles.ctaDisabled,
          ]}
          onPress={handlePurchase}
          disabled={state === 'processing'}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {state === 'processing' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-open-outline" size={20} color="#fff" />
              <Text style={styles.ctaText}>
                {strings.PREMIUM_GATE_CTA(strings.PACK_PRICE)}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          disabled={state === 'processing'}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
