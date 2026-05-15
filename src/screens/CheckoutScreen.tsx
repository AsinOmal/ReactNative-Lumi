// 📖 What this does:
// Mock card-entry checkout for premium pack purchases.
// Four states: idle → processing (2s) → success → error.
// On success the pack is added to usePurchaseStore (persisted) and the
// Firestore /users/{uid}/purchases/{packId} doc is written.
// Designed to be swapped for real StoreKit / Google Play IAP at publish time.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
import { colors } from '../constants/colors';
import { styles } from './CheckoutScreenStyles';

type CheckoutState = 'idle' | 'processing' | 'success' | 'error';

export const CheckoutScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { pack } = useRoute().params as { pack: Pack };

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    expiry.length >= 4 &&
    cvv.length >= 3;

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2
      ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
      : digits;
  };

  const handlePurchase = async () => {
    if (!isValid || state !== 'idle') {
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
        <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
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
      >
        <Ionicons name="chevron-back" size={26} color={colors.textDark} />
      </TouchableOpacity>

      <Text style={styles.title}>{strings.CHECKOUT_TITLE}</Text>
      <Text style={styles.packName}>{pack.name}</Text>
      <Text style={styles.price}>{strings.PACK_PRICE}</Text>
      <Text style={styles.simNotice}>{strings.CHECKOUT_SIMULATED_NOTICE}</Text>

      <TextInput
        style={styles.input}
        placeholder={strings.CHECKOUT_CARD_NUMBER}
        placeholderTextColor={colors.textLight}
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={(v) => setCardNumber(formatCard(v))}
        maxLength={19}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder={strings.CHECKOUT_EXPIRY}
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
          value={expiry}
          onChangeText={(v) => setExpiry(formatExpiry(v))}
          maxLength={7}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder={strings.CHECKOUT_CVV}
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
          value={cvv}
          onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
          maxLength={4}
          secureTextEntry
        />
      </View>

      {state === 'error' && <Text style={styles.errorText}>{errorMsg}</Text>}

      <TouchableOpacity
        style={[
          styles.ctaBtn,
          (!isValid || state === 'processing') && styles.ctaDisabled,
        ]}
        onPress={handlePurchase}
        disabled={!isValid || state === 'processing'}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        {state === 'processing' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>{strings.CHECKOUT_CTA}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
